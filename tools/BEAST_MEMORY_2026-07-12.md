# Beast Memory

- Current stable server: `gandhi_mcp_server_singular_lite.py`
- New compact server: `gandhi_mcp_server_control_lite.py`
- New compact server size: 210 lines, 12815 bytes
- Visible tools in compact server: `MCP_Control`, `MCP_Help`, `ping`
- Dispatcher commands: `qc.create`, `qc.process`, `qc.status`, `qc.complete`, `qc.get`, `qc.list`, `file.write`, `file.batch`, `file.read`, `file.info`, `memory.exportChat`, `writer.queue`, `writer.status`, `writer.flush`, `scratch.note`, `scratch.list`, `scratch.get`, `seg.note`, `seg.list`, `seg.get`
- RAM inbox bridge: `writer_inbox_8766.py` on `127.0.0.1:8766`
- RAM inbox bridge stores ScratchPad and SegmentFlow notes in memory; no temp note files.
- Disk fallback daemon: `writer_daemon.py`
- QuietChat local root: `D:\Projects\Chad\local\AI_MEMORY_FIN\GPT_QUIETCHAT_DONT_DELETE`
- MCP port default: `8001`
- MCP path: `/mcp`
- QuietChat UI bridge remains separate: `quietchat_bridge_8765.py` on `127.0.0.1:8765`

## Next Action

Copy `gandhi_mcp_server_control_lite.py` and `writer_inbox_8766.py` to the Windows py folder. Run the inbox bridge, then run the MCP server, then test `writer.queue`.

## Important Note

The current ChatGPT connector still uses the compatibility tools from MCP_Buddy3. The new 3-tool server intentionally removes those visible compatibility tools to reduce schema bloat.
