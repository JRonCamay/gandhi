window.Chad = window.Chad || {};

(function () {
    "use strict";

    const GLOBAL_NOTES_KEY = "gandhi_chad_shared_notes_v1";

    function ui() { return window.Chad.ui; }
    function el(tag, props, children) { return ui().createEl(tag, props || {}, children || []); }
    function btn(label, fn, extra) { return ui().button(label, fn, extra || {}); }
    function render() { return ui().render(); }

    function renderNotes() {
        const wrap = el("div", {
            style: {
                flex: "1 1 auto",
                minHeight: "0",
                overflow: "hidden",
                background: "#ffffff",
                display: "flex",
                flexDirection: "column",
                padding: "8px",
                boxSizing: "border-box"
            }
        });

        const title = el("div", {
            text: "Shared notes across all Chad tabs.",
            style: {
                flex: "0 0 auto",
                color: "#64748b",
                marginBottom: "7px",
                fontSize: "11px"
            }
        });

        const textarea = el("textarea", {
            style: {
                flex: "1 1 auto",
                minHeight: "0",
                width: "100%",
                boxSizing: "border-box",
                resize: "none",
                overflowY: "auto",
                overflowX: "auto",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "9px",
                fontFamily: "Consolas, monospace",
                fontSize: "13px",
                lineHeight: "1.4",
                color: "#0f172a",
                background: "#ffffff",
                outline: "none",
                scrollbarWidth: "thin"
            }
        });

        textarea.value = localStorage.getItem(GLOBAL_NOTES_KEY) || "";
        textarea.addEventListener("input", () => localStorage.setItem(GLOBAL_NOTES_KEY, textarea.value));

        const actions = el("div", {
            style: {
                flex: "0 0 auto",
                display: "flex",
                gap: "5px",
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px solid #e2e8f0",
                background: "#ffffff"
            }
        }, [
            btn("COPY NOTES", () => window.Chad.actions.copyText(localStorage.getItem(GLOBAL_NOTES_KEY) || ""), { bg: "#e0f2fe", border: "#7dd3fc" }),
            btn("CLEAR NOTES", () => { localStorage.setItem(GLOBAL_NOTES_KEY, ""); render(); }, { bg: "#fee2e2", border: "#fecaca" })
        ]);

        wrap.appendChild(title);
        wrap.appendChild(textarea);
        wrap.appendChild(actions);
        return wrap;
    }

    window.Chad.uiNotes = { render: renderNotes };
})();
