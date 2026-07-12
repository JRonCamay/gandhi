import ast
import re
import textwrap
from pathlib import Path

SRC = Path(r"D:\Projects\Chad\py\gandhi_mcp_server.py")
OUT = Path(r"D:\Projects\Chad\py\byork_split")
HOSTS = '["127.0.0.1","localhost","perch-tripping-crushed.ngrok-free.dev"]'
PORTS = {"core":8001,"fpow":8002,"fp":8003,"git":8004,"mem":8005,"day":8006,"sp":8007,"ctx":8008,"qc":8009,"sf":8010,"corex":8011}
FPOW = "read_file write_file append_file search_text replace_text patch_file file_info list_files".split()
DOC = {"qc":"QC msg.","sf":"Section flow.","fpow":"Files.","fp":"Hash check.","git":"Git.","mem":"Memory.","day":"Daily mem.","sp":"Scratch.","ctx":"Context.","core":"Core.","corex":"Other."}
SHORT = [("quietchat","qc"),("message","msg"),("segmentflow","sf"),("segment","seg"),("fingerprint","fp"),("checksum","sha"),("memory","mem"),("scratchpad","sp"),("scratch","sp"),("context","ctx"),("filepower","fpow"),("file","f"),("text","txt"),("status","stat"),("process","proc"),("create","new"),("complete","done"),("update","upd"),("append","add"),("replace","rep"),("search","find"),("verify","chk"),("compare","cmp"),("list","ls"),("read","rd"),("write","wr")]


def short(n):
    s = n
    for a, b in SHORT:
        s = s.replace(a, b)
    s = re.sub(r"_+", "_", s).strip("_")
    return s or n


def is_tool(fn):
    return any(isinstance(d, ast.Call) and isinstance(d.func, ast.Attribute) and d.func.attr == "tool" for d in fn.decorator_list)


def clean_prefix(s):
    s = s.replace("from mcp.server.fastmcp import FastMCP\n", "")
    s = s.replace("from mcp.server.streamable_http import TransportSecuritySettings\n", "")
    s = re.sub(r"\nmcp = FastMCP\([\s\S]*?\n\)\n\n", "\n", s, count=1)
    return re.sub(r"^\s*@mcp\.tool\([^\n]*\)\s*\r?\n", "", s, flags=re.M)


def cut_doc(src, name, newname=None):
    src = re.sub(r"^\s*@mcp\.tool\([^\n]*\)\s*\r?\n", "", src, flags=re.M)
    if newname:
        src = re.sub(r"^def\s+\w+\s*\(", f"def {newname}(", src, count=1, flags=re.M)
    lines = src.splitlines(True)
    if not lines: return src
    out, i = [lines[0]], 1
    while i < len(lines) and (not lines[i].strip() or lines[i].lstrip().startswith(('"""', "'''"))):
        if lines[i].lstrip().startswith(('"""', "'''")):
            q = lines[i].lstrip()[:3]; i += 1
            while i < len(lines) and q not in lines[i]: i += 1
            i += 1
            break
        i += 1
    ind = re.match(r"^(\s*)", lines[1] if len(lines) > 1 else "    ").group(1) or "    "
    out.append(ind + f'"""{" ".join(short(name).split("_")[:3])}."""\n')
    out.extend(lines[i:])
    return "".join(out)


def mod_code(group, names, funcs, aliases):
    out = ["from byork_shared import *\n\n", f'DESCRIPTION="{DOC.get(group, group)}"\n\n', "def register(mcp):\n"]
    if not names: out.append("    return mcp\n")
    for n in names:
        out.append(textwrap.indent("@mcp.tool()\n" + cut_doc(funcs[n], n, aliases[n]), "    ") + "\n")
    out.append("\n    return mcp\n")
    return "".join(out)


def srv(mod, name, port):
    return f'''import argparse
from mcp.server.fastmcp import FastMCP
from mcp.server.streamable_http import TransportSecuritySettings
import {mod}

def build_mcp(port={port}):
    mcp=FastMCP("{name}",host="127.0.0.1",port=port,streamable_http_path="/mcp",transport_security=TransportSecuritySettings(enable_dns_rebinding_protection=True,allowed_hosts={HOSTS}))
    {mod}.register(mcp)
    return mcp
if __name__=="__main__":
    p=argparse.ArgumentParser(); p.add_argument("--port",type=int,default={port})
    build_mcp(p.parse_args().port).run(transport="streamable-http")
'''


