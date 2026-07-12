import ast
import re
import textwrap
from pathlib import Path

SOURCE = Path(r"D:\Projects\Chad\py\gandhi_mcp_server.py")
TARGET = Path(r"D:\Projects\Chad\py\byork_split")
HOSTS = '["127.0.0.1", "localhost", "perch-tripping-crushed.ngrok-free.dev"]'
PORTS = {"core":8001,"filepower":8002,"fingerprint":8003,"gitgood":8004,"memorycore":8005,"memorydaily":8006,"scratchpad":8007,"contextfile":8008,"quietchat":8009,"segmentflow":8010,"byorkcore":8011}

FILEPOWER_LITE = "read_file write_file append_file search_text replace_text patch_file file_info list_files".split()

DOCS = {
    "quietchat": "QuietChat message tools.",
    "segmentflow": "Split or patch large files by small sections.",
    "filepower": "Local file read/write helpers.",
    "fingerprint": "Checksum and verify files.",
    "gitgood": "Git helper tools.",
    "memorycore": "Memory store/search tools.",
    "memorydaily": "Daily memory notes.",
    "scratchpad": "Scratchpad read/write.",
    "contextfile": "Context file helpers.",
    "core": "Basic server tools.",
    "byorkcore": "Other Byork tools.",
}


def is_tool(fn):
    return any(isinstance(d, ast.Call) and isinstance(d.func, ast.Attribute) and d.func.attr == "tool" for d in fn.decorator_list)


def strip_prefix(s):
    s = s.replace("from mcp.server.fastmcp import FastMCP\n", "")
    s = s.replace("from mcp.server.streamable_http import TransportSecuritySettings\n", "")
    s = re.sub(r"\nmcp = FastMCP\([\s\S]*?\n\)\n\n", "\n", s, count=1)
    return re.sub(r"^\s*@mcp\.tool\([^\n]*\)\s*\r?\n", "", s, flags=re.M)


def mini_doc(name):
    words = name.replace("quietchat_", "qc_").replace("segmentflow_", "sf_").replace("_", " ")
    return f'"""{words}."""'


def compress_func(src, name):
    src = re.sub(r"^\s*@mcp\.tool\([^\n]*\)\s*\r?\n", "", src, flags=re.M)
    lines = src.splitlines(True)
    if not lines:
        return src
    out = [lines[0]]
    i = 1
    while i < len(lines) and (lines[i].strip() == "" or lines[i].lstrip().startswith(('"""', "'''"))):
        if lines[i].lstrip().startswith(('"""', "'''")):
            q = lines[i].lstrip()[:3]
            i += 1
            while i < len(lines) and q not in lines[i]:
                i += 1
            if i < len(lines):
                i += 1
            break
        i += 1
    indent = re.match(r"^(\s*)", lines[1] if len(lines) > 1 else "    ").group(1) or "    "
    out.append(indent + mini_doc(name) + "\n")
    out.extend(lines[i:])
    return "".join(out)


def module_code(group, names, funcs):
    out = ["from byork_shared import *\n\n", f'DESCRIPTION = "{DOCS.get(group, group)}"\n\n', "def register(mcp):\n"]
    if not names:
        out.append("    return mcp\n")
    for n in names:
        out.append(textwrap.indent("@mcp.tool()\n" + funcs[n], "    ") + "\n")
    out.append("\n    return mcp\n")
    return "".join(out)


def server_code(mod, group, port):
    return f'''import argparse
from mcp.server.fastmcp import FastMCP
from mcp.server.streamable_http import TransportSecuritySettings
import {mod}


def build_mcp(port={port}):
    mcp = FastMCP("Byork {group}", host="127.0.0.1", port=port, streamable_http_path="/mcp", transport_security=TransportSecuritySettings(enable_dns_rebinding_protection=True, allowed_hosts={HOSTS}))
    {mod}.register(mcp)
    return mcp


if __name__ == "__main__":
    p = argparse.ArgumentParser(); p.add_argument("--port", type=int, default={port})
    build_mcp(p.parse_args().port).run(transport="streamable-http")
'''


