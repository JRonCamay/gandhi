import json,os,re,tempfile,time,uuid
from contextlib import contextmanager
from pathlib import Path

ROOT=Path(os.environ.get("QUIETCHAT_DIR",r"D:\Projects\Chad\local\AI_MEMORY_FIN\GPT_QUIETCHAT_DONT_DELETE"))
ALLOWED=[Path(x.strip()) for x in os.environ.get("QUIETCHAT_ALLOWED_ROOTS",str(ROOT)).split(os.pathsep) if x.strip()]
CID=re.compile(r"(?i)(?:https?://[^/]+)?(?:/[^?#]*)?/c/([0-9a-f-]{20,})|^([0-9a-f-]{20,})$")
MID=re.compile(r"^QC-[A-Za-z0-9_.-]{3,64}$")
ST={"pending","running","completed","blocked","paused"}

class QCE(RuntimeError): pass
def now():return time.strftime("%Y-%m-%dT%H:%M:%S%z")
def ok(d=None):return {"status":"success",**(d or {})}
def er(c,e):return {"status":"error","err":c,"msg":str(e)}
def inside(p,r):
    try:p.relative_to(r);return True
    except ValueError:return False
def wrb(p,b):
    p.parent.mkdir(parents=True,exist_ok=True);fd,n=tempfile.mkstemp(prefix=p.name+".",dir=p.parent);t=Path(n)
    try:
        with os.fdopen(fd,"wb") as f:f.write(b);f.flush();os.fsync(f.fileno())
        os.replace(t,p)
    finally:
        if t.exists():t.unlink()
def wrj(p,d):wrb(p,json.dumps(d,ensure_ascii=False,indent=2).encode("utf-8"))
def rdj(p):
    try:return json.loads(p.read_text(encoding="utf-8"))
    except FileNotFoundError as e:raise QCE(f"not found:{p}") from e
    except json.JSONDecodeError as e:raise QCE(f"bad json:{p}") from e
def cid(v):
    v=str(v or "").strip();m=CID.search(v)
    if m:return (m.group(1) or m.group(2)).lower(),v if v.startswith(("http://","https://")) else ""
    c=re.sub(r"[^A-Za-z0-9_.-]+","-",v).strip("-.").lower()
    if c:return c[:120],v if v.startswith(("http://","https://")) else ""
    raise QCE("chat required")
def mid(v=""):
    v=str(v or "").strip()
    if v:
        if not MID.match(v):raise QCE("bad msg id")
        return v
    return f"QC-{time.strftime('%H%M%S')}-{uuid.uuid4().hex[:6]}"
def cut(v,n=1200):
    v=str(v or "").strip()
    return v[:n]+"...[truncated]" if len(v)>n else v

