/*
BlokSearch/bloksearch-search-engine.js
Fuzzy fallback search helpers for the legacy BlokSearch main pipeline.
*/
window.BlokSearch = window.BlokSearch || {};

window.BlokSearch.searchEngine = {
    isCompatibleEntry(entry, context) {
        if (!entry) return false;

        const reporterMode = !!context.reporterMode;
        const targetedConnection = context.targetedConnection;
        const isBooleanTarget = !!context.isBooleanTarget;

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

            entry.searchScore = 300 - match.distance;
            results.push(entry);
        }

        return results.sort((a, b) =>
            (b.searchScore || 0) - (a.searchScore || 0)
        );
    }
};