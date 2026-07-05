window.Chad = window.Chad || {};

(function () {
    "use strict";

    const GLOBAL_NOTES_KEY = "gandhi_chad_shared_notes_v1";

    function ui() { return window.Chad.ui; }
    function el(tag, props, children) { return ui().createEl(tag, props || {}, children || []); }
    function btn(label, fn, extra) { return ui().button(label, fn, extra || {}); }
    function bodyStyle() { return ui().bodyStyle(); }
    function render() { return ui().render(); }

    function renderNotes() {
        const wrap = el("div", { style: bodyStyle() });
        wrap.appendChild(el("div", { text: "Shared notes across all Chad tabs.", style: { color: "#64748b", marginBottom: "7px", fontSize: "11px" } }));
        const textarea = el("textarea", { style: { width: "100%", height: "calc(100vh - 220px)", boxSizing: "border-box", resize: "vertical", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "9px", fontFamily: "Consolas, monospace", fontSize: "13px", lineHeight: "1.4", color: "#0f172a", background: "#ffffff", outline: "none" } });
        textarea.value = localStorage.getItem(GLOBAL_NOTES_KEY) || "";
        textarea.addEventListener("input", () => localStorage.setItem(GLOBAL_NOTES_KEY, textarea.value));
        wrap.appendChild(textarea);
        wrap.appendChild(el("div", { style: { display: "flex", gap: "5px", marginTop: "8px" } }, [
            btn("COPY NOTES", () => window.Chad.actions.copyText(localStorage.getItem(GLOBAL_NOTES_KEY) || ""), { bg: "#e0f2fe", border: "#7dd3fc" }),
            btn("CLEAR NOTES", () => { if (!confirm("Clear shared notes?")) return; localStorage.setItem(GLOBAL_NOTES_KEY, ""); render(); }, { bg: "#fee2e2", border: "#fecaca" })
        ]));
        return wrap;
    }

    window.Chad.uiNotes = { render: renderNotes };
})();
