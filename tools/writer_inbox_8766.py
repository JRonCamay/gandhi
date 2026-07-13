import json,os,time,uuid,hashlib,gzip,threading,queue
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path

QR=Path(os.environ.get("QUIETCHAT_DIR",r"D:\Projects\Chad\local\AI_MEMORY_FIN\GPT_QUIETCHAT_DONT_DELETE"))
MEM=Path(os.environ.get("MEMORY_DIR",r"D:\Projects\Chad\memory"))
FR=[Path(x.strip()) for x in os.environ.get("LOCAL_FILE_ALLOWED_ROOTS",r"D:\Projects\Chad;D:\Projects\Chad\local\AI_MEMORY_FIN").split(";") if x.strip()]
Q=queue.Queue();J={};S={};G={}

def now():return time.strftime("%Y-%m-%dT%H:%M:%S%z")
def rd(p):return json.loads(Path(p).read_text(encoding="utf-8"))
def wb(p,b):Path(p).parent.mkdir(parents=True,exist_ok=True);Path(p).write_bytes(b)
def wj(p,x):Path(p).parent.mkdir(parents=True,exist_ok=True);Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding="utf-8")
def sha(p):
    h=hashlib.sha256()
    with Path(p).open("rb") as f:
        for b in iter(lambda:f.read(1048576),b""):h.update(b)
    return h.hexdigest()
def inside(p,r):
    try:Path(p).resolve().relative_to(Path(r).resolve());return True
    except Exception:return False
def safe(p):
    p=Path(p).expanduser().resolve()
    if not any(inside(p,r) or p==Path(r).expanduser().resolve() for r in FR):raise RuntimeError("blocked path")
    return p
def cid(u):
    import re
    m=re.search(r"/c/([0-9a-f-]{20,})",str(u),re.I)
    return (m.group(1) if m else re.sub(r"[^A-Za-z0-9_.-]+","-",str(u)).strip("-.").lower()[:120])
def qc_rows(u,limit=200,state=""):
    rows=[]
    for f in sorted((QR/cid(u)/"messages").glob("QC-*/message.json"),key=lambda x:x.stat().st_mtime):
        r=rd(f)
        if state and r.get("state")!=state:continue
        rows.append(r)
    return rows[-max(1,min(int(limit),500)):]
def qc_view(p):
    u=p["chatUrl"];mx=max(1,min(int(p.get("limit",20)),500));stale_after=int(p.get("staleAfter",120))
    rows=qc_rows(u,int(p.get("scanLimit",200)));total=len(rows);vis=rows[-mx:];latest=rows[-1] if rows else {}
    state=latest.get("state","idle");log=latest.get("status_log") or [];last=log[-1] if log else {}
    lock=state in ("pending","running");stale=False
    if lock:
        ts=latest.get("updated_at") or latest.get("created_at") or ""
        try:
            stale=time.time()-time.mktime(time.strptime(ts[:19],"%Y-%m-%dT%H:%M:%S"))>stale_after
        except Exception:stale=False
    note=last.get("note") or ("Waiting for assistant reply." if lock else "QuietChat ready.")
    if stale:note="No recent progress update. Assistant may be busy or stalled."
    msgs=[{k:r.get(k) for k in ("message_id","state","user_message","assistant_reply","summary","pin_name","pin_user","pin_assistant","pinned_at","pin_user_at","pin_assistant_at","created_at","updated_at","status_log")} for r in vis]
    return {"chatUrl":u,"lock":lock,"stale":stale,"statusText":note,"latestState":state,"latestMsgId":latest.get("message_id"),"totalRecords":total,"visibleRecords":len(vis),"hiddenRecords":max(0,total-len(vis)),"messages":msgs}
def qc_search(p):
    u=p["chatUrl"];q=str(p.get("query") or p.get("q","")).strip();mx=max(1,min(int(p.get("limit",50)),200));out=[]
    if not q:return {"chatUrl":u,"query":q,"count":0,"results":[]}
    ql=q.lower()
    for r in qc_rows(u,500):
        pins=(("pin_user","pin_user","user pin"),("pin_assistant","pin_assistant","assistant pin"),("pin_name","pin","pin"))
        matched=False
        for pk,role,label in pins:
            pn=str(r.get(pk) or "")
            pi=pn.lower().find(ql)
            if pi<0:continue
            out.append({"message_id":r.get("message_id"),"state":r.get("state"),"role":role,"snippet":"📌 "+pn,"preview":pn,"created_at":r.get("created_at"),"updated_at":r.get("updated_at"),"pin_name":pn,"pin_side":label})
            matched=True
            break
        if matched:
            if len(out)>=mx:break
            continue
        for k,role in (("user_message","user"),("assistant_reply","assistant"),("summary","summary")):
            t=str(r.get(k) or "")
            i=t.lower().find(ql)
            if i<0:continue
            a=max(0,i-80);b=min(len(t),i+len(q)+120);pa=max(0,i-220);pb=min(len(t),i+len(q)+300)
            s=("…" if a else "")+t[a:b].replace("\r"," ").replace("\n"," ")+("…" if b<len(t) else "")
            pv=("…" if pa else "")+t[pa:pb].replace("\r","")+("…" if pb<len(t) else "")
            out.append({"message_id":r.get("message_id"),"state":r.get("state"),"role":role,"snippet":s,"preview":pv,"created_at":r.get("created_at"),"updated_at":r.get("updated_at")})
            break
        if len(out)>=mx:break
    return {"chatUrl":u,"query":q,"count":len(out),"results":out}
