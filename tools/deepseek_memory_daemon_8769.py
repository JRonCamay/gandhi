import hashlib, json, os, queue, re, threading, time, traceback, urllib.request, uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

VERSION = "deepseek_memory_daemon_8769 v0.2.0"
PORT = int(os.environ.get("DEEPSEEK_MEMORY_PORT", "8769"))
ROOT = Path(os.environ.get("DEEPSEEK_MEMORY_DIR", r"D:\Projects\Chad\local\AI_MEMORY_FIN\DEEPSEEK_MEMORY_DONT_DELETE"))
QUIETCHAT_ROOT = Path(os.environ.get("QUIETCHAT_DIR", r"D:\Projects\Chad\local\AI_MEMORY_FIN\GPT_QUIETCHAT_DONT_DELETE"))
WRITER_INBOX_URL = os.environ.get("WRITER_INBOX_URL", "http://127.0.0.1:8766")
QUIETCHAT_BRIDGE_URL = os.environ.get("QUIETCHAT_BRIDGE_URL", "http://127.0.0.1:8765/quietchat/api")
DEEPSEEK_API_URL = os.environ.get("DEEPSEEK_API_URL", "https://api.deepseek.com/chat/completions")
DEEPSEEK_MODEL = os.environ.get("DEEPSEEK_MODEL", "deepseek-chat")
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
SCHEDULE_TIME = os.environ.get("DEEPSEEK_MEMORY_SCHEDULE", "20:00")
SCHEDULE_ENABLED = os.environ.get("DEEPSEEK_MEMORY_SCHEDULE_ENABLED", "0").lower() in ("1", "true", "yes", "on")
SCHEDULE_DAYS = int(os.environ.get("DEEPSEEK_MEMORY_DAYS", "10"))
CATCHUP_ON_START = os.environ.get("DEEPSEEK_MEMORY_CATCHUP_ON_START", "1").lower() in ("1", "true", "yes", "on")
MAX_CHARS = int(os.environ.get("DEEPSEEK_MEMORY_MAX_CHARS", "18000"))

Q = queue.Queue()
JOBS = {}

REGISTRY = {
    "memory.version": {"desc": "Return DeepSeek memory daemon version and registry.", "safety": "read", "status": "ready"},
    "memory.extract": {"desc": "Build a handoff memory file from QuietChat history.", "safety": "read-write", "status": "ready"},
    "memory.latest": {"desc": "Return latest generated handoff metadata and content preview.", "safety": "read", "status": "ready"},
    "text.correct": {"desc": "Correct draft text while preserving meaning, tone, commands, and paths.", "safety": "read", "status": "ready"},
    "task.submit": {"desc": "Queue a DeepSeek memory daemon operation.", "safety": "write", "status": "ready"},
    "task.status": {"desc": "Return job status.", "safety": "read", "status": "ready"},
    "task.result": {"desc": "Return job result.", "safety": "read", "status": "ready"},
}


def now():
    return time.strftime("%Y-%m-%dT%H:%M:%S%z")


def job_id():
    return f"DM-{time.strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:6]}"


def chat_id(value):
    text = str(value or "").strip()
    match = re.search(r"/c/([0-9a-f-]{20,})", text, re.I)
    if match:
        return match.group(1).lower()
    return re.sub(r"[^A-Za-z0-9_.-]+", "-", text).strip("-.").lower()[:120]


