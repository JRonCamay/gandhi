/*
BlokSearch/bloksearch-search-engine.js
Fuzzy fallback and context-aware ranking helpers for the legacy BlokSearch main pipeline.
*/
window.BlokSearch = window.BlokSearch || {};

window.BlokSearch.searchEngine = {
    isCompatibleEntry(entry, context) {
        if (!entry) return false;

        const reporterMode = !!context.reporterMode;
        const targetedConnection = context.targetedConnection;
        const isBooleanTarget = !!context.isBooleanTarget || !!context.booleanMode;

        if (reporterMode && !entry.hasOutput) return false;

        if (targetedConnection && entry.outputConnection) {
            try {
                if (!targetedConnection.checkType_(entry.outputConnection)) return false;
            } catch (err) {
                if (targetedConnection.check_ && entry.outputConnection.check_) {
                    const match = targetedConnection.check_.some(check =>
                        entry.outputConnection.check_.includes(check)
                    );

                    if (!match) return false;
                }
            }
        }

        const isEntryBoolean =
            entry.outputCheck &&
            entry.outputCheck.includes("Boolean");

        if (isBooleanTarget) {
            if (!isEntryBoolean) return false;
        } else if (reporterMode) {
            if (isEntryBoolean) return false;
        }

        return true;
    },

    normalizeCategory(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "")
            .trim();
    },

    getCandidateStrings(entry) {
        const values = [];

        if (entry.label) values.push(entry.label);
        if (entry.type) values.push(entry.type);

        if (entry.type && entry.type.includes("_")) {
            values.push(entry.type.replace(/_/g, " "));
            values.push(entry.type.split("_").pop());
        }

        return values;
    },

    getPersistenceBonus(entry) {
        const persistence = window.BlokSearch && window.BlokSearch.persistenceManager;
        if (!persistence || !entry || !entry.type) return 0;

        if (typeof persistence.getPriority === "function") {
            return Math.min(90, persistence.getPriority(entry.type));
        }

        return 0;
    },

    getContextBonus(entry, context) {
        if (!entry || !context) return 0;

        let bonus = 0;
        const activeCategory = this.normalizeCategory(context.category || context.activeCategory);
        const entryCategory = this.normalizeCategory(entry.category);

        if (activeCategory && entryCategory && activeCategory === entryCategory) {
            bonus += 45;
        }

        const isEntryBoolean =
            entry.outputCheck &&
            entry.outputCheck.includes("Boolean");

        if (context.booleanMode && isEntryBoolean) bonus += 40;
        if (context.reporterMode && entry.hasOutput && !isEntryBoolean) bonus += 28;
        if (!context.reporterMode && !entry.hasOutput) bonus += 12;

        return bonus;
    },

    scoreEntry(entry, baseScore, context) {
        return baseScore +
            this.getContextBonus(entry, context) +
            this.getPersistenceBonus(entry);
    },

    findFuzzyResults(context) {
        const utils = window.BlokSearch && window.BlokSearch.utils;
        if (!utils || !utils.findClosestString) return [];

        const query = utils.normalizeSearchText(context.q);
        const cachedBlocks = Array.isArray(context.cachedBlocks)
            ? context.cachedBlocks
            : [];

        if (!query || !cachedBlocks.length) return [];

        const results = [];
        const threshold = utils.getFuzzyThreshold(query);

        for (let i = 0; i < cachedBlocks.length; i++) {
            const entry = cachedBlocks[i];
            if (!this.isCompatibleEntry(entry, context)) continue;

            const match = utils.findClosestString(
                query,
                this.getCandidateStrings(entry),
                threshold
            );

            if (!match) continue;

            entry.searchScore = this.scoreEntry(entry, 300 - match.distance, context);
            results.push(entry);
        }

        return results.sort((a, b) =>
            (b.searchScore || 0) - (a.searchScore || 0)
        );
    }
};