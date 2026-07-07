window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.EVENTS = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.EVENTS || {};

(function () {
    "use strict";

    function mouseDown(button) {
        if (!button?.node || button.mouseDownAttached) return button?.node || null;

        const DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG;

        const onMouseMove = event => {
            if (!button.frameRequested) {
                button.frameRequested = true;
                requestAnimationFrame(() => {
                    button.frameRequested = false;
                    DRAG?.start?.({ button, event }, 2, 5);
                });
            }
        };

        const onMouseUp = event => {
            DRAG?.start?.({ button, event }, 6, 6);
            document.removeEventListener("mousemove", onMouseMove, true);
            document.removeEventListener("mouseup", onMouseUp, true);
        };

        button.node.addEventListener("mousedown", event => {
            const report = DRAG?.start?.({ button, event }, 1, 1);
            if (!report || report.status !== "done") return;
            document.addEventListener("mousemove", onMouseMove, true);
            document.addEventListener("mouseup", onMouseUp, true);
        }, true);

        button.mouseDownAttached = true;
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.EVENTS.mouseDown = mouseDown;
})();
