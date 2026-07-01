window.Chad = window.Chad || {};

(function () {
    "use strict";

    function paintWindow() {
        return document.querySelector("#gandhi-chad-paint-window");
    }

    function clickPaintButton(label) {
        const win = paintWindow();
        if (!win) return false;

        const button = Array.from(win.querySelectorAll("button"))
            .find(btn => btn.textContent.trim() === label);

        if (!button) return false;
        button.click();
        return true;
    }

    function suppressPasteDialogs() {
        const observer = new MutationObserver(() => {
            if (!paintWindow()) return;

            document.querySelectorAll("body > div").forEach(node => {
                const text = node.textContent || "";
                const z = Number(node.style && node.style.zIndex || 0);

                if (
                    z >= 1000008 &&
                    /Image pasted|Text pasted|pasted on canvas|You can now draw over it/i.test(text)
                ) {
                    node.remove();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: false
        });
    }

    document.addEventListener("keydown", event => {
        if (!paintWindow()) return;

        const key = event.key.toLowerCase();

        if (event.ctrlKey && !event.shiftKey && key === "z") {
            event.preventDefault();
            event.stopPropagation();
            clickPaintButton("↶");
            return;
        }

        if (event.ctrlKey && event.shiftKey && key === "z") {
            event.preventDefault();
            event.stopPropagation();
            clickPaintButton("↷");
        }
    }, true);

    suppressPasteDialogs();
})();