def write_json(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def sha_text(text):
    return hashlib.sha256(str(text).encode("utf-8", "replace")).hexdigest()


def job_path(jid):
    return ROOT / "jobs" / f"{jid}.json"


def save_job(job):
    JOBS[job["id"]] = job
    write_json(job_path(job["id"]), job)
    return job


def load_job(jid):
    if jid in JOBS:
        return JOBS[jid]
    p = job_path(jid)
    if p.exists():
        job = read_json(p)
        JOBS[jid] = job
        return job
    return {"id": jid, "state": "missing", "updated_at": now()}


def emit(job, state, note="", data=None):
    job["state"] = state
    job["updated_at"] = now()
    job.setdefault("status_log", []).append({"state": state, "note": note, "data": data or {}, "created_at": now()})
    save_job(job)


def notify_ui(event, payload):
    try:
        body = json.dumps({"event": event, "payload": payload}, ensure_ascii=False).encode()
        req = urllib.request.Request(QUIETCHAT_BRIDGE_URL + "/notify", data=body, headers={"Content-Type": "application/json"}, method="POST")
        urllib.request.urlopen(req, timeout=2).read()
    except Exception:
        pass


def version_info():
    return {
        "name": "deepseek_memory",
        "version": VERSION,
        "port": PORT,
        "root": str(ROOT),
        "quietchat_root": str(QUIETCHAT_ROOT),
        "quietchat_bridge_url": QUIETCHAT_BRIDGE_URL,
        "schedule_enabled": SCHEDULE_ENABLED,
        "schedule_time": SCHEDULE_TIME,
        "schedule_days": SCHEDULE_DAYS,
        "catchup_on_start": CATCHUP_ON_START,
        "api_configured": bool(DEEPSEEK_API_KEY),
        "model": DEEPSEEK_MODEL,
        "registry": {k: {"status": v["status"], "safety": v["safety"]} for k, v in REGISTRY.items()},
        "features": ["quietchat-handoff-memory", "chat-local-main-log-backup", "chunked-deepseek-summary", "local-emergency-fallback", "text-correction", "daily-scheduler", "missed-schedule-catchup", "pending-summary-ui-signal"],
    }


def collect_records(chat_url="", chat_folder="", days=10, limit=500):
    if chat_folder:
        root = Path(chat_folder)
    elif chat_url:
        root = QUIETCHAT_ROOT / chat_id(chat_url)
    else:
        root = latest_chat_folder()
    msg_root = root / "messages"
    cutoff = time.time() - int(days) * 86400
    rows = []
    for path in sorted(msg_root.glob("QC-*/message.json"), key=lambda p: p.stat().st_mtime):
        if path.stat().st_mtime < cutoff:
            continue
        try:
            record = read_json(path)
            rows.append({"path": str(path), "mtime": path.stat().st_mtime, "record": record})
        except Exception:
            pass
    return rows[-max(1, min(int(limit), 2000)):]


def latest_chat_folder():
    candidates = [p for p in QUIETCHAT_ROOT.iterdir() if p.is_dir() and (p / "messages").exists()]
    if not candidates:
        raise RuntimeError("no QuietChat chat folders found")
    return sorted(candidates, key=lambda p: p.stat().st_mtime, reverse=True)[0]


def resolve_chat_folder(params=None, rows=None):
    params = params or {}
    if params.get("chat_folder"):
        return Path(params["chat_folder"])
    url = params.get("chatUrl") or params.get("chat_url")
    if url:
        return QUIETCHAT_ROOT / chat_id(url)
    if rows:
        paths = [row.get("path") for row in rows if row.get("path")]
        if paths:
            return Path(paths[-1]).parents[2]
    return latest_chat_folder()


def record_text(row):
    r = row["record"]
    parts = [
        f"PATH: {row['path']}",
        f"DATE: {r.get('created_at') or r.get('updated_at') or ''}",
        f"ID: {r.get('message_id')}",
        f"STATE: {r.get('state')}",
        "USER:",
        str(r.get("user_message") or "").strip(),
    ]
    if r.get("assistant_reply"):
        parts += ["ASSISTANT:", str(r.get("assistant_reply") or "").strip()]
    if r.get("summary"):
        parts += ["SUMMARY:", str(r.get("summary") or "").strip()]
    if r.get("artifacts"):
        parts += ["ARTIFACTS:", json.dumps(r.get("artifacts"), ensure_ascii=False)]
    return "\n".join(parts).strip()


def chunk_text(items, max_chars=MAX_CHARS):
    chunks, current = [], []
    size = 0
    for item in items:
        text = record_text(item)
        extra = len(text) + 2
        if current and size + extra > max_chars:
            chunks.append("\n\n---\n\n".join(current))
            current, size = [], 0
        current.append(text)
        size += extra
    if current:
        chunks.append("\n\n---\n\n".join(current))
    return chunks


def deepseek_chat(system, user, max_tokens=2500):
    if not DEEPSEEK_API_KEY:
        raise RuntimeError("DEEPSEEK_API_KEY is not configured")
    payload = {
        "model": DEEPSEEK_MODEL,
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
        "temperature": 0.1,
        "max_tokens": max_tokens,
    }
    raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        DEEPSEEK_API_URL,
        data=raw,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {DEEPSEEK_API_KEY}"},
        method="POST",
    )
    data = json.loads(urllib.request.urlopen(req, timeout=90).read().decode("utf-8"))
    return data["choices"][0]["message"]["content"]