def qc_pin(p):
    u=p["chatUrl"];m=str(p.get("msgId") or p.get("message_id") or "").strip()
    if not m:raise RuntimeError("missing msgId")
    f=QR/cid(u)/"messages"/m/"message.json"
    if not f.exists():raise RuntimeError("message not found")
    r=rd(f);name=str(p.get("pinName") or p.get("pin_name") or p.get("name") or "").strip();side=str(p.get("side") or p.get("target") or "").strip().lower()
    key="pin_assistant" if side in ("assistant","a","reply") else "pin_user" if side in ("user","u","message") else "pin_name"
    at={"pin_user":"pin_user_at","pin_assistant":"pin_assistant_at","pin_name":"pinned_at"}[key]
    if name:
        r[key]=name[:120];r[at]=now()
    else:
        r.pop(key,None);r.pop(at,None)
    r["updated_at"]=now();wj(f,r)
    return {"chatUrl":u,"msgId":m,"side":side or "legacy","pinName":r.get(key,""),"pinned":bool(r.get(key))}
def export_chat(p):
    u=p["chatUrl"];days=int(p.get("days",5));cut=time.time()-days*86400;rows=[]
    for f in sorted((QR/cid(u)/"messages").glob("QC-*/message.json"),key=lambda x:x.stat().st_mtime):
        if f.stat().st_mtime>=cut:rows.append(rd(f))
    out=Path(p.get("outPath") or MEM/f"PROJECT_MEMORY_{time.strftime('%Y-%m-%d')}.md")
    lines=["# Project Memory","",f"- chat: {u}",f"- exported: {now()}",f"- days: {days}",f"- records: {len(rows)}","","## Current State"]
    for r in rows[-8:]:
        if r.get("summary"):lines.append(f"- {r['summary']}")
    lines+=["","## Timeline"]
    for r in rows:
        lines+=["",f"### {r.get('message_id')} [{r.get('state')}]",f"- time: {r.get('updated_at') or r.get('created_at')}","",f"User: {r.get('user_message','').strip()}"]
        if r.get("assistant_reply"):lines+=["",f"Assistant: {r.get('assistant_reply','').strip()}"]
        if r.get("summary"):lines+=["",f"Summary: {r.get('summary')}"]
    wb(out,"\n".join(lines).encode("utf-8"))
    arc=MEM/"archive"/(out.stem+".qcz");wb(arc,gzip.compress(out.read_bytes(),9))
    idx={"latest":str(out),"archive":str(arc),"days":days,"records":len(rows),"updatedAt":now(),"sha256":sha(out)}
    wj(MEM/"index.json",idx)
    return {"path":str(out),"archive":str(arc),"index":str(MEM/"index.json"),"bytes":out.stat().st_size,"records":len(rows),"sha256":sha(out)}
def file_info(p):
    f=safe(p["path"]);z=f.stat();r={"path":str(f),"file":f.is_file(),"dir":f.is_dir(),"bytes":z.st_size,"mtime":z.st_mtime}
    if f.is_file():r["sha256"]=sha(f)
    return r
def file_read(p):
    f=safe(p["path"]);t=f.read_text(encoding="utf-8",errors="replace");return {"path":str(f),"content":t[:int(p.get("maxChars",12000))],"bytes":f.stat().st_size,"sha256":sha(f)}
def file_write(p):
    f=safe(p["path"]);b=str(p.get("content") or p.get("text","")).encode("utf-8");wb(f,b);return {"path":str(f),"bytes":len(b),"sha256":sha(f)}
def file_search(p):
    f=safe(p["path"]);q=str(p.get("query") or p.get("q",""));mx=int(p.get("max",50));out=[]
    for i,l in enumerate(f.read_text(encoding="utf-8",errors="replace").splitlines(),1):
        if q in l:
            out.append({"line":i,"text":l[:240]})
            if len(out)>=mx:break
    return {"path":str(f),"query":q,"matches":out,"count":len(out)}
