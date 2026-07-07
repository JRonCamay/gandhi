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
        const onMouseMove = event => {
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG?.setStation?.(2);
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG?.capture?.(button, event);
        };
        const onMouseUp = event => {
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG?.setStation?.(7);
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG?.end?.(button, event);
            document.removeEventListener("mousemove", onMouseMove, true);
            document.removeEventListener("mouseup", onMouseUp, true);
        };
        button.node.addEventListener("mousedown", event => {
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG?.setStation?.(1);
            const started = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG?.begin?.(button, event);
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG?.setStation?.(0);
            if (!started) return;
            document.addEventListener("mousemove", onMouseMove, true);
            document.addEventListener("mouseup", onMouseUp, true);
        }, true);
        button.mouseDownAttached = true;
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.EVENTS.mouseDown = mouseDown;
})();
