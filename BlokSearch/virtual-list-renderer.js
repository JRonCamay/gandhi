/*
BlokSearch/virtual-list-renderer.js
requestAnimationFrame-synced virtual list renderer.
*/
window.BlokSearch = window.BlokSearch || {};

window.BlokSearch.VirtualListRenderer = class VirtualListRenderer {
    constructor(container, options = {}) {
        this.container = container;
        this.items = [];
        this.selectedIndex = 0;
        this.rowHeight = options.rowHeight || 38;
        this.buffer = options.buffer || 8;
        this.cache = options.cache || new window.BlokSearch.BlockCache(500);
        this.renderRow = options.renderRow;
        this.rafId = 0;
        this.lastStart = -1;
        this.lastEnd = -1;
        this.disposed = false;

        this.spacer = document.createElement("div");
        this.spacer.style.cssText = "position:relative;width:100%;box-sizing:border-box;";

        this.pool = document.createElement("div");
        this.pool.style.cssText = "position:absolute;top:0;left:0;right:0;width:100%;box-sizing:border-box;";

        this.spacer.appendChild(this.pool);
        this.onScroll = () => this.scheduleRender();
        this.container.addEventListener("scroll", this.onScroll, { passive: true });
    }

    setItems(items, selectedIndex = 0) {
        this.items = Array.isArray(items) ? items : [];
        this.selectedIndex = Math.max(0, selectedIndex | 0);
        this.lastStart = -1;
        this.lastEnd = -1;
        this.container.innerHTML = "";
        this.spacer.style.height = `${this.items.length * this.rowHeight}px`;
        this.container.appendChild(this.spacer);
        this.scheduleRender(true);
    }

    setSelectedIndex(index) {
        this.selectedIndex = Math.max(0, Math.min(index | 0, this.items.length - 1));
        this.scrollToIndex(this.selectedIndex);
        this.scheduleRender(true);
    }

    scrollToIndex(index) {
        if (!this.items.length) return;

        const top = index * this.rowHeight;
        const bottom = top + this.rowHeight;
        const viewTop = this.container.scrollTop;
        const viewBottom = viewTop + this.container.clientHeight;

        if (top < viewTop) {
            this.container.scrollTop = top;
        } else if (bottom > viewBottom) {
            this.container.scrollTop = bottom - this.container.clientHeight;
        }
    }

    scheduleRender(force = false) {
        if (this.disposed) return;
        if (force) {
            this.lastStart = -1;
            this.lastEnd = -1;
        }
        if (this.rafId) return;

        this.rafId = requestAnimationFrame(() => {
            this.rafId = 0;
            this.render();
        });
    }

    getVisibleRange() {
        const total = this.items.length;
        const height = Math.max(1, this.container.clientHeight || 1);
        const top = Math.max(0, this.container.scrollTop || 0);

        return {
            start: Math.max(0, Math.floor(top / this.rowHeight) - this.buffer),
            end: Math.min(total, Math.ceil((top + height) / this.rowHeight) + this.buffer)
        };
    }

    render() {
        if (this.disposed || typeof this.renderRow !== "function") return;

        const range = this.getVisibleRange();
        if (range.start === this.lastStart && range.end === this.lastEnd) return;

        this.lastStart = range.start;
        this.lastEnd = range.end;
        this.pool.innerHTML = "";
        this.pool.style.transform = `translateY(${range.start * this.rowHeight}px)`;

        const fragment = document.createDocumentFragment();

        for (let i = range.start; i < range.end; i++) {
            const row = this.renderRow(this.items[i], i, i === this.selectedIndex, this.cache);
            fragment.appendChild(row);
        }

        this.pool.appendChild(fragment);
    }

    dispose() {
        this.disposed = true;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = 0;
        this.container.removeEventListener("scroll", this.onScroll);
        this.container.innerHTML = "";
        this.items = [];
    }
};