window.Chad = window.Chad || {};

(function () {
    "use strict";

    const MODULE_KEY = "chadConvoLayoutFix";
    const runtimeSwitchboard = window.Chad.runtimeSwitchboard;

    if (!runtimeSwitchboard) return;

    runtimeSwitchboard.register({
        key: MODULE_KEY,
        file: "chadConvoLayoutFix.js",
        creator: "Brenda",
        purpose: "Keeps Convo input row visible by sizing body from actual Chad panel geometry",
        timestamp: 260704,
        parent: "ChadTheGreat",
        on: true
    });

    function isModuleOn() {
        return runtimeSwitchboard.isOn(MODULE_KEY);
    }

    function isConvoActive() {
        const state = window.Chad.storage && window.Chad.storage.state;
        return !!state && state.activeTab === "convo";
    }

    function applyConvoLayout() {
        if (!isModuleOn() || !isConvoActive()) return;

        const panel = document.querySelector("#gandhi-chad-panel");
        if (!panel || !panel.children || panel.children.length < 2) return;

        const header = panel.children[0];
        const body = panel.children[1];
        if (!header || !body) return;

        const available = Math.max(180, panel.clientHeight - header.offsetHeight);

        Object.assign(body.style, {
            height: available + "px",
            maxHeight: available + "px",
            minHeight: "0",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box"
        });

        const fixedColumn = body.firstElementChild;
        if (fixedColumn) {
            Object.assign(fixedColumn.style, {
                height: "100%",
                maxHeight: "100%",
                minHeight: "0",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
            });
        }
    }

    function scheduleApply() {
        requestAnimationFrame(applyConvoLayout);
        setTimeout(applyConvoLayout, 80);
    }

    function start() {
        scheduleApply();

        const observer = new MutationObserver(scheduleApply);
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        window.addEventListener("resize", scheduleApply);

        setInterval(() => {
            if (!isModuleOn()) return;
            applyConvoLayout();
        }, 700);
    }

    window.Chad.chadConvoLayoutFix = {
        apply: applyConvoLayout
    };

    start();
})();
