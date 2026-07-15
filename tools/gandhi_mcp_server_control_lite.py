import json,os,re,tempfile,time,uuid,hashlib,shutil,urllib.request
from urllib.error import HTTPError
from contextlib import contextmanager
from pathlib import Path
from mcp.server.fastmcp import FastMCP
from mcp.server.streamable_http import TransportSecuritySettings

VERSION="gandhi_mcp_server_control_lite v0.4.3"
mcp=FastMCP("Gandhi Control Lite",host="127.0.0.1",port=int(os.environ.get("GANDHI_PORT","8001")),streamable_http_path="/mcp",transport_security=TransportSecuritySettings(enable_dns_rebinding_protection=True,allowed_hosts=[x.strip() for x in os.environ.get("GANDHI_ALLOWED_HOSTS","127.0.0.1,localhost,perch-tripping-crushed.ngrok-free.dev").split(",") if x.strip()]))
QR=Path(os.environ.get("QUIETCHAT_DIR",r"D:\Projects\Chad\local\AI_MEMORY_FIN\GPT_QUIETCHAT_DONT_DELETE"))
FR=[Path(x.strip()) for x in os.environ.get("LOCAL_FILE_ALLOWED_ROOTS",r"D:\Projects\Chad;D:\Projects\Chad\local\AI_MEMORY_FIN").split(";") if x.strip()]
WQ=Path(os.environ.get("WRITER_QUEUE_DIR",r"D:\Projects\Chad\writer_queue"))
WI=os.environ.get("WRITER_INBOX_URL","http://127.0.0.1:8766")
SW=os.environ.get("SMART_WORKER_URL","http://127.0.0.1:8768")
CID=re.compile(r"(?i)(?:https?://[^/]+)?(?:/[^?#]*)?/c/([0-9a-f-]{20,})|^([0-9a-f-]{20,})$")
MID=re.compile(r"^QC-[A-Za-z0-9_.-]{3,64}$")
CMDS={
"ping":"health()",
"version":"versionInfo()",
"system.version":"versionInfoWithDaemon()",
"qc.create":"createQuietChat(chatUrl,msg,title?,msgId?,meta?)",
"qc.process":"processQuietChat(chatUrl,msgId)",
"qc.status":"updateQuietChat(chatUrl,msgId,state,note?,progress?,data?)",
"qc.complete":"completeQuietChat(chatUrl,msgId,reply,summary?,artifacts?)",
"message":"getCurrentQuietChatRamSlot()",
"qc.slot.get":"getCurrentQuietChatRamSlot()",
"qc.slot.status":"updateCurrentQuietChatRamSlotStatus(state,note?,progress?,data?)",
"qc.slot.complete":"completeCurrentQuietChatRamSlot(reply,summary?,artifacts?)",
"qc.reply":"submitReplyWithDoneMarker(reply ending status:[DONE])",
"qc.slot.clear":"clearCurrentQuietChatRamSlot()",
"qc.next":"nextPendingQuietChat(chatUrl)",
"qc.get":"getQuietChat(chatUrl,msgId)",
"qc.list":"listQuietChat(chatUrl,limit?,state?)",
"qc.view":"viewQuietChat(chatUrl,limit?,scanLimit?,staleAfter?)",
"qc.search":"searchQuietChat(chatUrl,query,limit?)",
"qc.pin":"pinQuietChat(chatUrl,msgId,pinName)",
"file.write":"writeFile(path,content,overwrite?)",
"file.batch":"writeFiles(files,overwrite?)",
"file.read":"readFile(path,maxChars?)",
"file.info":"fileInfo(path)",
"memory.exportChat":"exportChatMemory(chatUrl,days?,outPath?,mode?)",
"writer.queue":"queueJob(kind,payload?)",
"writer.status":"jobStatus(jobId)",
"writer.flush":"queueFlush()",
"scratch.note":"ramScratchNote(text,tag?)",
"scratch.list":"ramScratchList()",
"scratch.get":"ramScratchGet(id)",
"seg.note":"ramSegmentNote(text,tag?)",
"seg.list":"ramSegmentList()",
"seg.get":"ramSegmentGet(id)",
"daemon.op":"daemonOp(op,params)"}

