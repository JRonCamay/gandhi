/*
BlokSearch/app-orchestrator.js
Lifecycle controller for worker search, virtual rendering, cache, and teleportation.
*/
window.BlokSearch = window.BlokSearch || {};

window.BlokSearch.ErrorBoundary = class ErrorBoundary {
    constructor(scope = "BlokSearch") {
        this.scope = scope;
        this.failed = false;
        this.lastError = null;
    }

    run(label, fn, fallback = null) {
        try {
            return fn();
        } catch (error) {
            this.failed = true;
            this.lastError = error;
            console.error(`[${this.scope}] ${label}`, error);
            return fallback;
        }
    }

    async runAsync(label, fn, fallback = null) {
        try {
            return await fn();
        } catch (error) {
            this.failed = true;
            this.lastError = error;
            console.error(`[${this.scope}] ${label}`, error);
            return fallback;
        }
    }
};

window.BlokSearch.AppOrchestrator = class AppOrchestrator {
    constructor(options = {}) {
        this.workerController = options.workerController || window.BlokSearch.searchController || null;
        this.cache = options.cache || window.BlokSearch.blockFrameCache || null;
        this.canvasInjector = options.canvasInjector || window.BlokSearch.canvasInjector || null;
        this.renderer = null;
        this.results = [];
        this.selectedIndex = 0;
        this.pending = false;
        this.ready = false;
        this.disposed = false;
        this.boundary = new window.BlokSearch.ErrorBoundary("BlokSearch AppOrchestrator");
    }

    initialize(entries = []) {
        if (this.disposed) return false;

        if (!this.cache && window.BlokSearch.BlockCache) {
            this.cache = new window.BlokSearch.BlockCache(500);
            window.BlokSearch.blockFrameCache = this.cache;
        }

        return this.boundary.run("initialize", () => {
            if (this.workerController && this.workerController.setIndex) {
                this.workerController.setIndex(entries);
            }

            this.ready = true;
            return true;
        }, false);
    }

    bindRenderer(container, renderRow, options = {}) {
        return this.boundary.run("bindRenderer", () => {
            if (!window.BlokSearch.VirtualListRenderer || !container || typeof renderRow !== "function") {
                return false;
            }

            if (this.renderer) {
                this.renderer.dispose();
            }

            this.renderer = new window.BlokSearch.VirtualListRenderer(container, {
                rowHeight: options.rowHeight || 38,
                buffer: options.buffer || 8,
                cache: this.cache || new window.BlokSearch.BlockCache(500),
                renderRow
            });

            return true;
        }, false);
    }

    search(query, options = {}) {
        if (this.disposed || !this.ready) return false;

        return this.boundary.run("search", () => {
            if (!this.workerController || !this.workerController.search) {
                return false;
            }

            this.pending = true;

            this.workerController.search(query, options, results => {
                this.boundary.run("workerResult", () => {
                    if (this.disposed) return;

                    this.pending = false;
                    this.results = Array.isArray(results) ? results : [];
                    this.selectedIndex = 0;

                    if (this.renderer) {
                        this.renderer.setItems(this.results, this.selectedIndex);
                    }
                });
            });

            return true;
        }, false);
    }

    setResults(results, selectedIndex = 0) {
        return this.boundary.run("setResults", () => {
            this.pending = false;
            this.results = Array.isArray(results) ? results : [];
            this.selectedIndex = Math.max(0, selectedIndex | 0);

            if (this.renderer) {
                this.renderer.setItems(this.results, this.selectedIndex);
            }

            return true;
        }, false);
    }

    moveSelection(delta) {
        return this.boundary.run("moveSelection", () => {
            if (!this.results.length) return 0;

            this.selectedIndex = Math.max(
                0,
                Math.min(this.selectedIndex + delta, this.results.length - 1)
            );

            if (this.renderer) {
                this.renderer.setSelectedIndex(this.selectedIndex);
            }

            return this.selectedIndex;
        }, this.selectedIndex);
    }

    teleportSelected(context = {}) {
        return this.boundary.run("teleportSelected", () => {
            if (this.pending) return false;

            const entry = this.results[this.selectedIndex];
            if (!entry) return false;

            if (!this.canvasInjector || !this.canvasInjector.teleport) {
                window.dispatchEvent(new CustomEvent("bloksearch-teleport", {
                    bubbles: true,
                    composed: true,
                    detail: { entry, context }
                }));
                return false;
            }

            requestAnimationFrame(() => {
                this.boundary.run("canvasInjector.teleport", () => {
                    this.canvasInjector.teleport(entry, context);
                });
            });

            return true;
        }, false);
    }

    isPending() {
        return !!this.pending;
    }

    dispose() {
        this.disposed = true;
        this.pending = false;
        this.results = [];

        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }
    }
};

window.BlokSearch.appOrchestrator =
    window.BlokSearch.appOrchestrator ||
    new window.BlokSearch.AppOrchestrator();