def gateway_code(title, mods):
    imports = "\n".join(f"import {m} as m{i}" for i, m in enumerate(mods))
    regs = "\n    ".join(f"m{i}.register(mcp)" for i in range(len(mods)))
    return f'''import argparse
from mcp.server.fastmcp import FastMCP
from mcp.server.streamable_http import TransportSecuritySettings
{imports}


def build_mcp(port=8000):
    mcp = FastMCP("{title}", host="127.0.0.1", port=port, streamable_http_path="/mcp", transport_security=TransportSecuritySettings(enable_dns_rebinding_protection=True, allowed_hosts={HOSTS}))
    {regs}
    return mcp


if __name__ == "__main__":
    p = argparse.ArgumentParser(); p.add_argument("--port", type=int, default=8000)
    build_mcp(p.parse_args().port).run(transport="streamable-http")
'''


def main():
    text = SOURCE.read_text(encoding="utf-8", errors="ignore")
    lines = text.splitlines(True)
    tree = ast.parse(text)
    nodes = [n for n in tree.body if isinstance(n, ast.FunctionDef) and is_tool(n)]
    funcs = {}
    for n in nodes:
        raw = "".join(lines[n.lineno-1:n.end_lineno])
        funcs[n.name] = compress_func(raw, n.name)

    prefix = strip_prefix("".join(lines[:min(n.lineno for n in nodes)-1]))
    impl = re.sub(r"^\s*@mcp\.tool\([^\n]*\)\s*\r?\n", "", prefix + "\n" + "\n\n".join(funcs.values()), flags=re.M)

    core = [n for n in ["ping", "repo_info"] if n in funcs]
    gitgood = [n for n in funcs if n.startswith("git_")]
    fingerprint = [n for n in ["verify_checksum", "file_checksum", "compare_files", "verify_repo_clean"] if n in funcs]
    filepower = [n for n in FILEPOWER_LITE if n in funcs]
    contextfile = [n for n in funcs if n.startswith("ctx") or n.startswith("context")]
    memorycore = [n for n in funcs if "memory" in n.lower() and "daily" not in n.lower()]
    memorydaily = [n for n in funcs if "daily" in n.lower()]
    scratchpad = [n for n in funcs if "scratch" in n.lower()]
    quietchat = [n for n in funcs if "quietchat" in n.lower()]
    segmentflow = [n for n in funcs if "segment" in n.lower() or "flow" in n.lower()]
    assigned = set(core+gitgood+fingerprint+filepower+contextfile+memorycore+memorydaily+scratchpad+quietchat+segmentflow)
    groups = {"core":core,"filepower":filepower,"fingerprint":fingerprint,"gitgood":gitgood,"memorycore":memorycore,"memorydaily":memorydaily,"scratchpad":scratchpad,"contextfile":contextfile,"quietchat":quietchat,"segmentflow":segmentflow,"byorkcore":[n for n in funcs if n not in assigned]}

    TARGET.mkdir(parents=True, exist_ok=True)
    (TARGET/"byork_impl.py").write_text(impl, encoding="utf-8")
    (TARGET/"byork_shared.py").write_text("from byork_impl import *\n", encoding="utf-8")
    for g, ns in groups.items():
        mod = f"byork_{g}_tools"
        (TARGET/f"{mod}.py").write_text(module_code(g, ns, funcs), encoding="utf-8")
        (TARGET/f"byork_{g}_server.py").write_text(server_code(mod, g, PORTS[g]), encoding="utf-8")

    profiles = {
        "quiet": ["byork_quietchat_tools"],
        "build": ["byork_quietchat_tools", "byork_segmentflow_tools", "byork_filepower_tools", "byork_fingerprint_tools"],
        "write": ["byork_segmentflow_tools", "byork_filepower_tools", "byork_fingerprint_tools"],
        "git": ["byork_gitgood_tools", "byork_fingerprint_tools"],
        "memory": ["byork_memorycore_tools", "byork_memorydaily_tools", "byork_scratchpad_tools"],
    }
    for name, mods in profiles.items():
        (TARGET/f"gateway_{name}.py").write_text(gateway_code(f"Byork {name}", mods), encoding="utf-8")
        (TARGET/f"start_gateway_{name}.bat").write_text(f'@echo off\r\ncd /d D:\\Projects\\Chad\\py\\byork_split\r\npython gateway_{name}.py --port 8000\r\npause\r\n', encoding="utf-8")
    (TARGET/"start_gateway_build_with_ngrok.bat").write_text('@echo off\r\nstart "Byork Build" cmd /k "cd /d D:\\Projects\\Chad\\py\\byork_split && python gateway_build.py --port 8000"\r\nstart "Ngrok 8000" cmd /k "ngrok http 8000"\r\n', encoding="utf-8")
    print("Schema-lite installed to", TARGET)

if __name__ == "__main__":
    main()
