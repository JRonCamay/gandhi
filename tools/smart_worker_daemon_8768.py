import json, os, queue, sys, threading, time, traceback, uuid, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from smart_worker_ops_file import VERSION as FILE_OPS_VERSION, run_file_write_smart as file_write_smart

VERSION = "smart_worker_daemon_8768 v0.3.0"
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
            "modular-worker-ops",
        ],
        "registry": {k: {"status": v["status"], "safety": v["safety"]} for k, v in REGISTRY.items()},
        "modules": {"file_ops": FILE_OPS_VERSION},
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


def run_file_write_smart(params, job=None):
    return file_write_smart(params, job=job, allowed_roots=ALLOWED_ROOTS, now=now, step=step)

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
    if op in OPS:
        job = {
            "id": params.get("job_id") or job_id(),
            "op": op,
            "params": params,
            "state": "running",
            "created_at": now(),
            "updated_at": now(),
            "callback": params.get("callback") or {},
            "status_log": [],
        }
        save_job(job)
        result = execute(job)
        job["result"] = result
        job["finished_at"] = now()
        emit(job, "done", f"Worker completed {op}.", {"result": result})
        return {"job": job, "result": result}
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
