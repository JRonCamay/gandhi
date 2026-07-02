/*
BlokSearch/persistence-manager.js
Smart Persistence for successful block insertions.
*/
window.BlokSearch = window.BlokSearch || {};

window.BlokSearch.PersistenceManager = class PersistenceManager {
    constructor(key = "bloksearch.frequentBlocks", limit = 100) {
        this.key = key;
        this.limit = Math.max(20, limit | 0);
        this.items = new Map();
        this.load();
    }

    load() {
        this.items.clear();

        try {
            const raw = localStorage.getItem(this.key);
            const list = raw ? JSON.parse(raw) : [];

            if (!Array.isArray(list)) return;

            list.forEach(item => {
                if (!item || !item.type) return;
                this.items.set(item.type, {
                    type: item.type,
                    label: item.label || item.type,
                    count: Math.max(1, item.count | 0),
                    lastUsed: Math.max(0, item.lastUsed | 0)
                });
            });
        } catch (error) {
            console.warn("[BlokSearch persistence] load failed", error);
        }
    }

    save() {
        try {
            localStorage.setItem(this.key, JSON.stringify(this.getFrequentBlocks()));
        } catch (error) {
            console.warn("[BlokSearch persistence] save failed", error);
        }
    }

    record(entry) {
        if (!entry || !entry.type) return;

        const existing = this.items.get(entry.type) || {
            type: entry.type,
            label: entry.label || entry.type,
            count: 0,
            lastUsed: 0
        };

        existing.label = entry.label || existing.label;
        existing.count++;
        existing.lastUsed = Date.now();
        this.items.set(entry.type, existing);
        this.prune();
        this.save();
    }

    prune() {
        if (this.items.size <= this.limit) return;

        const sorted = Array.from(this.items.values()).sort((a, b) => {
            const scoreA = a.count * 10000000000000 + a.lastUsed;
            const scoreB = b.count * 10000000000000 + b.lastUsed;
            return scoreB - scoreA;
        });

        this.items.clear();
        sorted.slice(0, this.limit).forEach(item => this.items.set(item.type, item));
    }

    getFrequentBlocks() {
        return Array.from(this.items.values()).sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            return b.lastUsed - a.lastUsed;
        });
    }

    getPriority(type) {
        const item = this.items.get(type);
        if (!item) return 0;
        return item.count * 1000 + Math.min(999, Math.floor((Date.now() - item.lastUsed) / -1000000));
    }
};

window.BlokSearch.persistenceManager =
    window.BlokSearch.persistenceManager ||
    new window.BlokSearch.PersistenceManager();