def local_chunk_summary(text, index, total):
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    bullets = []
    for line in lines:
        if line.startswith("SUMMARY:") or line.startswith("USER:") or line.startswith("ASSISTANT:"):
            continue
        if len(line) > 35 and len(bullets) < 12:
            bullets.append(line[:240])
    return {
        "chunk": index,
        "total_chunks": total,
        "mode": "local_fallback",
        "bullets": bullets,
        "sha256": sha_text(text),
    }


def summarize_chunk(text, index, total):
    system = (
        "You create detailed project handoff memory. Preserve exact file paths, task status, decisions, bugs, versions, and next actions. "
        "Do not invent. Return concise JSON with keys: current_state, completed_work, active_tasks, decisions, important_files, open_questions, next_actions, risks."
    )
    prompt = f"Summarize chunk {index}/{total} for continuity, not brevity. Raw chunk:\n\n{text}"
    try:
        return {"chunk": index, "mode": "deepseek", "text": deepseek_chat(system, prompt)}
    except Exception as e:
        fallback = local_chunk_summary(text, index, total)
        fallback["error"] = str(e)
        return fallback


def handoff_from_summaries(rows, summaries, params):
    paths = [row["path"] for row in rows]
    latest = rows[-1]["record"] if rows else {}
    chat_folder = resolve_chat_folder(params, rows)
    body = {
        "schema_version": 1,
        "kind": "handoff_memory",
        "created_at": now(),
        "source": "deepseek_memory_daemon",
        "source_mode": "deepseek" if any(s.get("mode") == "deepseek" for s in summaries) else "local_fallback",
        "chat_url": params.get("chatUrl") or params.get("chat_url") or latest.get("chat_url", ""),
        "chat_id": latest.get("chat_id") or chat_folder.name or chat_id(params.get("chatUrl") or params.get("chat_url") or ""),
        "days": int(params.get("days", SCHEDULE_DAYS)),
        "record_count": len(rows),
        "storage": {
            "quietchat_root": str(QUIETCHAT_ROOT),
            "chat_folder": str(chat_folder),
            "latest_message_path": paths[-1] if paths else "",
            "memory_root": str(ROOT / "memory"),
            "chat_main_log_root": str(chat_folder / "main_conversation_log"),
        },
        "summaries": summaries,
        "important_paths": sorted(set(paths[-50:])),
    }
    return body


def markdown_handoff(data):
    lines = [
        "# QuietChat Handoff Memory",
        "",
        f"- created_at: {data.get('created_at')}",
        f"- source_mode: {data.get('source_mode')}",
        f"- chat_id: {data.get('chat_id')}",
        f"- records: {data.get('record_count')}",
        f"- quietchat_root: `{data.get('storage', {}).get('quietchat_root', '')}`",
        f"- chat_folder: `{data.get('storage', {}).get('chat_folder', '')}`",
        f"- latest_message_path: `{data.get('storage', {}).get('latest_message_path', '')}`",
        "",
        "## Chunk Summaries",
    ]
    for summary in data.get("summaries", []):
        lines += ["", f"### Chunk {summary.get('chunk')} ({summary.get('mode')})"]
        if summary.get("text"):
            lines.append(summary["text"].strip())
        else:
            for bullet in summary.get("bullets", []):
                lines.append(f"- {bullet}")
            if summary.get("error"):
                lines.append(f"- fallback_reason: {summary.get('error')}")
    lines += ["", "## Recent Source Files"]
    for path in data.get("important_paths", [])[-20:]:
        lines.append(f"- `{path}`")
    return "\n".join(lines).strip() + "\n"


