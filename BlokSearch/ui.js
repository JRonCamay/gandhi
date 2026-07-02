/*
BlokSearch/ui.js
Safe DOM passthrough UI adapter for the search panel.
This preserves the ui.js API expected by bloksearch-main.js without ShadowRoot event retargeting.
*/
window.BlokSearch = window.BlokSearch || {};

window.BlokSearch.ui = {
    hostId: "gandi-search-shadow-host",
    host: null,
    shadowRoot: null,
    pendingStyles: [],

    attachSearchPanel(panel) {
        this.removeSearchPanel();
        document.body.appendChild(panel);
        this.flushPendingStyles();
        return panel;
    },

    removeSearchPanel() {
        const existingHost = document.getElementById(this.hostId);
        if (existingHost && existingHost.parentNode) {
            existingHost.parentNode.removeChild(existingHost);
        }

        this.host = null;
        this.shadowRoot = null;
    },

    getRoot() {
        return document;
    },

    getElementById(id) {
        return document.getElementById(id);
    },

    injectStyle(id, cssText) {
        if (!id || !cssText) return;
        if (document.getElementById(id)) return;

        const style = document.createElement("style");
        style.id = id;
        style.textContent = cssText;
        document.head.appendChild(style);
    },

    flushPendingStyles() {
        if (!this.pendingStyles.length) return;

        const styles = this.pendingStyles.slice();
        this.pendingStyles.length = 0;

        styles.forEach(item => {
            this.injectStyle(item.id, item.cssText);
        });
    }
};