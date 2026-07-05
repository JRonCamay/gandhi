window.Chad = window.Chad || {};

(function () {
    "use strict";

    let contextMenu = null;

    function ui() { return window.Chad.ui; }
    function el(tag, props, children) { return ui().createEl(tag, props || {}, children || []); }
    function btn(label, fn, extra) { return ui().button(label, fn, extra || {}); }
    function esc(text) { return ui().escapeHTML(text); }
    function bodyStyle() { return ui().bodyStyle(); }

    function menuItem(text, fn) {
        return el("div", { text, style: { padding: "7px 9px", cursor: "pointer", borderRadius: "5px", color: "#0f172a" }, onclick: () => { hideRepoContextMenu(); fn(); } });
    }

    function hideRepoContextMenu() {
        if (contextMenu) contextMenu.remove();
        contextMenu = null;
    }

    function showRepoContextMenu(x, y, path) {
        hideRepoContextMenu();
        contextMenu = el("div", { style: { position: "fixed", left: x + "px", top: y + "px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", boxShadow: "0 8px 24px rgba(15,23,42,.22)", zIndex: "1000002", padding: "5px", minWidth: "150px" } }, [
            menuItem("Copy RAW", () => window.Chad.actions.copyRawFile(path)),
            menuItem("Copy URL", () => window.Chad.actions.copyText(window.Chad.actions.fileUrl(path))),
            menuItem("Copy Raw URL", () => window.Chad.actions.copyText(window.Chad.actions.rawUrl(path)))
        ]);
        document.body.appendChild(contextMenu);
    }

    function renderRepoTree(wrap, items) {
        const folders = {};
        for (const item of items) {
            const parts = item.path.split("/");
            const folder = parts.length > 1 ? parts[0] : "";
            if (!folders[folder]) folders[folder] = [];
            folders[folder].push(item);
        }
        for (const [folder, list] of Object.entries(folders).sort()) {
            if (folder) wrap.appendChild(el("div", { text: "📁 " + folder, style: { fontWeight: "800", margin: "7px 0 3px" } }));
            for (const item of list.filter(x => x.type === "blob").slice(0, 300)) {
                wrap.appendChild(el("div", {
                    text: "📄 " + item.path,
                    style: { fontFamily: "Consolas, monospace", fontSize: "12px", padding: "3px 5px", cursor: "pointer", color: "#334155" },
                    onclick: () => window.Chad.actions.copyRawFile(item.path),
                    oncontextmenu: event => { event.preventDefault(); showRepoContextMenu(event.clientX, event.clientY, item.path); }
                }));
            }
        }
    }

    function renderRepo() {
        const state = window.Chad.storage.state;
        const repo = window.Chad.data.repo;
        const wrap = el("div", { style: bodyStyle() });
        wrap.appendChild(el("div", { html: `<b>${repo.owner}/${repo.repo}</b><br><span style="color:#64748b">Branch: ${repo.branch}</span>`, style: { marginBottom: "8px" } }));
        wrap.appendChild(el("div", { style: { display: "flex", gap: "5px", marginBottom: "8px" } }, [
            btn("Refresh Tree", () => window.Chad.actions.loadRepoTree(true), { bg: "#e0f2fe", border: "#7dd3fc", bold: true }),
            btn("Copy Repo URL", () => window.Chad.actions.copyText(`https://github.com/${repo.owner}/${repo.repo}`))
        ]));
        if (state.repoLoading) return wrap.appendChild(el("div", { text: "Loading repo tree...", style: { color: "#64748b", padding: "10px" } })), wrap;
        if (!state.repoTree) return wrap.appendChild(el("div", { text: "Click Refresh Tree to load the Gandhi repo file tree.", style: { color: "#64748b", padding: "10px" } })), wrap;
        renderRepoTree(wrap, state.repoTree.items || []);
        return wrap;
    }

    document.addEventListener("click", hideRepoContextMenu, true);
    window.Chad.uiRepo = { render: renderRepo };
})();
