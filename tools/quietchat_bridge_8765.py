import json,os,re,time,uuid,urllib.request,queue
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path

VERSION="quietchat_bridge_8765 v0.4.7"
ROOT=Path(os.environ.get("QUIETCHAT_DIR",r"D:\Projects\Chad\local\AI_MEMORY_FIN\GPT_QUIETCHAT_DONT_DELETE"))
WI=os.environ.get("WRITER_INBOX_URL","http://127.0.0.1:8766")
SUBS=[];EVENTS=[];LATEST={};SEQ=0
CID=re.compile(r"(?i)(?:https?://[^/]+)?(?:/[^?#]*)?/c/([0-9a-f-]{20,})|^([0-9a-f-]{20,})$")
MID=re.compile(r"^QC-[A-Za-z0-9_.-]{3,64}$")
BOOTSTRAP_HELP={
    "purpose":"First QuietChat message for this AI chat. Read this before answering.",
    "rules":[
        "When main chat says @mcp message, use the returned RAM slot as the current task.",
        "RAM slot contains path, date, and the exact message.json record.",
        "Answer the user_message from record.",
        "For user-facing output, complete the RAM slot instead of manually editing the UI.",
        "Daemon writes completion back to the local message.json and clears RAM after a successful write.",
        "If output is more than 300 lines, daemon saves it as an artifact file beside message.json.",
        "Main chat visible reply after completion should be only ✓."
    ],
    "work_protocol":[
        "Patch the root issue directly; do not stack workaround patches.",
        "Before editing, identify the exact file and exact region to change.",
        "Preserve unrelated code exactly as it is.",
        "Use MCP/daemon tools first when practical; use GitHub connector for online repo writes if local git is uncertain.",
        "Never claim a write, push, or fix is done until read-back or another verification confirms it.",
        "If blocked or unsure, report the real blocker instead of inventing success.",
        "Keep reports short: Completed, Verified, Remaining or Blocked."
    ],
    "visible_trigger":"@mcp message",
    "mcp_commands":{
        "message":"returns the current QuietChat RAM slot",
        "qc.slot.get":"returns the current QuietChat RAM slot",
        "qc.slot.status":"updates status_log in the current local message.json",
        "qc.slot.complete":"writes assistant reply/summary/artifacts into message.json, then clears RAM",
        "qc.reply":"submits an assistant reply that contains status:[DONE]",
        "qc.slot.clear":"clears the one RAM slot",
        "qc.view":"returns QuietChat messages for UI display",
        "qc.search":"searches QuietChat history",
        "qc.pin":"pins a user or assistant message",
        "file.read":"reads an allowed local file through daemon",
        "file.write":"writes an allowed local file through daemon",
        "daemon.op":"routes a raw daemon operation"
    },
    "current_limit":"One RAM slot only for now. New QuietChat messages overwrite the slot."
}

def now():return time.strftime("%Y-%m-%dT%H:%M:%S%z")
def version_info():
    return {"name":"quietchat_bridge","version":VERSION,"port":8765,"features":["create-message","scan","get","first-message-bootstrap","ram-slot-set","latest-event-slot"]}
def cid(v):
    v=str(v or "").strip();m=CID.search(v)
    if m:return (m.group(1) or m.group(2)).lower(),v if v.startswith(("http://","https://")) else ""
    c=re.sub(r"[^A-Za-z0-9_.-]+","-",v).strip("-.").lower()
    if c:return c[:120],""
    raise ValueError("chat_url required")
def mid(v=""):
    v=str(v or "").strip()
    if v:
        if not MID.match(v):raise ValueError("bad message_id")
        return v
    return f"QC-{time.strftime('%H%M%S')}-{uuid.uuid4().hex[:6]}"
def rd(p):return json.loads(p.read_text(encoding="utf-8"))
def wr(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding="utf-8")
def emit(event,payload):
    global SEQ
    dead=[]
    SEQ+=1;item={"id":SEQ,"event":event,"payload":payload,"created_at":now()}
    EVENTS.append(item)
    if len(EVENTS)>50:del EVENTS[:-50]
    cidv=(payload or {}).get("chat_id")
    if cidv and event in ("qc.data","qc.updated","qc.saved","qc.dirty","qc.blip","qc.created"):
        LATEST[str(cidv)]=item
    for q in list(SUBS):
        try:q.put_nowait(item)
        except Exception:dead.append(q)
    for q in dead:
        try:SUBS.remove(q)
        except ValueError:pass
