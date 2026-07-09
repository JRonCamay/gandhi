// TransforkV3 KEY system
(function () {
    "use strict";

    const app = window.TransforkV3 = window.TransforkV3 || {};

    function onKeyDown(event) {
        const key = String(event.key || "").toLowerCase();
        const target = event.target;
        const tag = target && target.tagName ? target.tagName.toLowerCase() : "";
        const isTyping = tag === "input" || tag === "textarea" || target?.isContentEditable;
        if (isTyping) return;

        if (event.altKey && key === "r") {
            event.preventDefault();
            app.reload?.();
            return;
        }

        if (!event.altKey && !event.ctrlKey && !event.metaKey && key === "r") {
            event.preventDefault();
            app.systems.TRANSFORM_BOX?.toggle?.();
        }
    }

    function start() {
        if (app.runtime.keyListenerInstalled) return;
        app.runtime.keyListenerInstalled = true;
        window.addEventListener("keydown", onKeyDown, true);
    }

    const api = {
        name: "KEY",
        started: false,
        start: function () {
            api.started = true;
            start();
        },
        onKeyDown
    };

    if (typeof app.registerSystem === "function") app.registerSystem("KEY", api);
})();