def file_funcs(p):
    import re
    f=safe(p["path"]);a=[]
    for i,l in enumerate(f.read_text(encoding="utf-8",errors="replace").splitlines(),1):
        m=re.match(r"\s*(?:async\s+)?def\s+([A-Za-z_]\w*)\s*\(|\s*(?:function\s+)?([A-Za-z_$][\w$]*)\s*\(",l)
        if m:a.append({"line":i,"name":m.group(1) or m.group(2)})
    return {"path":str(f),"functions":a,"count":len(a)}
def op(x):
    o=x.get("op") or x.get("operation") or x.get("kind");p=x.get("params") or x.get("payload") or {}
    if o in ("qc.view","view"):return qc_view(p)
    if o in ("qc.search","qsearch"):return qc_search(p)
    if o in ("qc.pin","pin"):return qc_pin(p)
    if o in ("memory.exportChat","exportChat"):return export_chat(p)
    if o in ("file.info","info"):return file_info(p)
    if o in ("file.read","read"):return file_read(p)
    if o in ("file.write","write"):return file_write(p)
    if o in ("file.search","search"):return file_search(p)
    if o in ("file.functions","functions","funcs"):return file_funcs(p)
    if o=="scratch.note":
        i=p.get("id") or f"SP-{time.strftime('%H%M%S')}-{uuid.uuid4().hex[:4]}";S[i]={"id":i,"text":p.get("text") or p.get("note",""),"tag":p.get("tag",""),"createdAt":now()};return S[i]
    if o in ("seg.note","segment.note"):
        i=p.get("id") or f"SG-{time.strftime('%H%M%S')}-{uuid.uuid4().hex[:4]}";G[i]={"id":i,"text":p.get("text") or p.get("note",""),"tag":p.get("tag",""),"createdAt":now()};return G[i]
    raise RuntimeError(f"bad op:{o}")
def work():
    while True:
        j=Q.get();jid=j["id"];J[jid]|={"state":"running","startedAt":now()}
        try:
            k=j["kind"];p=j.get("payload") or {}
            r=op({"op":k,"params":p})
            J[jid]|={"state":"done","finishedAt":now(),"result":r}
        except Exception as e:J[jid]|={"state":"error","finishedAt":now(),"error":str(e)}
        Q.task_done()
class H(BaseHTTPRequestHandler):
    def send(s,x,code=200):
        b=json.dumps(x,ensure_ascii=False).encode();s.send_response(code);s.send_header("Content-Type","application/json");s.send_header("Access-Control-Allow-Origin","*");s.send_header("Content-Length",str(len(b)));s.end_headers();s.wfile.write(b)
    def do_OPTIONS(s):s.send({})
    def body(s):
        return json.loads(s.rfile.read(int(s.headers.get("Content-Length","0") or 0)) or b"{}")
    def do_GET(s):
        if s.path.startswith("/status/"):
            jid=s.path.rsplit("/",1)[-1];return s.send({"status":"success","job":J.get(jid) or {"state":"missing","id":jid}})
        if s.path=="/health":return s.send({"status":"success","server":"writer_inbox","jobs":len(J),"queued":Q.qsize()})
        if s.path=="/scratch":return s.send({"status":"success","items":list(S.values())})
        if s.path.startswith("/scratch/"):
            i=s.path.rsplit("/",1)[-1];return s.send({"status":"success","item":S.get(i)})
        if s.path=="/segment":return s.send({"status":"success","items":list(G.values())})
        if s.path.startswith("/segment/"):
            i=s.path.rsplit("/",1)[-1];return s.send({"status":"success","item":G.get(i)})
        s.send({"status":"error","msg":"bad path"},404)
    def do_POST(s):
        if s.path=="/op":
            try:return s.send({"status":"success","result":op(s.body())})
            except Exception as e:return s.send({"status":"error","msg":str(e)},400)
        if s.path!="/queue":return s.send({"status":"error","msg":"bad path"},404)
        x=s.body();jid=x.get("jobId") or f"JOB-{time.strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:6]}";j={"id":jid,"kind":x.get("kind"),"payload":x.get("payload") or {},"state":"queued","createdAt":now()}
        if not j["kind"]:return s.send({"status":"error","msg":"missing kind"},400)
        J[jid]=j;Q.put(j);s.send({"status":"success","jobId":jid,"state":"queued"})
if __name__=="__main__":
    threading.Thread(target=work,daemon=True).start()
    print("writer_inbox: http://127.0.0.1:8766")
    ThreadingHTTPServer(("127.0.0.1",8766),H).serve_forever()
