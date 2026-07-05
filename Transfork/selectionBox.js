window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const selectionBoxModule260705_SB3N8K = {
        getBox() {
            return document.querySelector("#gandi-transform-box");
        },

        isVisible() {
            const box = this.getBox();
            if (!box) return false;

            const style = getComputedStyle(box);
            return style.display !== "none" && style.visibility !== "hidden";
        },

        place(screenRect) {
            const box = this.getBox();
            if (!box || !screenRect) return;

            box.style.display = "block";
            box.style.left = screenRect.left + "px";
            box.style.top = screenRect.top + "px";
            box.style.width = screenRect.width + "px";
            box.style.height = screenRect.height + "px";
        },

        moveFromStart(startRect, dx, dy) {
            if (!startRect) return;

            this.place({
                left: startRect.left + dx,
                top: startRect.top + dy,
                width: startRect.width,
                height: startRect.height
            });
        }
    };

    api.registerModule260705_NS8Q2M("selectionBox", selectionBoxModule260705_SB3N8K);
})();
