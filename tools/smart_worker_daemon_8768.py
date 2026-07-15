import hashlib, json, os, queue, shutil, tempfile, threading, time, traceback, uuid, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

VERSION = "smart_worker_daemon_8768 v0.2.0"
PORT = int(os.environ.get("SMART_WORKER_PORT", "8768"))
ROOT = Path(os.environ.get("SMART_WORKER_DIR", r"D:\Projects\Chad\local\AI_MEMORY_FIN\SMART_WORKER_DONT_DELETE"))
MAIN = os.environ.get("WRITER_INBOX_URL", "http://127.0.0.1:8766")
ALLOWED_ROOTS = [
    Path(x.strip()).expanduser()
    for x in os.environ.get("SMART_WORKER_ALLOWED_ROOTS", os.environ.get("LOCAL_FILE_ALLOWED_ROOTS", r"D:\Projects\Chad;D:\Projects\Chad\local\AI_MEMORY_FIN")).split(";")
    if x.strip()
]

Q = queue.Queue()
JOBS = {}

REGISTRY = {
    "worker.ping": {
        "desc": "Health check for the smart worker daemon.",
        "safety": "read",
        "status": "ready",
    },
    "worker.version": {
        "desc": "Return worker daemon version, queue, and registry summary.",
        "safety": "read",
        "status": "ready",
    },
    "worker.registry": {
        "desc": "Return worker operation registry.",
        "safety": "read",
        "status": "ready",
    },
    "task.submit": {
        "desc": "Queue a worker task by operation name and params.",
        "safety": "write",
        "status": "ready",
    },
    "task.status": {
        "desc": "Return current worker job status.",
        "safety": "read",
        "status": "ready",
    },
    "task.result": {
        "desc": "Return final worker job result or error.",
        "safety": "read",
        "status": "ready",
    },
    "noop": {
        "desc": "Test operation. Echoes params and completes without side effects.",
        "safety": "read",
        "status": "ready",
    },
    "file.write.smart": {
        "desc": "Smart single-file write with path safety, preflight, backup, atomic replace, read-back verification, and structured result.",
        "safety": "write",
        "status": "ready",
        "inputs": {
            "path": "required target file path",
            "content": "required text content",
            "mode": "create | overwrite | upsert, default upsert",
            "expected_sha256": "optional current-file conflict guard",
            "backup": "optional bool, default true when overwriting",
            "encoding": "optional, default utf-8",
            "dry_run": "optional bool",
        },
    },
}


def now():
    return time.strftime("%Y-%m-%dT%H:%M:%S%z")


def job_id():
    return f"SW-{time.strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:6]}"


def job_path(jid):
    return ROOT / "jobs" / f"{jid}.json"


def wj(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)


