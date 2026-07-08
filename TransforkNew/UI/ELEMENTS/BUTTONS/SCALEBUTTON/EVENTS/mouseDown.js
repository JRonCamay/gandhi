window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.SCALEBUTTON = window.TransforkNew.UI.elements.buttons.SCALEBUTTON || {};
window.TransforkNew.UI.elements.buttons.SCALEBUTTON.EVENTS = window.TransforkNew.UI.elements.buttons.SCALEBUTTON.EVENTS || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "SCALE.local.TransforkNew.UI.ELEMENTS.BUTTONS.SCALEBUTTON.EVENTS.mouseDown.js.mouseDown", file: "TransforkNew/UI/ELEMENTS/BUTTONS/SCALEBUTTON/EVENTS/mouseDown.js", functionName: "mouseDown", purpose: "local process member registration for mouseDown", manager: "SCALE", station: 0 }
        ].forEach(register);
    })();

    function mouseDown(button) {
        if (!button?.node || button.mouseDownAttached) return button?.node || null;

        const DRAG = window.TransforkNew.UI.elements.buttons.SCALEBUTTON.DRAG;

        function samplePointer(event) {
            if (!button?.dragging || !event) return;
            event.preventDefault?.();
            event.stopPropagation?.();
            button.latestMouseX = event.clientX;
            button.latestMouseY = event.clientY;
            button.lastPointerSampleTime = performance.now();
        }

        function runDragSubline() {
            if (!button?.dragging) {
                button.dragLoopActive = false;
                button.frameRequested = false;
                return;
            }

            DRAG?.start?.({ button }, 3, 5);
            requestAnimationFrame(runDragSubline);
        }

        function startDragSubline() {
            if (button.dragLoopActive) return;
            button.dragLoopActive = true;
            button.frameRequested = true;
            requestAnimationFrame(runDragSubline);
        }

        const onMouseMove = event => {
            samplePointer(event);
        };

        const onMouseUp = event => {
            samplePointer(event);
            DRAG?.start?.({ button, event }, 6, 6);
            document.removeEventListener("mousemove", onMouseMove, true);
            document.removeEventListener("mouseup", onMouseUp, true);
        };

        button.node.addEventListener("mousedown", event => {
            const report = DRAG?.start?.({ button, event }, 1, 1);
            if (!report || report.status !== "done") return;
            document.addEventListener("mousemove", onMouseMove, true);
            document.addEventListener("mouseup", onMouseUp, true);
            startDragSubline();
        }, true);

        button.mouseDownAttached = true;
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.SCALEBUTTON.EVENTS.mouseDown = mouseDown;
})();