class E(Exception):pass
def n():return time.strftime("%Y-%m-%dT%H:%M:%S%z")
def ok(x=None):return {"status":"success",**(x or {})}
def version_info():
    daemon=ip({"op":"version","params":{}})
    return {"name":"gandhi_control_lite","version":VERSION,"port":int(os.environ.get("GANDHI_PORT","8001")),"daemon":daemon}
def er(c,e):return {"status":"error","err":c,"msg":str(e),"cmds":CMDS}
def j(p):return json.loads(Path(p).read_text(encoding="utf-8"))
def wj(p,x):wb(p,json.dumps(x,ensure_ascii=False,indent=2).encode())
def wb(p,b):
    p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);fd,t=tempfile.mkstemp(prefix=p.name+".",dir=p.parent);t=Path(t)
    try:
        with os.fdopen(fd,"wb") as f:f.write(b);f.flush();os.fsync(f.fileno())
        os.replace(t,p)
    finally:
        if t.exists():t.unlink()
def ck(x,nm): 
    if x in (None,"",[]):raise E(f"missing {nm}")
    return x
def chatId(u):
    m=CID.search(str(ck(u,"chatUrl")).strip())
    if m:return (m.group(1) or m.group(2)).lower()
    return re.sub(r"[^A-Za-z0-9_.-]+","-",str(u)).strip("-.").lower()[:120]
def msgId(v=""):
    v=str(v or "").strip()
    if v and not MID.match(v):raise E("bad msgId")
    return v or f"QC-{time.strftime('%H%M%S')}-{uuid.uuid4().hex[:6]}"
def rel(p,r):
    try:Path(p).resolve().relative_to(Path(r).resolve());return True
    except Exception:return False
def safe(p):
    p=Path(ck(p,"path")).expanduser().resolve()
    if not any(rel(p,r) or p==Path(r).expanduser().resolve() for r in FR):raise E("blocked path")
    return p
def sha(p):
    h=hashlib.sha256()
    with Path(p).open("rb") as f:
        for b in iter(lambda:f.read(1048576),b""):h.update(b)
    return h.hexdigest()

