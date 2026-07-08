window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "UI.local.TransforkNew.UI.ELEMENTS.BOUNDINGBOX.refresh.js.refresh", file: "TransforkNew/UI/ELEMENTS/BOUNDINGBOX/refresh.js", functionName: "refresh", purpose: "local process member registration for refresh", manager: "UI", station: 0 }
        ].forEach(register);
    })();

    function refresh(box) {
        const debug = window.TransforkNew.SYSTEM?.debug;
        const refreshApi = window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH;

        debug?.log?.("BOX refresh start", {
            box,
            refreshApi,
            vmState: window.TransforkNew.SYSTEM?.VM?.state
        });

        if (!box) {
            debug?.warn?.("BOX stop: missing box");
            window.TransforkNew.UI.elements.BOUNDINGBOX.VISIBILITY?.hide?.(box);
            return null;
        }

        const target = refreshApi?.readTarget?.(box);
        debug?.log?.("BOX target", target);
        if (!target) {
            debug?.warn?.("BOX stop: target null");
            window.TransforkNew.UI.elements.BOUNDINGBOX.VISIBILITY?.hide?.(box);
            return null;
        }

        const drawable = refreshApi.readDrawable?.(box);
        debug?.log?.("BOX drawable", drawable);
        if (!drawable) {
            debug?.warn?.("BOX stop: drawable null");
            window.TransforkNew.UI.elements.BOUNDINGBOX.VISIBILITY?.hide?.(box);
            return null;
        }

        const bounds = refreshApi.readBounds?.(box);
        debug?.log?.("BOX bounds", bounds);
        if (!bounds) {
            debug?.warn?.("BOX stop: bounds null");
            window.TransforkNew.UI.elements.BOUNDINGBOX.VISIBILITY?.hide?.(box);
            return null;
        }

        const screenRect = refreshApi.convertBounds?.(box);
        debug?.log?.("BOX screenRect", screenRect);
        if (!screenRect) {
            debug?.warn?.("BOX stop: screenRect null");
            window.TransforkNew.UI.elements.BOUNDINGBOX.VISIBILITY?.hide?.(box);
            return null;
        }

        const applied = refreshApi.apply?.(box) || null;
        debug?.log?.("BOX applied", {
            applied,
            visible: box.visible,
            display: box.node?.style?.display,
            left: box.node?.style?.left,
            top: box.node?.style?.top,
            width: box.node?.style?.width,
            height: box.node?.style?.height
        });
        return applied;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.refresh = refresh;
})();
