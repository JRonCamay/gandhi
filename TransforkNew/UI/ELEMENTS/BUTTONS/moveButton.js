window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "UI.local.TransforkNew.UI.ELEMENTS.BUTTONS.moveButton.js.init", file: "TransforkNew/UI/ELEMENTS/BUTTONS/moveButton.js", functionName: "init", purpose: "local process member registration for init", manager: "UI", station: 0 }
        ].forEach(register);
    })();

    const api = window.TransforkNew;

    const moveButton = api.UI.elements.buttons.MOVEBUTTON?.STATE?.create?.({}) || {
        node: null,
        visible: false,
        dragging: false,
        startMouseX: 0,
        startMouseY: 0,
        latestMouseX: 0,
        latestMouseY: 0,
        startButtonLeft: 0,
        startButtonTop: 0,
        previewButtonLeft: 0,
        previewButtonTop: 0,
        dragDx: 0,
        dragDy: 0,
        frameRequested: false
    };

    moveButton.init = function init() {
        api.UI.elements.buttons.MOVEBUTTON?.DRAW?.createNode?.(this);
        api.UI.elements.buttons.MOVEBUTTON?.EVENTS?.mouseDown?.(this);
        api.UI.elements.buttons.MOVEBUTTON?.EVENTS?.mouseMove?.(this);
        api.UI.elements.buttons.MOVEBUTTON?.EVENTS?.mouseUp?.(this);
        return this.node;
    };

    api.UI.elements.buttons.moveButton = moveButton;
})();