def daemon_op(op,params):
    try:
        b=json.dumps({"op":op,"params":params},ensure_ascii=False).encode()
        req=urllib.request.Request(WI+"/op",data=b,headers={"Content-Type":"application/json"},method="POST")
        return json.loads(urllib.request.urlopen(req,timeout=3).read().decode())
    except Exception as e:
        return {"status":"error","msg":str(e)}
def paths(u,m=""):
    i,pg=cid(u);d=ROOT/i
    return i,pg,d,d/"chat.json",(d/"messages"/m/"message.json" if m else None)
def chat(u,title=""):
    i,pg,d,cp,_=paths(u);d.mkdir(parents=True,exist_ok=True)
    r=rd(cp) if cp.exists() else {"schema_version":1,"chat_id":i,"page_url":pg,"title":title or "ChatGPT","created_at":now(),"updated_at":now(),"messages":[]}
    if pg and not r.get("page_url"):r["page_url"]=pg
    if title:r["title"]=" ".join(str(title).split())[:160]
    r["updated_at"]=now();wr(cp,r);return r
def create(x):
    u=x.get("chat_url","");c=chat(u,x.get("conversation_title") or x.get("title",""));first_chat=not bool(c.get("messages"));m=mid(x.get("message_id",""));_,_,_,cp,mp=paths(c["chat_id"],m)
    if mp.exists():raise ValueError("message exists")
    meta=x.get("metadata") or {}
    if first_chat:
        meta["bootstrap"]=BOOTSTRAP_HELP
        meta["first_quietchat_message"]=True
    r={"schema_version":1,"chat_id":c["chat_id"],"chat_url":u,"message_id":m,"state":"pending","user_message":x.get("user_message") or x.get("message",""),"assistant_reply":"","metadata":meta,"created_at":now(),"updated_at":now(),"status_log":[]}
    if not r["user_message"].strip():raise ValueError("message required")
    slot=daemon_op("qc.slot.set",{"path":str(mp),"date":r["created_at"],"record":r,"unsaved":True})
    emit("qc.created",{"chat_url":u,"chat_id":c["chat_id"],"message_id":m,"state":"pending","path":str(mp)})
    return {
        "status":"success",
        "message_id":m,
        "trigger":"@mcp message",
        "explicit_trigger":"@mcp message",
        "slot":slot,
        "record":r
    }
def scan(x):
    u=x.get("chat_url","");limit=max(1,min(int(x.get("limit") or 80),200));state=x.get("state","")
    c=chat(u);d=ROOT/c["chat_id"]/ "messages";a=[]
    for p in sorted(d.glob("QC-*/message.json"),key=lambda q:q.stat().st_mtime,reverse=True):
        try:
            r=rd(p)
            if state and r.get("state")!=state:continue
            a.append(r)
            if len(a)>=limit:break
        except Exception:pass
    a.reverse()
    return {"status":"success","count":len(a),"chat":c,"messages":a}
def get(x):
    u=x.get("chat_url","");m=mid(x.get("message_id",""));_,_,_,_,mp=paths(u,m)
    return {"status":"success","record":rd(mp)}