def gate(name, mods):
    im = "\n".join(f"import {m} as m{i}" for i, m in enumerate(mods))
    rg = "\n    ".join(f"m{i}.register(mcp)" for i in range(len(mods)))
    return f'''import argparse
from mcp.server.fastmcp import FastMCP
from mcp.server.streamable_http import TransportSecuritySettings
{im}

def build_mcp(port=8000):
    mcp=FastMCP("{name}",host="127.0.0.1",port=port,streamable_http_path="/mcp",transport_security=TransportSecuritySettings(enable_dns_rebinding_protection=True,allowed_hosts={HOSTS}))
    {rg}
    return mcp
if __name__=="__main__":
    p=argparse.ArgumentParser(); p.add_argument("--port",type=int,default=8000)
    build_mcp(p.parse_args().port).run(transport="streamable-http")
'''


def main():
    txt = SRC.read_text(encoding="utf-8", errors="ignore")
    lines = txt.splitlines(True)
    tree = ast.parse(txt)
    nodes = [n for n in tree.body if isinstance(n, ast.FunctionDef) and is_tool(n)]
    funcs = {n.name: re.sub(r"^\s*@mcp\.tool\([^\n]*\)\s*\r?\n", "", "".join(lines[n.lineno-1:n.end_lineno]), count=1, flags=re.M) for n in nodes}
    aliases = {n: short(n) for n in funcs}
    prefix = clean_prefix("".join(lines[:min(n.lineno for n in nodes)-1]))
    impl = re.sub(r"^\s*@mcp\.tool\([^\n]*\)\s*\r?\n", "", prefix + "\n" + "\n\n".join(cut_doc(v, k) for k, v in funcs.items()), flags=re.M)

    groups = {}
    groups["core"] = [n for n in ["ping", "repo_info"] if n in funcs]
    groups["git"] = [n for n in funcs if n.startswith("git_")]
    groups["fp"] = [n for n in ["verify_checksum", "file_checksum", "compare_files", "verify_repo_clean"] if n in funcs]
    groups["fpow"] = [n for n in FPOW if n in funcs]
    groups["ctx"] = [n for n in funcs if n.startswith("ctx") or n.startswith("context")]
    groups["mem"] = [n for n in funcs if "memory" in n.lower() and "daily" not in n.lower()]
    groups["day"] = [n for n in funcs if "daily" in n.lower()]
    groups["sp"] = [n for n in funcs if "scratch" in n.lower()]
    groups["qc"] = [n for n in funcs if "quietchat" in n.lower()]
    groups["sf"] = [n for n in funcs if "segment" in n.lower() or "flow" in n.lower()]
    used = set(sum(groups.values(), []))
    groups["corex"] = [n for n in funcs if n not in used]

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT/"byork_impl.py").write_text(impl, encoding="utf-8")
    (OUT/"byork_shared.py").write_text("from byork_impl import *\n", encoding="utf-8")
    for g, ns in groups.items():
        mod = f"byork_{g}_tools"
        (OUT/f"{mod}.py").write_text(mod_code(g, ns, funcs, aliases), encoding="utf-8")
        (OUT/f"byork_{g}_server.py").write_text(srv(mod, g, PORTS[g]), encoding="utf-8")

    prof = {"quiet":["byork_qc_tools"],"build":["byork_qc_tools","byork_sf_tools","byork_fpow_tools","byork_fp_tools"],"write":["byork_sf_tools","byork_fpow_tools","byork_fp_tools"],"git":["byork_git_tools","byork_fp_tools"],"mem":["byork_mem_tools","byork_day_tools","byork_sp_tools"]}
    for name, mods in prof.items():
        (OUT/f"gateway_{name}.py").write_text(gate(name, mods), encoding="utf-8")
        (OUT/f"start_gateway_{name}.bat").write_text(f'@echo off\r\ncd /d D:\\Projects\\Chad\\py\\byork_split\r\npython gateway_{name}.py --port 8000\r\npause\r\n', encoding="utf-8")
    (OUT/"start_gateway_build_with_ngrok.bat").write_text('@echo off\r\nstart "Build" cmd /k "cd /d D:\\Projects\\Chad\\py\\byork_split && python gateway_build.py --port 8000"\r\nstart "Ngrok" cmd /k "ngrok http 8000"\r\n', encoding="utf-8")
    print("tiny schema installed", OUT)

if __name__ == "__main__": main()
