/*
BlokSearch/search-controller.js
Main-thread controller for BlokSearch Web Worker search.
*/
window.BlokSearch = window.BlokSearch || {};

window.BlokSearch.MainThreadController = class MainThreadController {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || this.getBaseUrl();
        this.worker = null;
        this.workerUrl = null;
        this.requestId = 0;
        this.latestRequestId = 0;
        this.debounceTimer = null;
        this.debounceDelay = options.debounceDelay || 120;
        this.entries = [];
        this.ready = false;
        this.pendingSearch = null;
    }

    getBaseUrl() {
        if (typeof BLOKSEARCH_BASE === "string") return BLOKSEARCH_BASE;
        return "https://raw.githubusercontent.com/JRonCamay/gandhi/main/BlokSearch/";
    }

    async start() {
        if (this.worker) return true;

        try {
            const response = await fetch(this.baseUrl + "search-worker.js?v=" + Date.now(), {
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error("HTTP " + response.status + " loading search-worker.js");
            }

            const workerCode = await response.text();
            const blob = new Blob([workerCode], { type: "text/javascript" });
            this.workerUrl = URL.createObjectURL(blob);
            this.worker = new Worker(this.workerUrl);
            this.worker.onmessage = event => this.handleMessage(event.data || {});
            this.worker.onerror = error => this.handleError(error);
            return true;
        } catch (error) {
            console.warn("[BlokSearch worker] disabled:", error);
            this.dispose();
            return false;
        }
    }

    async setIndex(entries) {
        this.entries = Array.isArray(entries) ? entries : [];

        const ok = await this.start();
        if (!ok || !this.worker) return false;

        const requestId = ++this.requestId;
        this.worker.postMessage({
            type: "init",
            requestId,
            entries: this.entries.map(entry => ({
                type: entry.type || "",
                label: entry.label || "",
                category: entry.category || "",
                hasOutput: !!entry.hasOutput,
                isBoolean: !!(
                    entry.outputCheck &&
                    entry.outputCheck.includes("Boolean")
                )
            }))
        });

        return true;
    }

    search(query, options, onResult) {
        clearTimeout(this.debounceTimer);

        const requestId = ++this.requestId;
        this.latestRequestId = requestId;

        this.pendingSearch = {
            requestId,
            query,
            options: options || {},
            onResult
        };

        this.debounceTimer = setTimeout(() => {
            this.flushPendingSearch();
        }, this.debounceDelay);

        return requestId;
    }

    flushPendingSearch() {
        if (!this.pendingSearch || !this.worker) return;

        const job = this.pendingSearch;
        this.pendingSearch = null;

        this.worker.postMessage({
            type: "search",
            requestId: job.requestId,
            query: job.query,
            options: job.options
        });
    }

    handleMessage(message) {
        if (message.type === "ready") {
            this.ready = true;
            return;
        }

        if (message.type === "error") {
            if (message.requestId === this.latestRequestId) {
                console.warn("[BlokSearch worker]", message.message);
            }
            return;
        }

        if (message.type !== "search-result") return;
        if (message.requestId !== this.latestRequestId) return;

        const job = this.pendingSearch;
        const mappedResults = Array.isArray(message.results)
            ? message.results
                .map(result => {
                    const entry = this.entries[result.index];
                    if (!entry) return null;
                    entry.searchScore = result.score;
                    return entry;
                })
                .filter(Boolean)
            : [];

        if (job && typeof job.onResult === "function") {
            job.onResult(mappedResults, message);
        }

        if (typeof this.onResult === "function") {
            this.onResult(mappedResults, message);
        }
    }

    handleError(error) {
        console.warn("[BlokSearch worker error]", error);
    }

    dispose() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
        this.pendingSearch = null;

        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }

        if (this.workerUrl) {
            URL.revokeObjectURL(this.workerUrl);
            this.workerUrl = null;
        }

        this.ready = false;
    }
};

window.BlokSearch.searchController =
    window.BlokSearch.searchController ||
    new window.BlokSearch.MainThreadController();