class H(BaseHTTPRequestHandler):
    def end_headers(s):
        s.send_header("Access-Control-Allow-Origin","*");s.send_header("Access-Control-Allow-Headers","content-type");s.send_header("Access-Control-Allow-Methods","GET,POST,OPTIONS");super().end_headers()
    def do_OPTIONS(s):s.send_response(204);s.end_headers()
    def do_GET(s):
        if s.path.startswith("/quietchat/api/events/latest") or s.path.endswith("/events/latest"):
            import urllib.parse
            qs=urllib.parse.parse_qs(urllib.parse.urlparse(s.path).query)
            c=(qs.get("chat_id") or qs.get("chatId") or [""])[0]
            since=int((qs.get("since") or ["0"])[0] or 0)
            item=LATEST.get(str(c)) if c else None
            if item and item.get("id",0)<=since:item=None
            b=json.dumps({"status":"success","result":item or {"event":"empty","payload":{},"id":since}},ensure_ascii=False).encode()
            s.send_response(200);s.send_header("content-type","application/json");s.send_header("content-length",str(len(b)));s.end_headers();s.wfile.write(b)
            return
        if s.path.endswith("/events/next"):
            import urllib.parse
            qs=urllib.parse.parse_qs(urllib.parse.urlparse(s.path).query);since=int((qs.get("since") or ["0"])[0] or 0)
            for old in EVENTS:
                if old.get("id",0)>since:
                    b=json.dumps({"status":"success","result":old},ensure_ascii=False).encode()
                    s.send_response(200);s.send_header("content-type","application/json");s.send_header("content-length",str(len(b)));s.end_headers();s.wfile.write(b)
                    return
            q=queue.Queue(maxsize=1);SUBS.append(q)
            try:
                try:item=q.get(timeout=2)
                except queue.Empty:item={"event":"timeout","payload":{},"created_at":now()}
                b=json.dumps({"status":"success","result":item},ensure_ascii=False).encode()
                s.send_response(200);s.send_header("content-type","application/json");s.send_header("content-length",str(len(b)));s.end_headers();s.wfile.write(b)
            finally:
                try:SUBS.remove(q)
                except ValueError:pass
            return
        if s.path.endswith("/events"):
            q=queue.Queue(maxsize=20);SUBS.append(q)
            s.send_response(200);s.send_header("content-type","text/event-stream");s.send_header("cache-control","no-cache");s.send_header("connection","keep-alive");s.end_headers()
            try:
                s.wfile.write(b": quietchat events\n\n");s.wfile.flush()
                while True:
                    try:
                        item=q.get(timeout=25)
                        b=("event: "+item["event"]+"\n"+"data: "+json.dumps(item,ensure_ascii=False)+"\n\n").encode()
                        s.wfile.write(b);s.wfile.flush()
                    except queue.Empty:
                        s.wfile.write(b": ping\n\n");s.wfile.flush()
            except Exception:
                pass
            finally:
                try:SUBS.remove(q)
                except ValueError:pass
            return
        if s.path.endswith("/version"):
            b=json.dumps({"status":"success","result":version_info()},ensure_ascii=False).encode()
            s.send_response(200);s.send_header("content-type","application/json");s.send_header("content-length",str(len(b)));s.end_headers();s.wfile.write(b)
            return
        b=json.dumps({"status":"error","error":"bad endpoint"},ensure_ascii=False).encode()
        s.send_response(404);s.send_header("content-type","application/json");s.send_header("content-length",str(len(b)));s.end_headers();s.wfile.write(b)
    def do_POST(s):
        try:
            n=int(s.headers.get("content-length","0"));x=json.loads(s.rfile.read(n) or b"{}")
            if s.path.endswith("/version"):y=version_info()
            elif s.path.endswith("/notify"):
                emit(x.get("event") or "qc.updated",x.get("payload") or x)
                y={"status":"success","subscribers":len(SUBS)}
            elif s.path.endswith("/create"):y=create(x)
            elif s.path.endswith("/reply"):
                y=daemon_op("qc.reply",x)
            elif s.path.endswith("/view"):
                y=daemon_op(x.get("cmd") or "qc.view",x.get("params") or x)
            elif s.path.endswith("/scan"):y=scan(x)
            elif s.path.endswith("/get"):y=get(x)
            else:raise ValueError("bad endpoint")
            b=json.dumps(y,ensure_ascii=False).encode()
            s.send_response(200);s.send_header("content-type","application/json");s.send_header("content-length",str(len(b)));s.end_headers();s.wfile.write(b)
        except Exception as e:
            b=json.dumps({"status":"error","error":str(e)},ensure_ascii=False).encode()
            s.send_response(500);s.send_header("content-type","application/json");s.send_header("content-length",str(len(b)));s.end_headers();s.wfile.write(b)

if __name__=="__main__":
    ROOT.mkdir(parents=True,exist_ok=True)
    print("QuietChat bridge: http://127.0.0.1:8765/quietchat/api")
    ThreadingHTTPServer(("127.0.0.1",8765),H).serve_forever()