class QC:
    def __init__(s,r=QR):s.r=Path(r).expanduser().resolve();s.r.mkdir(parents=True,exist_ok=True)
    def cd(s,u):return s.r/chatId(u)
    def cp(s,u):return s.cd(u)/"chat.json"
    def mp(s,u,m):return s.cd(u)/"messages"/msgId(m)/"message.json"
    def latest(s,u,state="pending"):
        root=s.cd(u)/"messages"
        found=[]
        for p in root.glob("QC-*/message.json"):
            try:
                r=j(p)
                if state and r.get("state")!=state:continue
                found.append((p.stat().st_mtime,r))
            except Exception:
                pass
        if not found:raise E(f"no {state or 'matching'} message")
        return sorted(found,key=lambda x:x[0],reverse=True)[0][1]
    @contextmanager
    def lk(s,u,m):
        d=s.mp(u,m).parent;d.mkdir(parents=True,exist_ok=True);p=d/".quietchat.lock";end=time.monotonic()+8;fd=None
        while fd is None:
            try:fd=os.open(p,os.O_CREAT|os.O_EXCL|os.O_WRONLY)
            except FileExistsError:
                if time.monotonic()>end:raise E("busy")
                time.sleep(.05)
        try:yield
        finally:
            if fd:os.close(fd)
            try:p.unlink()
            except FileNotFoundError:pass
    def chat(s,u,t=""):
        d=s.cd(u);d.mkdir(parents=True,exist_ok=True);p=s.cp(u)
        x=j(p) if p.exists() else {"schema_version":1,"chat_id":chatId(u),"page_url":u,"title":t or "Untitled Chat","created_at":n(),"updated_at":n(),"messages":[]}
        x["updated_at"]=n()
        if t:x["title"]=str(t)[:160]
        wj(p,x);return x
    def create(s,o):
        u=ck(o.get("chatUrl") or o.get("chat_url"),"chatUrl");m=msgId(o.get("msgId") or o.get("message_id"));r={"schema_version":1,"chat_id":chatId(u),"chat_url":u,"message_id":m,"state":"pending","user_message":ck(o.get("msg") or o.get("message") or o.get("user_message"),"msg"),"assistant_reply":"","metadata":o.get("meta") or o.get("metadata") or {},"created_at":n(),"updated_at":n(),"status_log":[]}
        if s.mp(u,m).exists():raise E("exists")
        c=s.chat(u,o.get("title",""));wj(s.mp(u,m),r);c["messages"]=[x for x in c.get("messages",[]) if x.get("message_id")!=m]+[{"message_id":m,"state":"pending","created_at":r["created_at"],"updated_at":r["updated_at"]}];wj(s.cp(u),c)
        return ok({"msgId":m,"trigger":"@mcp checkmessage","explicit_trigger":f"Use quietchat_process_message for {m}.","record":r})
    def next(s,o):
        u=ck(o.get("chatUrl") or o.get("chat_url"),"chatUrl");r=s.latest(u,o.get("state","pending"))
        return ok({"msgId":r.get("message_id"),"state":r.get("state"),"user_message":r.get("user_message"),"metadata":r.get("metadata",{})})
    def process(s,o):
        u=ck(o.get("chatUrl") or o.get("chat_url"),"chatUrl");m=o.get("msgId") or o.get("message_id")
        compact=not bool(m)
        if not m:m=s.latest(u,"pending").get("message_id")
        m=ck(m,"msgId")
        with s.lk(u,m):
            r=j(s.mp(u,m));r["state"]="running";r["updated_at"]=n();r.setdefault("status_log",[]).append({"state":"running","note":"accepted","progress":0,"created_at":n()});wj(s.mp(u,m),r)
        visible="✓" if compact or o.get("compact") else f"Replied {m}"
        return ok({"msgId":m,"state":"running","user_message":r["user_message"],"metadata":r.get("metadata",{}),"compact":compact,"silent_contract":{"progress_tool":"MCP_Control qc.status","completion_tool":"MCP_Control qc.complete","visible_complete_reply":visible}})
    def status(s,o):
        u=ck(o.get("chatUrl") or o.get("chat_url"),"chatUrl");m=ck(o.get("msgId") or o.get("message_id"),"msgId")
        with s.lk(u,m):
            r=j(s.mp(u,m));x={"state":o.get("state","running"),"note":str(o.get("note",""))[:1200],"progress":o.get("progress"),"data":o.get("data") or {},"created_at":n()};r["state"]=x["state"];r["updated_at"]=n();r.setdefault("status_log",[]).append(x);wj(s.mp(u,m),r)
        return ok({"msgId":m,"state":r["state"],"latest_status":x})
    def complete(s,o):
        u=ck(o.get("chatUrl") or o.get("chat_url"),"chatUrl");m=ck(o.get("msgId") or o.get("message_id"),"msgId")
        with s.lk(u,m):
            r=j(s.mp(u,m));r["state"]="completed";r["assistant_reply"]=ck(o.get("reply") or o.get("assistant_reply"),"reply");r["summary"]=o.get("summary","");r["artifacts"]=o.get("artifacts") or [];r["updated_at"]=n();wj(s.mp(u,m),r)
        return ok({"msgId":m,"state":"completed","visible_reply":"✓" if o.get("compact") else f"Replied {m}"})
    def get(s,o):return ok({"record":j(s.mp(ck(o.get("chatUrl") or o.get("chat_url"),"chatUrl"),ck(o.get("msgId") or o.get("message_id"),"msgId")))})
    def list(s,o):
        u=ck(o.get("chatUrl") or o.get("chat_url"),"chatUrl");lim=max(1,min(int(o.get("limit",20)),200));st=o.get("state","");a=[]
        for p in sorted((s.cd(u)/"messages").glob("QC-*/message.json"),key=lambda p:p.stat().st_mtime,reverse=True):
            r=j(p)
            if st and r.get("state")!=st:continue
            a.append({k:r.get(k) for k in ("message_id","state","created_at","updated_at","summary")})
            if len(a)>=lim:break
        return ok({"chat":s.chat(u),"messages":a})
    def export(s,o):
        u=ck(o.get("chatUrl") or o.get("chat_url"),"chatUrl");days=int(o.get("days",5));cut=time.time()-days*86400;rows=[]
        for p in sorted((s.cd(u)/"messages").glob("QC-*/message.json"),key=lambda p:p.stat().st_mtime):
            if p.stat().st_mtime<cut:continue
            r=j(p);rows.append(r)
        out=safe(o.get("outPath") or o.get("path") or str(QR/f"PROJECT_MEMORY_{time.strftime('%Y-%m-%d')}.md"))
        lines=[f"# Project Memory",f"",f"- chat: {u}",f"- exported: {n()}",f"- span_days: {days}",f"- records: {len(rows)}","","## Current State"]
        for r in rows[-5:]:
            if r.get("summary"):lines.append(f"- {r['summary']}")
        lines+=["","## Timeline"]
        for r in rows:
            lines+=["",f"### {r.get('message_id')} [{r.get('state')}]","",f"User: {r.get('user_message','').strip()}"]
            if r.get("assistant_reply"):lines+=["",f"Assistant: {r.get('assistant_reply','').strip()}"]
            if r.get("summary"):lines+=["",f"Summary: {r.get('summary')}"]
        wb(out,"\n".join(lines).encode("utf-8"))
        return ok({"path":str(out),"bytes":out.stat().st_size,"records":len(rows),"sha256":sha(out)})

