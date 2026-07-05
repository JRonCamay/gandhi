window.Chad = window.Chad || {};

(function () {
    "use strict";

    function ui() { return window.Chad.ui; }
    function el(tag, props, children) { return ui().createEl(tag, props || {}, children || []); }
    function btn(label, fn, extra) { return ui().button(label, fn, extra || {}); }
    function esc(text) { return ui().escapeHTML(text); }
    function bodyStyle() { return ui().bodyStyle(); }

    function renderRoadmap() {
        const wrap = el("div", { style: bodyStyle() });
        wrap.appendChild(btn("Refresh Repo Memory", window.Chad.actions.refreshRepoMemory, { bg: "#ede9fe", border: "#c4b5fd", bold: true }));
        wrap.appendChild(el("div", { style: { height: "8px" } }));
        for (const item of window.Chad.storage.state.roadmap) {
            wrap.appendChild(el("div", { style: { border: "1px solid #cbd5e1", borderRadius: "9px", padding: "8px", marginBottom: "8px", background: "#f8fafc" } }, [
                el("div", { html: `<b>${esc(item.title)}</b><br><span style="color:#ca8a04">${esc(item.status)}</span><br><span style="color:#64748b">Updated: ${esc(item.updatedAt || "")}</span>` }),
                el("pre", { text: item.text, style: { whiteSpace: "pre-wrap", fontFamily: "Consolas, monospace", fontSize: "11px", color: "#334155", margin: "7px 0 0" } })
            ]));
        }
        return wrap;
    }

    window.Chad.uiRoadmap = { render: renderRoadmap };
})();