def rd(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def version_info():
    return {
        "name": "smart_worker",
        "version": VERSION,
        "port": PORT,
        "queued": Q.qsize(),
        "jobs": len(JOBS),
        "job_dir": str(ROOT / "jobs"),
        "features": [
            "durable-job-files",
            "operation-registry",
            "queued-worker-tasks",
            "main-daemon-status-callback",
            "sidecar-safe-migration",
            "file-write-smart",
        ],
        "registry": {k: {"status": v["status"], "safety": v["safety"]} for k, v in REGISTRY.items()},
    }


def save_job(job):
    JOBS[job["id"]] = job
    wj(job_path(job["id"]), job)
    return job


def load_job(jid):
    if jid in JOBS:
        return JOBS[jid]
    p = job_path(jid)
    if p.exists():
        job = rd(p)
        JOBS[jid] = job
        return job
    return {"id": jid, "state": "missing", "updated_at": now()}


def emit(job, state, note="", data=None):
    job["state"] = state
    job["updated_at"] = now()
    job.setdefault("status_log", []).append({"state": state, "note": note, "data": data or {}, "created_at": now()})
    save_job(job)
    cb = job.get("callback") or {}
    if cb.get("op") == "qc.slot.status":
        try:
            body = json.dumps({"op": "qc.slot.status", "params": {"state": state, "note": note, "data": {"worker_job": job["id"], **(data or {})}}}, ensure_ascii=False).encode()
            req = urllib.request.Request(MAIN + "/op", data=body, headers={"Content-Type": "application/json"}, method="POST")
            urllib.request.urlopen(req, timeout=2).read()
        except Exception:
            pass


def step(job, name, note="", data=None):
    job.setdefault("steps", []).append({"step": name, "note": note, "data": data or {}, "created_at": now()})
    emit(job, "running", note or name, {"step": name, **(data or {})})


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


def safe_path(raw_path):
    if not raw_path:
        raise RuntimeError("missing path")
    path = Path(os.path.expandvars(str(raw_path))).expanduser().resolve()
    allowed = [r.resolve() for r in ALLOWED_ROOTS]
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


def run_file_write_smart(params, job=None):
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
        if job:
            step(job, name, note, data)

    log("normalize_path", "Normalizing target path.", {"input": str(raw_path)})
    try:
        path = safe_path(raw_path)
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


def run_noop(params):
    return {"echo": params or {}, "checked_at": now()}


OPS = {
    "noop": run_noop,
    "file.write.smart": run_file_write_smart,
}


def execute(job):
    op = job.get("op")
    if op not in OPS:
        raise RuntimeError(f"unknown worker op: {op}")
    fn = OPS[op]
    if op == "noop":
        return fn(job.get("params") or {})
    return fn(job.get("params") or {}, job)


def worker():
    while True:
        jid = Q.get()
        job = load_job(jid)
        try:
            emit(job, "running", f"Worker running {job.get('op')}.")
            result = execute(job)
            job["result"] = result
            job["finished_at"] = now()
            emit(job, "done", f"Worker completed {job.get('op')}.", {"result": result})
        except Exception as e:
            job["error"] = {"message": str(e), "traceback": traceback.format_exc(limit=8)}
            job["finished_at"] = now()
            emit(job, "error", f"Worker failed {job.get('op')}: {e}", {"error": str(e)})
        finally:
            Q.task_done()


def submit(params):
    op = str(params.get("op") or params.get("tool") or params.get("cmd") or "").strip()
    if not op:
        raise RuntimeError("missing op")
    jid = params.get("job_id") or job_id()
    job = {
        "id": jid,
        "op": op,
        "params": params.get("params") or {},
        "state": "queued",
        "created_at": now(),
        "updated_at": now(),
        "callback": params.get("callback") or {},
        "attempt": 0,
        "status_log": [{"state": "queued", "note": f"Worker queued {op}.", "created_at": now()}],
    }
    save_job(job)
    Q.put(jid)
    return {"job_id": jid, "state": "queued", "status_url": f"/status/{jid}", "result_url": f"/result/{jid}"}


def route(op, params):
    params = params or {}
    if op in ("worker.ping", "ping"):
        return {"ok": True, "version": VERSION, "time": now()}
    if op in ("worker.version", "version"):
        return version_info()
    if op in ("worker.registry", "registry"):
        return {"registry": REGISTRY}
    if op in ("task.submit", "submit"):
        return submit(params)
    if op in ("task.status", "status"):
        return {"job": load_job(params.get("job_id") or params.get("id"))}
    if op in ("task.result", "result"):
        job = load_job(params.get("job_id") or params.get("id"))
        return {"job": job, "result": job.get("result"), "error": job.get("error")}
    raise RuntimeError(f"unknown op: {op}")


class Handler(BaseHTTPRequestHandler):
    def reply(self, data, code=200):
        raw = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def body(self):
        return json.loads(self.rfile.read(int(self.headers.get("Content-Length", "0") or 0)) or b"{}")

    def do_OPTIONS(self):
        self.reply({"status": "success"})

    def do_GET(self):
        try:
            if self.path in ("/health", "/ping"):
                return self.reply({"status": "success", "result": route("worker.ping", {})})
            if self.path == "/version":
                return self.reply({"status": "success", "result": route("worker.version", {})})
            if self.path == "/registry":
                return self.reply({"status": "success", "result": route("worker.registry", {})})
            if self.path.startswith("/status/"):
                return self.reply({"status": "success", "result": route("task.status", {"id": self.path.rsplit("/", 1)[-1]})})
            if self.path.startswith("/result/"):
                return self.reply({"status": "success", "result": route("task.result", {"id": self.path.rsplit("/", 1)[-1]})})
            self.reply({"status": "error", "msg": "bad path"}, 404)
        except Exception as e:
            self.reply({"status": "error", "msg": str(e)}, 400)

    def do_POST(self):
        try:
            data = self.body()
            if self.path == "/op":
                return self.reply({"status": "success", "result": route(data.get("op") or data.get("cmd"), data.get("params") or {})})
            if self.path == "/submit":
                return self.reply({"status": "success", "result": route("task.submit", data)})
            self.reply({"status": "error", "msg": "bad path"}, 404)
        except Exception as e:
            self.reply({"status": "error", "msg": str(e)}, 400)


if __name__ == "__main__":
    ROOT.mkdir(parents=True, exist_ok=True)
    threading.Thread(target=worker, daemon=True).start()
    print(f"smart_worker: http://127.0.0.1:{PORT}")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