qc=QC()
def f_write(o):
    p=safe(o.get("path"));content=str(ck(o.get("content") if "content" in o else o.get("text"),"content"));mode=str(o.get("mode") or ("upsert" if o.get("overwrite",False) else "create")).lower()
    try:
        r=swop("file.write.smart",{**o,"path":str(p),"content":content,"mode":mode})
        rr=(r.get("result") or {}).get("result") or r.get("result") or {}
        if rr.get("state") in ("created","updated","dry_run"):return ok({"path":rr.get("path",str(p)),"bytes":rr.get("bytes",len(content.encode())),"sha256":rr.get("final_sha256") or rr.get("new_sha256"),"write_engine":"smart_worker","worker_state":rr.get("state"),"worker":r})
        raise E(rr.get("error") or rr.get("state") or "worker write failed")
    except Exception as e:
        b=content.encode()
        if o.get("expected_sha256"):raise
        if p.exists() and mode=="create":raise E("exists")
        wb(p,b);return ok({"path":str(p),"bytes":len(b),"sha256":sha(p),"write_engine":"legacy_fallback","worker_fallback":str(e)})
def f_batch(o):
    fs=ck(o.get("files"),"files");out=[];bad=[]
    for i,x in enumerate(fs):
        try:out.append(f_write({**x,"overwrite":o.get("overwrite",False) or x.get("overwrite",False)}))
        except Exception as e:bad.append({"i":i,"err":str(e)})
    return ok({"count":len(out),"failed":bad,"files":out})
def f_read(o):
    p=safe(o.get("path"))
    if not p.is_file():raise E("not file")
    t=p.read_text(encoding="utf-8",errors="replace");return ok({"path":str(p),"content":t[:int(o.get("maxChars",20000))],"bytes":p.stat().st_size,"sha256":sha(p)})
def f_info(o):
    p=safe(o.get("path"));z=p.stat();r={"path":str(p),"file":p.is_file(),"dir":p.is_dir(),"bytes":z.st_size,"mtime":z.st_mtime}
    if p.is_file():r["sha256"]=sha(p)
    return ok(r)
def qd(*a):
    p=WQ
    for x in a:p=p/x
    p.mkdir(parents=True,exist_ok=True);return p
def jq(o):
    if o.get("ram",True):
        b=json.dumps({"kind":ck(o.get("kind"),"kind"),"payload":o.get("payload") or {}},ensure_ascii=False).encode()
        req=urllib.request.Request(WI+"/queue",data=b,headers={"Content-Type":"application/json"},method="POST")
        return json.loads(urllib.request.urlopen(req,timeout=8).read().decode())
    jid=o.get("jobId") or f"JOB-{time.strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:6]}";r={"id":jid,"kind":ck(o.get("kind"),"kind"),"payload":o.get("payload") or {},"createdAt":n(),"state":"pending"}
    qd("pending");wj(WQ/"pending"/f"{jid}.json",r);return ok({"jobId":jid,"state":"pending","path":str(WQ/"pending"/f"{jid}.json")})
def js(o):
    jid=ck(o.get("jobId") or o.get("id"),"jobId")
    if o.get("ram",True):
        return json.loads(urllib.request.urlopen(WI+"/status/"+jid,timeout=8).read().decode())
    for d in ("results","done","error","running","pending"):
        for ext in (".result.json",".json"):
            p=WQ/d/f"{jid}{ext}"
            if p.exists():return ok({"jobId":jid,"state":d,"record":j(p)})
    raise E("job not found")
