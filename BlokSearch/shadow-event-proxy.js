/*
BlokSearch/shadow-event-proxy.js
Event proxy layer for future ShadowRoot mode.
Inactive unless a ShadowRoot host exists.
*/
window.BlokSearch = window.BlokSearch || {};

window.BlokSearch.ShadowEventProxy = class ShadowEventProxy {
    constructor(ui) {
        this.ui = ui;
        this.root = null;
        this.host = null;
        this.listeners = [];
        this.proxying = false;
        this.eventTypes = ["mousedown", "click", "dragstart"];
    }

    attach(root, host) {
        this.detach();

        if (!root || !host) return false;

        this.root = root;
        this.host = host;
        this.ensurePointerEvents();

        this.eventTypes.forEach(type => {
            const listener = event => this.proxyEvent(type, event);
            root.addEventListener(type, listener, true);
            this.listeners.push({ target: root, type, listener });
        });

        return true;
    }

    detach() {
        this.listeners.forEach(item => {
            item.target.removeEventListener(item.type, item.listener, true);
        });

        this.listeners.length = 0;
        this.root = null;
        this.host = null;
        this.proxying = false;
    }

    ensurePointerEvents() {
        let node = this.host;

        while (node && node !== document.documentElement) {
            const computed = window.getComputedStyle(node);
            if (computed.pointerEvents === "none") {
                node.style.pointerEvents = "auto";
            }
            node = node.parentElement;
        }

        if (this.host) {
            this.host.style.pointerEvents = "auto";
        }
    }

    proxyEvent(type, sourceEvent) {
        if (this.proxying || !this.host) return;
        if (!sourceEvent.isTrusted) return;

        const target = this.getHostTarget(sourceEvent);
        if (!target) return;

        this.proxying = true;

        try {
            const proxied = new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                composed: true,
                view: window,
                detail: sourceEvent.detail || 0,
                screenX: sourceEvent.screenX || 0,
                screenY: sourceEvent.screenY || 0,
                clientX: sourceEvent.clientX || 0,
                clientY: sourceEvent.clientY || 0,
                ctrlKey: !!sourceEvent.ctrlKey,
                shiftKey: !!sourceEvent.shiftKey,
                altKey: !!sourceEvent.altKey,
                metaKey: !!sourceEvent.metaKey,
                button: sourceEvent.button || 0,
                buttons: sourceEvent.buttons || 0,
                relatedTarget: null
            });

            proxied.__blokSearchProxy = true;
            target.dispatchEvent(proxied);

            const bridge = new CustomEvent("bloksearch-shadow-proxy", {
                bubbles: true,
                cancelable: false,
                composed: true,
                detail: {
                    type,
                    clientX: sourceEvent.clientX || 0,
                    clientY: sourceEvent.clientY || 0,
                    button: sourceEvent.button || 0
                }
            });

            document.dispatchEvent(bridge);
        } finally {
            this.proxying = false;
        }
    }

    getHostTarget(sourceEvent) {
        const x = sourceEvent.clientX;
        const y = sourceEvent.clientY;

        if (Number.isFinite(x) && Number.isFinite(y)) {
            const target = document.elementFromPoint(x, y);
            if (target) return target;
        }

        return document;
    }
};

window.BlokSearch.shadowEventProxy =
    window.BlokSearch.shadowEventProxy ||
    new window.BlokSearch.ShadowEventProxy(window.BlokSearch.ui);