class Store:
    def __init__(s,root=ROOT,allowed=None):
        s.r=Path(root).expanduser().resolve();a=ALLOWED if allowed is None else allowed
        s.a=[Path(x).expanduser().resolve() for x in a]
        if s.a and not any(inside(s.r,x) or s.r==x for x in s.a):raise QCE("root blocked")
        s.r.mkdir(parents=True,exist_ok=True)
    def cd(s,u):i,_=cid(u);return s.r/i
    def md(s,u,m):return s.cd(u)/"messages"/mid(m)
    def cp(s,u):return s.cd(u)/"chat.json"
    def mp(s,u,m):return s.md(u,m)/"message.json"
    @contextmanager
    def lk(s,u,m,to=10.0):
        d=s.md(u,m);d.mkdir(parents=True,exist_ok=True);p=d/".quietchat.lock";end=time.monotonic()+max(.1,float(to));fd=None
        while fd is None:
            try:fd=os.open(p,os.O_CREAT|os.O_EXCL|os.O_WRONLY);os.write(fd,f"pid={os.getpid()} time={now()}".encode())
            except FileExistsError:
                if time.monotonic()>=end:raise QCE("busy")
                time.sleep(.05)
        try:yield
        finally:
            if fd is not None:os.close(fd)
            try:p.unlink()
            except FileNotFoundError:pass
    def chat(s,u,t=""):
        i,pg=cid(u);d=s.cd(i);d.mkdir(parents=True,exist_ok=True);p=s.cp(i)
        r=rdj(p) if p.exists() else {"schema_version":1,"chat_id":i,"page_url":pg,"title":t or "Untitled Chat","created_at":now(),"updated_at":now(),"messages":[]}
        if pg and not r.get("page_url"):r["page_url"]=pg
        if t:r["title"]=" ".join(str(t).split())[:160]
        r["updated_at"]=now();wrj(p,r);return r
    def save(s,r):wrj(s.mp(r["chat_id"],r["message_id"]),r)
    def load(s,u,m):return rdj(s.mp(u,m))
    def trig(s,m):return "@mcp checkmessage"
    def latest(s,u,state="pending"):
        d=s.cd(u)/"messages";found=[]
        for p in d.glob("QC-*/message.json"):
            try:
                r=rdj(p)
                if state and r.get("state")!=state:continue
                found.append((p.stat().st_mtime,r))
            except QCE:
                pass
        if not found:raise QCE(f"no {state or 'matching'} message")
        return sorted(found,key=lambda x:x[0],reverse=True)[0][1]
    def new(s,u,msg,title="",message_id="",meta=None):
        if not str(msg or "").strip():raise QCE("msg required")
        c=s.chat(u,title);m=mid(message_id);p=s.mp(c["chat_id"],m)
        if p.exists():raise QCE(f"exists:{m}")
        r={"schema_version":1,"chat_id":c["chat_id"],"chat_url":u,"message_id":m,"state":"pending","user_message":msg,"assistant_reply":"","metadata":meta or {},"created_at":now(),"updated_at":now(),"status_log":[]}
        wrj(p,r);c["messages"]=[x for x in c.get("messages",[]) if x.get("message_id")!=m]+[{"message_id":m,"state":"pending","created_at":r["created_at"],"updated_at":r["updated_at"]}];wrj(s.cp(c["chat_id"]),c)
        return ok({"message_id":m,"trigger":s.trig(m),"explicit_trigger":f"Use quietchat_process_message for {m}.","record":r})
    def run(s,u,m):
        compact=not bool(str(m or "").strip())
        if compact:m=s.latest(u,"pending").get("message_id")
        with s.lk(u,m):
            r=s.load(u,m)
            if r["state"] not in {"pending","running"}:raise QCE(f"bad state:{r['state']}")
            r["state"]="running";r["updated_at"]=now();r.setdefault("status_log",[]).append({"state":"running","note":"accepted","progress":0,"created_at":now()});s.save(r)
        visible="✓" if compact else f"Replied {m}"
        return ok({"message_id":m,"state":"running","user_message":r["user_message"],"metadata":r.get("metadata",{}),"compact":compact,"silent_contract":{"progress_tool":"quietchat_update_status","completion_tool":"quietchat_complete_message","visible_complete_reply":visible,"visible_paused_reply":f"Paused {m}","visible_blocked_reply":f"Blocked {m}"}})
    def stat(s,u,m,state="running",note="",progress=None,data=None):
        if state and state not in {"pending","running","blocked","paused"}:raise QCE("bad state")
        with s.lk(u,m):
            r=s.load(u,m);r["state"]=state or r.get("state","running");r["updated_at"]=now();x={"state":r["state"],"note":cut(note),"progress":progress,"data":data or {},"created_at":now()};r.setdefault("status_log",[]).append(x);s.save(r)
        return ok({"message_id":m,"state":r["state"],"latest_status":x})
    def done(s,u,m,reply,summary="",artifacts=None):
        if not str(reply or "").strip():raise QCE("reply required")
        with s.lk(u,m):
            r=s.load(u,m);r["state"]="completed";r["assistant_reply"]=reply;r["summary"]=summary;r["artifacts"]=artifacts or [];r["updated_at"]=now();s.save(r)
        return ok({"message_id":m,"state":"completed","visible_reply":f"Replied {m}"})
    def get(s,u,m,um=True,ar=True):
        r=s.load(u,m)
        if not um:r.pop("user_message",None)
        if not ar:r.pop("assistant_reply",None)
        return ok({"record":r})
    def lst(s,u,limit=20,state=""):
        c=s.chat(u);d=s.cd(c["chat_id"])/"messages";a=[]
        for p in sorted(d.glob("QC-*/message.json"),key=lambda x:x.stat().st_mtime,reverse=True):
            try:
                r=rdj(p)
                if state and r.get("state")!=state:continue
                a.append({k:r.get(k) for k in ("message_id","state","created_at","updated_at","summary")})
                if len(a)>=max(1,min(int(limit or 20),200)):break
            except QCE:pass
        return ok({"chat":c,"messages":a})