def write_handoff(data):
    stamp = time.strftime("%Y-%m-%d_%H%M%S")
    day = time.strftime("%Y-%m-%d")
    mem = ROOT / "memory"
    archive = mem / "archive"
    chat_log = Path(data.get("storage", {}).get("chat_main_log_root") or "") / "deepseek_summaries"
    md = markdown_handoff(data)
    latest_json = mem / "latest_handoff.json"
    latest_md = mem / "latest_handoff.md"
    archive_json = archive / f"{stamp}_handoff.json"
    archive_md = archive / f"{stamp}_handoff.md"
    chat_latest_json = chat_log / "latest_deepseek_handoff.json"
    chat_latest_md = chat_log / "latest_deepseek_handoff.md"
    chat_daily_json = chat_log / f"{day}_deepseek_handoff.json"
    chat_daily_md = chat_log / f"{day}_deepseek_handoff.md"
    write_json(latest_json, data)
    latest_md.parent.mkdir(parents=True, exist_ok=True)
    latest_md.write_text(md, encoding="utf-8")
    write_json(archive_json, data)
    archive_md.parent.mkdir(parents=True, exist_ok=True)
    archive_md.write_text(md, encoding="utf-8")
    write_json(chat_latest_json, data)
    chat_latest_md.parent.mkdir(parents=True, exist_ok=True)
    chat_latest_md.write_text(md, encoding="utf-8")
    write_json(chat_daily_json, data)
    chat_daily_md.parent.mkdir(parents=True, exist_ok=True)
    chat_daily_md.write_text(md, encoding="utf-8")
    return {
        "latest_json": str(latest_json),
        "latest_md": str(latest_md),
        "archive_json": str(archive_json),
        "archive_md": str(archive_md),
        "chat_latest_json": str(chat_latest_json),
        "chat_latest_md": str(chat_latest_md),
        "chat_daily_json": str(chat_daily_json),
        "chat_daily_md": str(chat_daily_md),
        "sha256": sha_text(md),
        "bytes": len(md.encode("utf-8")),
    }


def write_pending_summary(data, files):
    pending = {
        "schema_version": 1,
        "kind": "pending_deepseek_summary",
        "created_at": now(),
        "chat_id": data.get("chat_id", ""),
        "chat_url": data.get("chat_url", ""),
        "days": data.get("days"),
        "record_count": data.get("record_count"),
        "source_mode": data.get("source_mode"),
        "insert_command": "mcp message",
        "button": {
            "label": "Insert DeepSeek summary",
            "action": "insert_summary_to_active_chat",
            "source_markdown": files.get("chat_latest_md") or files.get("latest_md"),
            "source_json": files.get("chat_latest_json") or files.get("latest_json"),
        },
        "storage": files,
    }
    path = Path(data.get("storage", {}).get("chat_main_log_root") or ROOT / "memory") / "pending_deepseek_summary.json"
    write_json(path, pending)
    return str(path)


def memory_extract(params, job=None):
    rows = collect_records(params.get("chatUrl") or params.get("chat_url", ""), params.get("chat_folder", ""), params.get("days", SCHEDULE_DAYS), params.get("limit", 500))
    chunks = chunk_text(rows, int(params.get("maxChars") or MAX_CHARS))
    summaries = []
    for i, chunk in enumerate(chunks, 1):
        if job:
            emit(job, "running", f"Summarizing chunk {i}/{len(chunks)}.", {"chunk": i, "total_chunks": len(chunks)})
        summaries.append(summarize_chunk(chunk, i, len(chunks)))
    data = handoff_from_summaries(rows, summaries, params)
    files = write_handoff(data)
    data["storage"].update(files)
    data["storage"]["pending_summary"] = write_pending_summary(data, files)
    write_json(files["latest_json"], data)
    notify_ui("memory.extraction.complete", {"message": "Memory extraction complete", "handoff": files, "chat_id": data.get("chat_id"), "days": data.get("days")})
    notify_ui("memory.summary.pending", {"message": "DeepSeek summary ready", "button": "Insert DeepSeek summary", "handoff": files, "pending_summary": data["storage"]["pending_summary"], "chat_id": data.get("chat_id")})
    return {"state": "complete", "records": len(rows), "chunks": len(chunks), "storage": data["storage"], "source_mode": data["source_mode"]}


def memory_latest(params):
    path = ROOT / "memory" / "latest_handoff.json"
    if not path.exists():
        return {"state": "missing", "path": str(path)}
    data = read_json(path)
    md_path = ROOT / "memory" / "latest_handoff.md"
    preview = md_path.read_text(encoding="utf-8", errors="replace")[: int(params.get("maxChars", 4000))] if md_path.exists() else ""
    return {"state": "ready", "path": str(path), "markdown_path": str(md_path), "data": data, "preview": preview}


