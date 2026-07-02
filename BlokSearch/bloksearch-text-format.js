window.BlokSearchTextFormat = {
    start() {
        this.injectStyle();
        this.observePanels();
        this.applyPanelPolish();
    },

    injectStyle() {
        if (document.getElementById("bloksearch-text-format-style")) return;

        const style = document.createElement("style");
        style.id = "bloksearch-text-format-style";
        style.textContent = `
            #gandi-search span[style*="Consolas"],
            #gandi-search span[style*="Monaco"],
            #gandi-search span[style*="Courier New"] {
                font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;
                font-weight: 400 !important;
                background: #ffffff !important;
                color: #575e75 !important;
                padding: 1px 7px !important;
                border-radius: 999px !important;
                font-size: 11px !important;
                line-height: 15px !important;
                min-width: 12px !important;
                text-align: center !important;
                box-shadow: inset 0 -1px 0 rgba(0,0,0,0.18) !important;
                vertical-align: middle !important;
                margin: 0 2px !important;
            }
        `;
        document.head.appendChild(style);
    },

    observePanels() {
        if (this.observer) return;

        this.observer = new MutationObserver(() => {
            this.applyPanelPolish();
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    },

    applyPanelPolish() {
        const panel = document.getElementById("gandi-search");
        if (!panel) return;

        const blockFrames = panel.querySelectorAll("div");
        blockFrames.forEach(frame => {
            if (!frame.style || !frame.style.backgroundImage) return;
            this.cleanTrailingArtifacts(frame);
            this.removeArtifactPills(frame);
        });
    },

    cleanTrailingArtifacts(root) {
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            null
        );

        const textNodes = [];
        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        textNodes.forEach(node => {
            node.nodeValue = node.nodeValue
                .replace(/\s*[?]\s*[*]+\s*$/g, "")
                .replace(/\s*[?]\s*$/g, "")
                .replace(/\s*[*]+\s*$/g, "");
        });
    },

    removeArtifactPills(root) {
        const pills = root.querySelectorAll("span");

        pills.forEach(pill => {
            const text = (pill.textContent || "").trim();

            if (text === "?" || text === "*" || text === "?*" || text === "? *") {
                const previous = pill.previousSibling;

                if (previous && previous.nodeType === Node.TEXT_NODE) {
                    previous.nodeValue = previous.nodeValue.replace(/\s+$/g, "");
                }

                pill.remove();
            }
        });
    }
};

window.BlokSearchTextFormat.start();