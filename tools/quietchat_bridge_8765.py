import json,os,re,time,uuid,urllib.request
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path

ROOT=Path(os.environ.get("QUIETCHAT_DIR",r"D:\Projects\Chad\local\AI_MEMORY_FIN\GPT_QUIETCHAT_DONT_DELETE"))
WI=os.environ.get("WRITER_INBOX_URL","http://127.0.0.1:8766")
CID=re.compile(r"(?i)(?:https?://[^/]+)?(?:/[^?#]*)?/c/([0-9a-f-]{20,})|^([0-9a-f-]{20,})$")
MID=re.compile(r"^QC-[A-Za-z0-9_.-]{3,64}$")

def now():return time.strftime("%Y-%m-%dT%H:%M:%S%z")
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
    u=x.get("chat_url","");c=chat(u,x.get("conversation_title") or x.get("title",""));m=mid(x.get("message_id",""));_,_,_,cp,mp=paths(c["chat_id"],m)
    if mp.exists():raise ValueError("message exists")
    r={"schema_version":1,"chat_id":c["chat_id"],"chat_url":u,"message_id":m,"state":"pending","user_message":x.get("user_message") or x.get("message",""),"assistant_reply":"","metadata":x.get("metadata") or {},"created_at":now(),"updated_at":now(),"status_log":[]}
    if not r["user_message"].strip():raise ValueError("message required")
    wr(mp,r);c["messages"]=[z for z in c.get("messages",[]) if z.get("message_id")!=m]+[{"message_id":m,"state":"pending","created_at":r["created_at"],"updated_at":r["updated_at"]}];wr(cp,c)
    slot=daemon_op("qc.slot.set",{"path":str(mp),"date":r["created_at"],"record":r})
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
        s.send_header("Access-Control-Allow-Origin","*");s.send_header("Access-Control-Allow-Headers","content-type");s.send_header("Access-Control-Allow-Methods","POST,OPTIONS");super().end_headers()
    def do_OPTIONS(s):s.send_response(204);s.end_headers()
    def do_POST(s):
        try:
            n=int(s.headers.get("content-length","0"));x=json.loads(s.rfile.read(n) or b"{}")
            if s.path.endswith("/create"):y=create(x)
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