def local_correct(text):
    fixed = str(text)
    replacements = {
        "alreday": "already",
        "Alreday": "Already",
        "teh": "the",
        "adn": "and",
        "recieve": "receive",
        "mechnically": "mechanically",
        "Mechnically": "Mechanically",
        "ginna": "gonna",
        "Ginna": "Gonna",
        "wairing": "waiting",
        "Wairing": "Waiting",
        "shoudl": "should",
        "Shoudl": "Should",
        "Ifthe": "If the",
        "ifthe": "if the",
        "Ift hat": "If that",
        "ift hat": "if that",
        "clickalble": "clickable",
        "Clickalble": "Clickable",
        "direcctly": "directly",
        "Direcctly": "Directly",
        "catche": "catch",
        "Catche": "Catch",
        "ot chnages": "it changes",
        "Ot chnages": "It changes",
        "im ": "I'm ",
        "i ": "I ",
        " dont ": " don't ",
        " cant ": " can't ",
        " doesnt ": " doesn't ",
        " doesnt": " doesn't",
    }
    for bad, good in replacements.items():
        fixed = fixed.replace(bad, good)
    return fixed


def text_correct(params):
    text = str(params.get("text") or params.get("message") or "")
    if not text:
        raise RuntimeError("missing text")
    system = "Correct spelling and grammar only. Preserve meaning, tone, commands, code, file paths, URLs, ids, and formatting. Do not add ideas."
    try:
        corrected = deepseek_chat(system, text, max_tokens=1200)
        mode = "deepseek"
    except Exception as e:
        corrected = local_correct(text)
        mode = "local_fallback"
        return {"state": "complete", "mode": mode, "original": text, "corrected": corrected, "error": str(e)}
    return {"state": "complete", "mode": mode, "original": text, "corrected": corrected}


def execute(job):
    op = job.get("op")
    params = job.get("params") or {}
    if op == "memory.extract":
        return memory_extract(params, job)
    if op == "text.correct":
        return text_correct(params)
    if op == "memory.latest":
        return memory_latest(params)
    raise RuntimeError(f"unknown op: {op}")


def worker():
    while True:
        jid = Q.get()
        job = load_job(jid)
        try:
            emit(job, "running", f"Running {job.get('op')}.")
            job["result"] = execute(job)
            job["finished_at"] = now()
            emit(job, "done", f"Completed {job.get('op')}.", {"result": job["result"]})
        except Exception as e:
            job["error"] = {"message": str(e), "traceback": traceback.format_exc(limit=8)}
            job["finished_at"] = now()
            emit(job, "error", f"Failed {job.get('op')}: {e}", {"error": str(e)})
        finally:
            Q.task_done()


def submit(params):
    op = str(params.get("op") or params.get("cmd") or "").strip()
    if not op:
        raise RuntimeError("missing op")
    jid = params.get("job_id") or job_id()
    job = {"id": jid, "op": op, "params": params.get("params") or {}, "state": "queued", "created_at": now(), "updated_at": now(), "status_log": []}
    save_job(job)
    Q.put(jid)
    return {"job_id": jid, "state": "queued", "status_url": f"/status/{jid}", "result_url": f"/result/{jid}"}


def schedule_state_path():
    return ROOT / "schedule_state.json"


def load_schedule_state():
    path = schedule_state_path()
    if path.exists():
        try:
            return read_json(path)
        except Exception:
            return {}
    return {}


def save_schedule_state(data):
    write_json(schedule_state_path(), data)


def today_schedule_elapsed():
    try:
        target = time.strptime(time.strftime("%Y-%m-%d") + " " + SCHEDULE_TIME, "%Y-%m-%d %H:%M")
        return time.time() >= time.mktime(target)
    except Exception:
        return False


def today_summary_exists():
    day = time.strftime("%Y-%m-%d")
    try:
        chat_folder = latest_chat_folder()
        daily = chat_folder / "main_conversation_log" / "deepseek_summaries" / f"{day}_deepseek_handoff.json"
        if daily.exists():
            return True
    except Exception:
        pass
    latest = ROOT / "memory" / "latest_handoff.json"
    if latest.exists():
        try:
            data = read_json(latest)
            return str(data.get("created_at", "")).startswith(day)
        except Exception:
            return False
    return False


