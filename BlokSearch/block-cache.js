/*
BlokSearch/block-cache.js
Small LRU cache for rendered block preview HTML strings.
*/
window.BlokSearch = window.BlokSearch || {};

window.BlokSearch.BlockCache = class BlockCache {
    constructor(limit = 500) {
        this.limit = Math.max(50, limit | 0);
        this.map = new Map();
    }

    get(key) {
        if (!this.map.has(key)) return null;

        const value = this.map.get(key);
        this.map.delete(key);
        this.map.set(key, value);
        return value;
    }

    set(key, value) {
        if (this.map.has(key)) {
            this.map.delete(key);
        }

        this.map.set(key, value);

        while (this.map.size > this.limit) {
            const oldestKey = this.map.keys().next().value;
            this.map.delete(oldestKey);
        }

        return value;
    }

    getOrCreate(key, factory) {
        const cached = this.get(key);
        if (cached !== null) return cached;

        return this.set(key, factory());
    }

    clear() {
        this.map.clear();
    }
};