def register_quietchat_lite_tools(mcp,storage_root=ROOT,allowed_roots=None):
    s=Store(storage_root,allowed_roots)
    def call(c,f,*a,**k):
        try:return f(*a,**k)
        except QCE as e:return er(c,e)
        except Exception as e:return er(c,e)
    def op(x):
        x=x or {};m=str(x.get("op") or x.get("operationMode") or "").lower();u=x.get("chat_url","");i=x.get("message_id","")
        if m in {"new","create","write"}:return call("QCOP01",s.new,u,x.get("user_message") or x.get("message") or "",x.get("title") or x.get("conversation_title",""),i,x.get("metadata"))
        if m in {"run","process","load"}:return call("QCOP02",s.run,u,i)
        if m in {"status","update"}:return call("QCOP03",s.stat,u,i,x.get("state","running"),x.get("note",""),x.get("progress"),x.get("data"))
        if m in {"done","complete"}:return call("QCOP04",s.done,u,i,x.get("assistant_reply") or x.get("reply") or "",x.get("summary",""),x.get("artifacts"))
        if m in {"get","read"}:return call("QCOP05",s.get,u,i,x.get("include_user_message",True),x.get("include_assistant_reply",True))
        if m in {"list","scan"}:return call("QCOP06",s.lst,u,x.get("limit",20),x.get("state",""))
        return er("QCOP00","bad op")
    @mcp.tool()
    def quietChat(opObj:dict)->dict:
        """quietChat(opObj:{op,chat_url,message_id,...})."""
        return op(opObj)
    @mcp.tool()
    def qcNew(msgObj:dict)->dict:
        """createQuietChat(msgObj:{chat_url,user_message,title?,message_id?,metadata?})."""
        x=msgObj or {};return call("QCNEW01",s.new,x.get("chat_url",""),x.get("user_message",""),x.get("title") or x.get("conversation_title",""),x.get("message_id",""),x.get("metadata"))
    @mcp.tool()
    def quietchat_process_message(chat_url:str,message_id:str="")->dict:
        """processQuietChat(chat_url,message_id)."""
        return call("QCRUN01",s.run,chat_url,message_id)
    @mcp.tool()
    def quietchat_update_status(chat_url:str,message_id:str,state:str="running",note:str="",progress:int|None=None,data:dict|None=None)->dict:
        """updateQuietChatStatus(chat_url,message_id,state,note,progress,data)."""
        return call("QCSTAT01",s.stat,chat_url,message_id,state,note,progress,data)
    @mcp.tool()
    def quietchat_complete_message(chat_url:str,message_id:str,assistant_reply:str,summary:str="",artifacts:list[dict]|None=None)->dict:
        """completeQuietChat(chat_url,message_id,assistant_reply)."""
        return call("QCDONE01",s.done,chat_url,message_id,assistant_reply,summary,artifacts)
    @mcp.tool()
    def qcGet(msgObj:dict)->dict:
        """getQuietChat(msgObj:{chat_url,message_id})."""
        x=msgObj or {};return call("QCGET01",s.get,x.get("chat_url",""),x.get("message_id",""),x.get("include_user_message",True),x.get("include_assistant_reply",True))
    @mcp.tool()
    def qcList(msgObj:dict)->dict:
        """listQuietChat(msgObj:{chat_url,limit?,state?})."""
        x=msgObj or {};return call("QCLIST01",s.lst,x.get("chat_url",""),x.get("limit",20),x.get("state",""))
    return s
