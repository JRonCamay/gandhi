import json,os,time,uuid,hashlib,gzip,threading,queue
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path

QR=Path(os.environ.get("QUIETCHAT_DIR",r"D:\Projects\Chad\local\AI_MEMORY_FIN\GPT_QUIETCHAT_DONT_DELETE"))
MEM=Path(os.environ.get("MEMORY_DIR",r"D:\Projects\Chad\memory"))
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
def cid(u):
    import re
    m=re.search(r"/c/([0-9a-f-]{20,})",str(u),re.I)
    return (m.group(1) if m else re.sub(r"[^A-Za-z0-9_.-]+","-",str(u)).strip("-.").lower()[:120])
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
def work():
    while True:
        j=Q.get();jid=j["id"];J[jid]|={"state":"running","startedAt":now()}
        try:
            k=j["kind"];p=j.get("payload") or {}
            if k in ("memory.exportChat","exportChat"):r=export_chat(p)
            elif k=="scratch.note":
                i=p.get("id") or f"SP-{time.strftime('%H%M%S')}-{uuid.uuid4().hex[:4]}";S[i]={"id":i,"text":p.get("text") or p.get("note",""),"tag":p.get("tag",""),"createdAt":now()};r=S[i]
            elif k in ("segment.note","seg.note"):
                i=p.get("id") or f"SG-{time.strftime('%H%M%S')}-{uuid.uuid4().hex[:4]}";G[i]={"id":i,"text":p.get("text") or p.get("note",""),"tag":p.get("tag",""),"createdAt":now()};r=G[i]
            else:raise RuntimeError(f"unknown kind:{k}")
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
        if s.path!="/queue":return s.send({"status":"error","msg":"bad path"},404)
        x=s.body();jid=x.get("jobId") or f"JOB-{time.strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:6]}";j={"id":jid,"kind":x.get("kind"),"payload":x.get("payload") or {},"state":"queued","createdAt":now()}
        if not j["kind"]:return s.send({"status":"error","msg":"missing kind"},400)
        J[jid]=j;Q.put(j);s.send({"status":"success","jobId":jid,"state":"queued"})
if __name__=="__main__":
    threading.Thread(target=work,daemon=True).start()
    print("writer_inbox: http://127.0.0.1:8766")
    ThreadingHTTPServer(("127.0.0.1",8766),H).serve_forever()
