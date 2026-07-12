import json,os,time,hashlib,shutil,traceback,gzip
from pathlib import Path

QR=Path(os.environ.get("QUIETCHAT_DIR",r"D:\Projects\Chad\local\AI_MEMORY_FIN\GPT_QUIETCHAT_DONT_DELETE"))
WQ=Path(os.environ.get("WRITER_QUEUE_DIR",r"D:\Projects\Chad\writer_queue"))
MEM=Path(os.environ.get("MEMORY_DIR",r"D:\Projects\Chad\memory"))

def now():return time.strftime("%Y-%m-%dT%H:%M:%S%z")
def rd(p):return json.loads(Path(p).read_text(encoding="utf-8"))
def wr(p,x):Path(p).parent.mkdir(parents=True,exist_ok=True);Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding="utf-8")
def wb(p,b):Path(p).parent.mkdir(parents=True,exist_ok=True);Path(p).write_bytes(b)
def sha(p):
    h=hashlib.sha256()
    with Path(p).open("rb") as f:
        for b in iter(lambda:f.read(1048576),b""):h.update(b)
    return h.hexdigest()
def dirs():
    for d in ("pending","running","done","error","results"): (WQ/d).mkdir(parents=True,exist_ok=True)
    MEM.mkdir(parents=True,exist_ok=True);(MEM/"archive").mkdir(parents=True,exist_ok=True)
def chat_id(u):
    import re
    m=re.search(r"/c/([0-9a-f-]{20,})",str(u),re.I)
    return (m.group(1) if m else re.sub(r"[^A-Za-z0-9_.-]+","-",str(u)).strip("-.").lower()[:120])
def export_chat(p):
    u=p["chatUrl"];days=int(p.get("days",5));cut=time.time()-days*86400;cd=QR/chat_id(u)/"messages";rows=[]
    for f in sorted(cd.glob("QC-*/message.json"),key=lambda x:x.stat().st_mtime):
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
    arc=MEM/"archive"/(out.stem+".qcz");wb(arc,gzip.compress(out.read_bytes(),compresslevel=9))
    idx={"latest":str(out),"archive":str(arc),"days":days,"records":len(rows),"updatedAt":now(),"sha256":sha(out)}
    wr(MEM/"index.json",idx)
    return {"path":str(out),"archive":str(arc),"index":str(MEM/"index.json"),"bytes":out.stat().st_size,"records":len(rows),"sha256":sha(out)}
def write_file(p):
    out=Path(p["path"]);wb(out,str(p.get("content","")).encode("utf-8"));return {"path":str(out),"bytes":out.stat().st_size,"sha256":sha(out)}
def run(j):
    k=j["kind"];p=j.get("payload") or {}
    if k in ("memory.exportChat","exportChat"):return export_chat(p)
    if k in ("file.write","writeFile"):return write_file(p)
    raise RuntimeError(f"unknown kind:{k}")
def one(f):
    j=rd(f);jid=j.get("id") or f.stem;rp=WQ/"running"/f.name;shutil.move(str(f),rp);j["state"]="running";j["startedAt"]=now();wr(rp,j)
    try:
        res=run(j);j["state"]="done";j["finishedAt"]=now();j["result"]=res;wr(WQ/"results"/f"{jid}.result.json",j);shutil.move(str(rp),WQ/"done"/f.name)
    except Exception as e:
        j["state"]="error";j["finishedAt"]=now();j["error"]=str(e);j["trace"]=traceback.format_exc()[-4000:];wr(WQ/"results"/f"{jid}.result.json",j);shutil.move(str(rp),WQ/"error"/f.name)
def loop():
    dirs()
    while True:
        fs=sorted((WQ/"pending").glob("*.json"),key=lambda x:x.stat().st_mtime)
        if fs: one(fs[0])
        else: time.sleep(1)
if __name__=="__main__":
    print(f"writer_daemon watching {WQ}")
    loop()