def queue_scheduled_extract(reason):
    result = submit({"op": "memory.extract", "params": {"days": SCHEDULE_DAYS, "scheduled": True, "reason": reason}})
    state = load_schedule_state()
    state.update({"last_queued_date": time.strftime("%Y-%m-%d"), "last_reason": reason, "last_job_id": result["job_id"], "updated_at": now()})
    save_schedule_state(state)
    notify_ui("memory.extraction.queued", {"message": "DeepSeek memory extraction queued", "reason": reason, "job": result, "days": SCHEDULE_DAYS})
    return result


def route(op, params):
    params = params or {}
    if op in ("ping", "memory.ping"):
        return {"ok": True, "version": VERSION, "time": now()}
    if op in ("version", "memory.version"):
        return version_info()
    if op in ("registry", "memory.registry"):
        return {"registry": REGISTRY}
    if op in ("submit", "task.submit"):
        return submit(params)
    if op in ("status", "task.status"):
        return {"job": load_job(params.get("job_id") or params.get("id"))}
    if op in ("result", "task.result"):
        job = load_job(params.get("job_id") or params.get("id"))
        return {"job": job, "result": job.get("result"), "error": job.get("error")}
    if op == "memory.latest":
        return memory_latest(params)
    if op in ("memory.extract", "text.correct"):
        job = {"id": params.get("job_id") or job_id(), "op": op, "params": params, "state": "running", "created_at": now(), "updated_at": now(), "status_log": []}
        save_job(job)
        job["result"] = execute(job)
        job["finished_at"] = now()
        emit(job, "done", f"Completed {op}.", {"result": job["result"]})
        return {"job": job, "result": job["result"]}
    raise RuntimeError(f"unknown op: {op}")


def scheduler():
    while True:
        try:
            state = load_schedule_state()
            today = time.strftime("%Y-%m-%d")
            if SCHEDULE_ENABLED and time.strftime("%H:%M") == SCHEDULE_TIME and state.get("last_queued_date") != today:
                queue_scheduled_extract("scheduled_time")
            time.sleep(30)
        except Exception:
            time.sleep(30)


def startup_catchup():
    if not (SCHEDULE_ENABLED and CATCHUP_ON_START):
        return
    state = load_schedule_state()
    today = time.strftime("%Y-%m-%d")
    if state.get("last_queued_date") == today or today_summary_exists():
        return
    if today_schedule_elapsed() or not (ROOT / "memory" / "latest_handoff.json").exists():
        queue_scheduled_extract("startup_catchup")


class Handler(BaseHTTPRequestHandler):
    def reply(self, data, code=200):
        raw = json.dumps(data, ensure_ascii=False).encode("utf-8")
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
                return self.reply({"status": "success", "result": route("ping", {})})
            if self.path == "/version":
                return self.reply({"status": "success", "result": route("version", {})})
            if self.path == "/registry":
                return self.reply({"status": "success", "result": route("registry", {})})
            if self.path.startswith("/status/"):
                return self.reply({"status": "success", "result": route("status", {"id": self.path.rsplit("/", 1)[-1]})})
            if self.path.startswith("/result/"):
                return self.reply({"status": "success", "result": route("result", {"id": self.path.rsplit("/", 1)[-1]})})
            self.reply({"status": "error", "msg": "bad path"}, 404)
        except Exception as e:
            self.reply({"status": "error", "msg": str(e)}, 400)

    def do_POST(self):
        try:
            data = self.body()
            if self.path == "/op":
                return self.reply({"status": "success", "result": route(data.get("op") or data.get("cmd"), data.get("params") or {})})
            if self.path == "/submit":
                return self.reply({"status": "success", "result": route("submit", data)})
            self.reply({"status": "error", "msg": "bad path"}, 404)
        except Exception as e:
            self.reply({"status": "error", "msg": str(e)}, 400)


if __name__ == "__main__":
    ROOT.mkdir(parents=True, exist_ok=True)
    threading.Thread(target=worker, daemon=True).start()
    threading.Thread(target=scheduler, daemon=True).start()
    startup_catchup()
    print(f"deepseek_memory: http://127.0.0.1:{PORT}")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
