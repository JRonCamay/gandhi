window.Chad = window.Chad || {};

(function () {
    "use strict";

    function ui() { return window.Chad.ui; }
    function el(tag, props, children) { return ui().createEl(tag, props || {}, children || []); }
    function btn(label, fn, extra) { return ui().button(label, fn, extra || {}); }
    function esc(text) { return ui().escapeHTML(text); }
    function bodyStyle() { return ui().bodyStyle(); }
    function render() { return ui().render(); }

    function renderPins() {
        const state = window.Chad.storage.state;
        const wrap = el("div", { style: bodyStyle() });
        wrap.appendChild(el("div", { style: { display: "flex", gap: "5px", marginBottom: "8px" } }, [
            btn("Pin Selected", window.Chad.actions.pinSelection, { bg: "#ede9fe", border: "#c4b5fd" }),
            btn("Pin Last", window.Chad.actions.pinLastAssistant, { bg: "#ede9fe", border: "#c4b5fd" })
        ]));
        if (!state.pins.length) wrap.appendChild(el("div", { text: "No pinned responses yet.", style: { color: "#64748b", padding: "10px" } }));
        for (const pin of state.pins) {
            wrap.appendChild(el("div", { style: { border: "1px solid #cbd5e1", borderRadius: "9px", padding: "8px", marginBottom: "8px", background: "#f8fafc" } }, [
                el("div", { html: `<b>${esc(pin.title)}</b><br><span style="color:#64748b">${esc(pin.createdAt)}</span>`, style: { marginBottom: "6px" } }),
                el("div", { style: { display: "flex", gap: "4px", marginBottom: "6px" } }, [
                    btn("OPEN", () => ui().openTextModal(pin.title, pin.text)),
                    btn("SRC", () => window.Chad.actions.scrollToPin(pin)),
                    btn("COPY", () => window.Chad.actions.copyText(pin.text)),
                    btn("DELETE", () => { state.pins = state.pins.filter(item => item.id !== pin.id); window.Chad.storage.savePins(); render(); }, { bg: "#fee2e2", border: "#fecaca" })
                ])
            ]));
        }
        return wrap;
    }

    window.Chad.uiPins = { render: renderPins };
})();