def jf(o):
    return ok({"queue":str(WQ),"pending":len(list((WQ/"pending").glob("*.json"))) if (WQ/"pending").exists() else 0})
def ig(path):return json.loads(urllib.request.urlopen(WI+path,timeout=8).read().decode())
def ip(o):
    b=json.dumps(o,ensure_ascii=False).encode();req=urllib.request.Request(WI+"/op",data=b,headers={"Content-Type":"application/json"},method="POST")
    try:return json.loads(urllib.request.urlopen(req,timeout=12).read().decode())
    except HTTPError as e:
        body=e.read().decode("utf-8","replace")
        try:return json.loads(body)
        except Exception:return {"status":"error","err":"HTTP","code":e.code,"body":body}
def swop(op,p,timeout=20):
    b=json.dumps({"op":op,"params":p or {}},ensure_ascii=False).encode();req=urllib.request.Request(SW+"/op",data=b,headers={"Content-Type":"application/json"},method="POST")
    return json.loads(urllib.request.urlopen(req,timeout=timeout).read().decode())
def rn(kind,o):return jq({"kind":kind,"payload":o,"ram":True})
def sop(op,o):return ip({"op":op,"params":o})
DIS={"ping":lambda o:ok({"server":"gandhi_control_lite","version":VERSION}),"version":lambda o:ok({"result":version_info()}),"system.version":lambda o:ok({"result":version_info()}),"message":lambda o:sop("message",o),"qc.slot.get":lambda o:sop("qc.slot.get",o),"qc.slot.process":lambda o:sop("qc.slot.process",o),"qc.slot.status":lambda o:sop("qc.slot.status",o),"qc.slot.complete":lambda o:sop("qc.slot.complete",o),"qc.reply":lambda o:sop("qc.reply",o),"done":lambda o:sop("done",o),"qc.done":lambda o:sop("qc.done",o),"qc.slot.clear":lambda o:sop("qc.slot.clear",o),"qc.create":qc.create,"qc.next":qc.next,"qc.process":qc.process,"qc.status":qc.status,"qc.complete":qc.complete,"qc.get":qc.get,"qc.list":qc.list,"qc.view":lambda o:ip({"op":"qc.view","params":o}),"qc.search":lambda o:ip({"op":"qc.search","params":o}),"qc.pin":lambda o:ip({"op":"qc.pin","params":o}),"file.write":f_write,"file.batch":f_batch,"file.read":lambda o:ip({"op":"file.read","params":o}),"file.info":lambda o:ip({"op":"file.info","params":o}),"file.search":lambda o:ip({"op":"file.search","params":o}),"file.functions":lambda o:ip({"op":"file.functions","params":o}),"memory.exportChat":qc.export,"writer.queue":jq,"writer.status":js,"writer.flush":jf,"scratch.note":lambda o:rn("scratch.note",o),"scratch.list":lambda o:ig("/scratch"),"scratch.get":lambda o:ig("/scratch/"+ck(o.get("id"),"id")),"seg.note":lambda o:rn("seg.note",o),"seg.list":lambda o:ig("/segment"),"seg.get":lambda o:ig("/segment/"+ck(o.get("id"),"id")),"daemon.op":ip}

@mcp.tool()
def MCP_Control(controlObj:dict)->dict:
    """Route {cmd,params}."""
    try:
        o=controlObj or {};c=o.get("cmd") or o.get("op");p=o.get("params") or o.get("param") or {}
        if not c:raise E("missing cmd/op")
        if c in DIS:return DIS[c](p)
        return ip({"op":c,"params":p})
    except Exception as e:return er("CTL01",e)

@mcp.tool()
def MCP_Help(helpObj:dict|None=None)->dict:
    """help(cmd?)."""
    c=(helpObj or {}).get("cmd")
    return ok({"cmds":CMDS,"cmd":c,"desc":CMDS.get(c,"") if c else ""})

@mcp.tool()
def ping()->dict:
    """health()."""
    return ok({"server":"gandhi_control_lite"})

if __name__=="__main__":
    mcp.run(transport="streamable-http")
