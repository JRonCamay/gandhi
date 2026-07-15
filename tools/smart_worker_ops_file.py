import base64, difflib, hashlib, json, math, os, re, shutil, tempfile, time, uuid
from pathlib import Path

VERSION = "smart_worker_ops_file v0.3.0"


def sha_bytes(data):
    return hashlib.sha256(data).hexdigest()


def sha_file(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def is_inside(path, root):
    try:
        Path(path).resolve().relative_to(Path(root).resolve())
        return True
    except Exception:
        return False


def safe_path(raw_path, allowed_roots):
    if not raw_path:
        raise RuntimeError("missing path")
    path = Path(os.path.expandvars(str(raw_path))).expanduser().resolve()
    allowed = [Path(r).resolve() for r in allowed_roots]
    if not any(path == root or is_inside(path, root) for root in allowed):
        raise PermissionError(f"blocked path outside allowed roots: {path}")
    return path


def inspect_file(path):
    path = Path(path)
    if not path.exists():
        return {"exists": False, "path": str(path)}
    st = path.stat()
    info = {
        "exists": True,
        "path": str(path),
        "is_file": path.is_file(),
        "is_dir": path.is_dir(),
        "bytes": st.st_size,
        "mtime": st.st_mtime,
    }
    if path.is_file():
        info["sha256"] = sha_file(path)
    return info


def read_id(path, sha256):
    seed = f"{Path(path).resolve()}:{sha256}".encode("utf-8", "replace")
    return "READ-" + hashlib.sha256(seed).hexdigest()[:16]


def encode_cursor(data):
    raw = json.dumps(data, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return "READCUR-" + base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def decode_cursor(cursor):
    text = str(cursor or "")
    if not text.startswith("READCUR-"):
        raise RuntimeError("bad cursor")
    raw = text[len("READCUR-"):]
    raw += "=" * (-len(raw) % 4)
    return json.loads(base64.urlsafe_b64decode(raw.encode("ascii")).decode("utf-8"))


def similar_files(path, allowed_roots, limit=5):
    target = Path(path)
    parent = target.parent
    while not parent.exists() and parent != parent.parent:
        parent = parent.parent
    if not parent.exists() or not any(parent == Path(r).resolve() or is_inside(parent, r) for r in allowed_roots):
        return []
    want = target.name.lower()
    out = []
    for item in parent.iterdir():
        if item.is_dir():
            continue
        name = item.name.lower()
        score = difflib.SequenceMatcher(None, want, name).ratio()
        if target.suffix and item.suffix.lower() == target.suffix.lower():
            score += 0.08
        if name == want:
            score += 0.2
        if score >= 0.45:
            out.append({"path": str(item), "name": item.name, "reason": "similar filename", "score": round(min(score, 1.0), 3)})
    return sorted(out, key=lambda x: x["score"], reverse=True)[:limit]


def missing_result(path, allowed_roots):
    return {
        "state": "missing",
        "path": str(path),
        "exists": False,
        "suggestions": similar_files(path, allowed_roots),
        "next_action": "If a suggestion is intended, call file.read again with that suggested path.",
        "read_engine": "smart_worker",
    }


def looks_binary(path):
    with Path(path).open("rb") as f:
        sample = f.read(4096)
    return b"\x00" in sample


def language_guess(path):
    ext = Path(path).suffix.lower().lstrip(".")
    return {
        "py": "python",
        "js": "javascript",
        "ts": "typescript",
        "json": "json",
        "md": "markdown",
        "html": "html",
        "css": "css",
        "yml": "yaml",
        "yaml": "yaml",
    }.get(ext, ext or "text")


def text_and_meta(path, encoding="utf-8"):
    binary = looks_binary(path)
    if binary:
        return "", {"binary": True}
    text = Path(path).read_text(encoding=encoding, errors="replace")
    return text, {"binary": False, "total_chars": len(text), "line_count": len(text.splitlines())}


def function_list_from_text(text):
    funcs = []
    pattern = re.compile(r"\s*(?:async\s+)?def\s+([A-Za-z_]\w*)\s*\(|\s*(?:function\s+)?([A-Za-z_$][\w$]*)\s*\(")
    for line_no, line in enumerate(text.splitlines(), 1):
        match = pattern.match(line)
        if match:
            funcs.append({"line": line_no, "name": match.group(1) or match.group(2)})
    return funcs


def heading_list_from_text(text, limit=30):
    headings = []
    for line_no, line in enumerate(text.splitlines(), 1):
        if line.startswith("#"):
            headings.append({"line": line_no, "text": line[:200]})
            if len(headings) >= limit:
                break
    return headings


def backup_file(path):
    path = Path(path)
    backup_dir = path.parent / ".bak"
    backup_dir.mkdir(parents=True, exist_ok=True)
    backup = backup_dir / f"{path.name}.{time.strftime('%Y%m%d-%H%M%S')}.{uuid.uuid4().hex[:6]}.bak"
    shutil.copy2(path, backup)
    return backup


def atomic_write(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix=path.name + ".", suffix=".tmp", dir=path.parent)
    tmp = Path(tmp)
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(data)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)
    finally:
        if tmp.exists():
            tmp.unlink()


def run_file_write_smart(params, *, job=None, allowed_roots=(), now=None, step=None):
    now = now or (lambda: time.strftime("%Y-%m-%dT%H:%M:%S%z"))
    warnings = []
    steps = []
    raw_path = params.get("path")
    mode = str(params.get("mode") or "upsert").lower()
    encoding = str(params.get("encoding") or "utf-8")
    dry_run = bool(params.get("dry_run"))
    backup_enabled = params.get("backup")
    if backup_enabled is None:
        backup_enabled = True
    if mode not in ("create", "overwrite", "upsert"):
        raise RuntimeError("mode must be create, overwrite, or upsert")
    if "content" not in params and "text" not in params:
        raise RuntimeError("missing content")
    content = str(params.get("content") if "content" in params else params.get("text"))
    data = content.encode(encoding)
    wanted_hash = sha_bytes(data)

    def log(name, note="", data=None):
        entry = {"step": name, "note": note, "data": data or {}, "created_at": now()}
        steps.append(entry)
        if job and step:
            step(job, name, note, data)

    log("normalize_path", "Normalizing target path.", {"input": str(raw_path)})
    try:
        path = safe_path(raw_path, allowed_roots)
    except PermissionError as e:
        return {"state": "blocked", "operation": "file.write.smart", "path": str(raw_path), "verified": False, "error": str(e), "warnings": warnings, "steps": steps}

    if path.exists() and path.is_dir():
        return {"state": "blocked", "operation": "file.write.smart", "path": str(path), "verified": False, "error": "target is a directory", "warnings": warnings, "steps": steps}

    before = inspect_file(path)
    log("preflight", "Preflight inspection complete.", {"before": before, "mode": mode, "bytes_intended": len(data)})

    exists = before.get("exists", False)
    if mode == "create" and exists:
        return {"state": "conflict", "operation": "file.write.smart", "path": str(path), "verified": False, "error": "target exists in create mode", "before": before, "warnings": warnings, "steps": steps}
    if mode == "overwrite" and not exists:
        return {"state": "conflict", "operation": "file.write.smart", "path": str(path), "verified": False, "error": "target missing in overwrite mode", "before": before, "warnings": warnings, "steps": steps}

    expected = params.get("expected_sha256")
    if expected and before.get("sha256") != expected:
        return {"state": "conflict", "operation": "file.write.smart", "path": str(path), "verified": False, "error": "expected_sha256 mismatch", "expected_sha256": expected, "actual_sha256": before.get("sha256"), "before": before, "warnings": warnings, "steps": steps}

    action = "updated" if exists else "created"
    if dry_run:
        log("dry_run", "Dry run complete; no file changed.", {"action": action, "sha256": wanted_hash})
        return {"state": "dry_run", "operation": "file.write.smart", "path": str(path), "action": action, "bytes": len(data), "old_sha256": before.get("sha256"), "new_sha256": wanted_hash, "verified": False, "warnings": warnings, "steps": steps}

    backup_path = ""
    backup_sha = ""
    if exists and backup_enabled:
        backup = backup_file(path)
        backup_path = str(backup)
        backup_sha = sha_file(backup)
        log("backup", "Backup created.", {"backup_path": backup_path, "backup_sha256": backup_sha})

    log("temp_write", "Writing temp file and replacing target.", {"bytes": len(data)})
    try:
        atomic_write(path, data)
    except Exception:
        time.sleep(0.15)
        log("retry_replace", "Atomic write failed once; retrying.", {})
        atomic_write(path, data)

    after = inspect_file(path)
    log("readback", "Read-back verification complete.", {"after": after})
    verified = after.get("sha256") == wanted_hash
    rollback = None
    if not verified and backup_path:
        warnings.append("read-back mismatch; restoring backup")
        shutil.copy2(backup_path, path)
        rollback = {"restored": True, "backup_path": backup_path, "after_restore": inspect_file(path)}
        log("rollback", "Restored backup after verification failure.", rollback)

    state = action if verified else "error"
    return {
        "state": state,
        "operation": "file.write.smart",
        "path": str(path),
        "action": action,
        "bytes": len(data),
        "old_sha256": before.get("sha256"),
        "new_sha256": wanted_hash,
        "final_sha256": after.get("sha256"),
        "backup_path": backup_path,
        "backup_sha256": backup_sha,
        "verified": verified,
        "rollback": rollback,
        "warnings": warnings,
        "before": before,
        "after": after,
        "steps": steps,
    }


def run_file_info(params, *, allowed_roots=()):
    path = safe_path(params.get("path"), allowed_roots)
    info = inspect_file(path)
    if not info.get("exists"):
        raise RuntimeError("not found")
    info["read_engine"] = "smart_worker"
    return info


def run_file_read(params, *, allowed_roots=()):
    if params.get("cursor"):
        cur = decode_cursor(params.get("cursor"))
        params = {**cur, **params}
        params["path"] = cur["path"]
        if params.get("next") or params.get("continue"):
            params["part"] = int(cur.get("part", 1)) + 1
    path = safe_path(params.get("path"), allowed_roots)
    if not path.exists():
        return missing_result(path, allowed_roots)
    if not path.is_file():
        raise RuntimeError("not file")
    max_chars = int(params.get("maxChars") or params.get("max_chars") or 12000)
    encoding = params.get("encoding") or "utf-8"
    sha256 = sha_file(path)
    if params.get("sha256") and params.get("sha256") != sha256:
        return {"state": "changed", "path": str(path), "old_sha256": params.get("sha256"), "new_sha256": sha256, "error": "file changed since cursor was created", "next_action": "Restart file.read from part 1.", "read_engine": "smart_worker"}
    text, meta = text_and_meta(path, encoding)
    if meta.get("binary"):
        return {"state": "binary", "path": str(path), "bytes": path.stat().st_size, "sha256": sha256, "read_id": read_id(path, sha256), "binary": True, "content": "", "read_engine": "smart_worker"}
    mode = str(params.get("mode") or "").lower()
    if mode == "profile":
        preview_chars = int(params.get("previewChars") or params.get("preview_chars") or min(max_chars, 4000))
        return {"state": "profile", "path": str(path), "bytes": path.stat().st_size, "sha256": sha256, "read_id": read_id(path, sha256), "language": language_guess(path), "preview": text[:preview_chars], "returned_chars": min(len(text), preview_chars), "total_chars": len(text), "line_count": meta["line_count"], "binary": False, "functions": function_list_from_text(text)[:50], "headings": heading_list_from_text(text), "read_engine": "smart_worker"}
    lines = text.splitlines()
    start_line = params.get("startLine") or params.get("start_line")
    end_line = params.get("endLine") or params.get("end_line")
    if start_line or end_line:
        start = max(1, int(start_line or 1))
        end = min(len(lines), int(end_line or len(lines)))
        content = "\n".join(lines[start - 1:end])
        return {"state": "complete", "path": str(path), "content": content, "start_line": start, "end_line": end, "line_count": len(lines), "returned_chars": len(content), "total_chars": len(text), "bytes": path.stat().st_size, "sha256": sha256, "read_id": read_id(path, sha256), "truncated": False, "has_more": False, "read_engine": "smart_worker"}
    full = bool(params.get("full_read") or params.get("allow_over_max"))
    total = len(text)
    total_parts = max(1, math.ceil(total / max_chars))
    part = max(1, int(params.get("part") or 1))
    part = min(part, total_parts)
    start = 0 if full else (part - 1) * max_chars
    end = total if full else min(total, start + max_chars)
    content = text[start:end]
    has_more = (not full) and end < total
    state = "partial" if has_more else "complete"
    cursor = "" if full else encode_cursor({"path": str(path), "sha256": sha256, "maxChars": max_chars, "part": part})
    return {"state": state, "path": str(path), "content": content, "bytes": path.stat().st_size, "sha256": sha256, "read_id": read_id(path, sha256), "part": 1 if full else part, "total_parts": 1 if full else total_parts, "cursor": cursor, "has_more": has_more, "truncated": has_more, "returned_chars": len(content), "total_chars": total, "start_char": start, "end_char": end, "next_action": "Call file.read with cursor and next=true for the next part." if has_more else "", "warning": "full file returned; token-heavy" if full and total > max_chars else "", "read_engine": "smart_worker"}


def run_file_search(params, *, allowed_roots=()):
    path = safe_path(params.get("path"), allowed_roots)
    if not path.is_file():
        raise RuntimeError("not file")
    query = str(params.get("query") or params.get("q") or "")
    max_matches = int(params.get("max") or 50)
    matches = []
    for line_no, line in enumerate(path.read_text(encoding=params.get("encoding") or "utf-8", errors="replace").splitlines(), 1):
        if query in line:
            matches.append({"line": line_no, "text": line[:240]})
            if len(matches) >= max_matches:
                break
    return {"path": str(path), "query": query, "matches": matches, "count": len(matches), "read_engine": "smart_worker"}


def run_file_functions(params, *, allowed_roots=()):
    path = safe_path(params.get("path"), allowed_roots)
    if not path.is_file():
        raise RuntimeError("not file")
    funcs = function_list_from_text(path.read_text(encoding=params.get("encoding") or "utf-8", errors="replace"))
    return {"path": str(path), "functions": funcs, "count": len(funcs), "read_engine": "smart_worker"}
