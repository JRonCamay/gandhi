import json,os,time,uuid,threading,queue
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path

VERSION="quietchat_writer_daemon_8767 v0.1.0"
Q=queue.Queue()
J={}

def now():return time.strftime("%Y-%m-%dT%H:%M:%S%z")
def rd(p):return json.loads(Path(p).read_text(encoding="utf-8"))
def wj(p,x):Path(p).parent.mkdir(parents=True,exist_ok=True);Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding="utf-8")
def persist_record(path,record):
    f=Path(path);r=dict(record or {})
    if not r:raise RuntimeError("missing record")
    r.setdefault("schema_version",1);r.setdefault("state","pending");r.setdefault("assistant_reply","");r.setdefault("status_log",[])
    r["updated_at"]=now();wj(f,r)
    cp=f.parents[1]/"chat.json"
    c=rd(cp) if cp.exists() else {"schema_version":1,"chat_id":r.get("chat_id"),"page_url":r.get("chat_url",""),"title":"ChatGPT","created_at":r.get("created_at") or now(),"updated_at":now(),"messages":[]}
    c["updated_at"]=now()
    c["messages"]=[z for z in c.get("messages",[]) if z.get("message_id")!=r.get("message_id")]+[{"message_id":r.get("message_id"),"state":r.get("state"),"created_at":r.get("created_at"),"updated_at":r.get("updated_at")}]
    wj(cp,c)
    return r
def version_info():
    return {"name":"quietchat_writer","version":VERSION,"port":8767,"queued":Q.qsize(),"jobs":len(J),"features":["queued-json-writes","chat-index-update"]}
def worker():
    while True:
        j=Q.get();jid=j["id"];J[jid]|={"state":"running","started_at":now()}
        try:
            rec=persist_record(j["path"],j["record"])
            J[jid]|={"state":"done","finished_at":now(),"result":{"path":j["path"],"record":rec}}
        except Exception as e:
            J[jid]|={"state":"error","finished_at":now(),"error":str(e)}
        Q.task_done()
class H(BaseHTTPRequestHandler):
    def send(s,x,code=200):
        b=json.dumps(x,ensure_ascii=False).encode();s.send_response(code);s.send_header("Content-Type","application/json");s.send_header("Access-Control-Allow-Origin","*");s.send_header("Content-Length",str(len(b)));s.end_headers();s.wfile.write(b)
    def body(s):return json.loads(s.rfile.read(int(s.headers.get("Content-Length","0") or 0)) or b"{}")
    def do_OPTIONS(s):s.send({})
    def do_GET(s):
        if s.path=="/health":return s.send({"status":"success","result":version_info()})
        if s.path=="/version":return s.send({"status":"success","result":version_info()})
        if s.path.startswith("/status/"):
            jid=s.path.rsplit("/",1)[-1];return s.send({"status":"success","job":J.get(jid) or {"id":jid,"state":"missing"}})
        s.send({"status":"error","msg":"bad path"},404)
    def do_POST(s):
        if s.path!="/queue":return s.send({"status":"error","msg":"bad path"},404)
        try:
            x=s.body();jid=x.get("job_id") or f"WJ-{time.strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:6]}"
            j={"id":jid,"path":x["path"],"record":x["record"],"state":"queued","created_at":now()}
            J[jid]=j;Q.put(j);s.send({"status":"success","job_id":jid,"state":"queued","queued":Q.qsize()})
        except Exception as e:s.send({"status":"error","msg":str(e)},400)
if __name__=="__main__":
    threading.Thread(target=worker,daemon=True).start()
    print("quietchat_writer: http://127.0.0.1:8767")
    ThreadingHTTPServer(("127.0.0.1",8767),H).serve_forever()
