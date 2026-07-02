window.Chad = window.Chad || {};

(function () {
    "use strict";

    const PRESS_LABELS = new Set([
        "SCAN FILES", "USE THIS CHAT", "COPY LINK", "DELETE AGENT", "INFO",
        "MAIN", "PAINT", "GITGIT", "UPDATE", "🔄 UPDATE",
        "TASK RULES", "GOD RULES", "SCAN TAB", "SCAN", "Scan",
        "ROADMAP", "PINS"
    ]);

    function addPressFeedback() {
        if (window.__ChadSelectivePressFeedbackAddedV3) return;
        window.__ChadSelectivePressFeedbackAddedV3 = true;

        function shouldPress(btn) {
            if (!btn || !btn.closest("#gandhi-chad-panel")) return false;
            if (btn.dataset && btn.dataset.press === "1") return true;
            const state = window.Chad.storage && window.Chad.storage.state;
            if (state && (state.activeTab === "pins" || state.activeTab === "repo")) return true;
            const text = (btn.textContent || "").trim();
            return PRESS_LABELS.has(text) || PRESS_LABELS.has(text.toUpperCase());
        }

        function release(btn) {
            if (!btn) return;
            btn.style.transform = "";
            btn.style.filter = "";
            btn.style.boxShadow = "";
        }

        document.addEventListener("mousedown", event => {
            const btn = event.target.closest && event.target.closest("button");
            if (!shouldPress(btn)) return;
            btn.style.transform = "translateY(1px) scale(.97)";
            btn.style.filter = "brightness(.92)";
            btn.style.boxShadow = "inset 0 2px 4px rgba(15,23,42,.22)";
        }, true);

        document.addEventListener("mouseup", event => release(event.target.closest && event.target.closest("button")), true);
    }

    window.Chad.pressFeedback = {
        addPressFeedback
    };
})();
