/*
BlokSearch/ui.js
ShadowRoot UI adapter for the search panel.
*/
window.BlokSearch = window.BlokSearch || {};

window.BlokSearch.ui = {
    hostId: "gandi-search-shadow-host",
    host: null,
    shadowRoot: null,
    pendingStyles: [],
    outsidePointerHandler: null,
    keyShieldHandler: null,

    attachSearchPanel(panel) {
        this.removeSearchPanel();

        const host = document.createElement("div");
        host.id = this.hostId;
        host.style.cssText = `
            position: fixed;
            inset: 0;
            width: 0;
            height: 0;
            z-index: 2147483647;
            pointer-events: auto;
        `;

        const root = host.attachShadow({ mode: "open" });

        this.host = host;
        this.shadowRoot = root;

        document.body.appendChild(host);
        this.flushPendingStyles();
        root.appendChild(panel);
        this.installKeyboardShield(panel);
        this.installOutsideClose(panel);

        if (window.BlokSearch.shadowEventProxy) {
            window.BlokSearch.shadowEventProxy.attach(root, host);
        }

        return panel;
    },

    removeSearchPanel() {
        if (window.BlokSearch.shadowEventProxy) {
            window.BlokSearch.shadowEventProxy.detach();
        }

        if (this.outsidePointerHandler) {
            document.removeEventListener("pointerdown", this.outsidePointerHandler, true);
            this.outsidePointerHandler = null;
        }

        if (this.keyShieldHandler) {
            document.removeEventListener("keydown", this.keyShieldHandler, true);
            this.keyShieldHandler = null;
        }

        const existingHost = document.getElementById(this.hostId);
        if (existingHost && existingHost.parentNode) {
            existingHost.parentNode.removeChild(existingHost);
        }

        if (this.host && this.host.parentNode) {
            this.host.parentNode.removeChild(this.host);
        }

        this.host = null;
        this.shadowRoot = null;
    },

    getRoot() {
        return this.shadowRoot || document;
    },

    getElementById(id) {
        if (this.shadowRoot) {
            const found = this.shadowRoot.getElementById(id);
            if (found) return found;
        }

        return document.getElementById(id);
    },

    injectStyle(id, cssText) {
        if (!id || !cssText) return;

        if (!this.shadowRoot) {
            this.pendingStyles = this.pendingStyles.filter(item => item.id !== id);
            this.pendingStyles.push({ id, cssText });
            return;
        }

        if (this.shadowRoot.getElementById(id)) return;

        const style = document.createElement("style");
        style.id = id;
        style.textContent = cssText;
        this.shadowRoot.appendChild(style);
    },

    flushPendingStyles() {
        if (!this.shadowRoot || !this.pendingStyles.length) return;

        const styles = this.pendingStyles.slice();
        this.pendingStyles.length = 0;

        styles.forEach(item => {
            this.injectStyle(item.id, item.cssText);
        });
    },

    installKeyboardShield(panel) {
        this.keyShieldHandler = event => {
            if (!this.shadowRoot) return;

            const active = this.shadowRoot.activeElement;
            const isSearchInput = active && active.id === "gandi-input";

            if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                this.removeSearchPanel();
                return;
            }

            if (!isSearchInput) return;

            const protectedKeys = [
                "Backspace",
                "Delete",
                "ArrowLeft",
                "ArrowRight",
                "Home",
                "End"
            ];

            if (protectedKeys.includes(event.key) || event.key.length === 1) {
                event.stopPropagation();
            }
        };

        document.addEventListener("keydown", this.keyShieldHandler, true);
    },

    installOutsideClose(panel) {
        this.outsidePointerHandler = event => {
            if (!this.host || !this.shadowRoot) return;

            const path = event.composedPath ? event.composedPath() : [];
            const inside =
                path.includes(this.host) ||
                path.includes(this.shadowRoot) ||
                path.includes(panel);

            if (inside) return;

            this.removeSearchPanel();
        };

        setTimeout(() => {
            if (!this.host) return;
            document.addEventListener("pointerdown", this.outsidePointerHandler, true);
        }, 0);
    }
};