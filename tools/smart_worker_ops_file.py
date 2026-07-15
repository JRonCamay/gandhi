import hashlib, os, shutil, tempfile, time, uuid
from pathlib import Path

VERSION = "smart_worker_ops_file v0.1.0"


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

