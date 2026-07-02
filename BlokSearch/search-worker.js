/*
BlokSearch/search-worker.js
Background fuzzy search worker. No DOM access.
*/

class FuzzyMatch {
    static normalize(text) {
        return String(text || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ");
    }

    static threshold(query) {
        const length = query.length;
        if (length <= 2) return 0;
        if (length <= 4) return 1;
        if (length <= 7) return 2;
        return 3;
    }

    static distance(a, b, maxDistance) {
        a = FuzzyMatch.normalize(a);
        b = FuzzyMatch.normalize(b);

        if (a === b) return 0;
        if (!a) return b.length;
        if (!b) return a.length;

        if (a.length > b.length) {
            const temp = a;
            a = b;
            b = temp;
        }

        const smallLength = a.length;
        const largeLength = b.length;

        if (largeLength - smallLength > maxDistance) {
            return maxDistance + 1;
        }

        const previous = new Array(smallLength + 1);
        const current = new Array(smallLength + 1);

        for (let i = 0; i <= smallLength; i++) {
            previous[i] = i;
        }

        for (let j = 1; j <= largeLength; j++) {
            current[0] = j;
            let rowMin = current[0];
            const bCode = b.charCodeAt(j - 1);

            for (let i = 1; i <= smallLength; i++) {
                const cost = a.charCodeAt(i - 1) === bCode ? 0 : 1;
                const deletion = previous[i] + 1;
                const insertion = current[i - 1] + 1;
                const substitution = previous[i - 1] + cost;
                let value = deletion < insertion ? deletion : insertion;
                if (substitution < value) value = substitution;

                current[i] = value;
                if (value < rowMin) rowMin = value;
            }

            if (rowMin > maxDistance) {
                return maxDistance + 1;
            }

            for (let i = 0; i <= smallLength; i++) {
                previous[i] = current[i];
            }
        }

        return previous[smallLength];
    }

    static bestDistance(query, entry, maxDistance) {
        let best = maxDistance + 1;
        const fields = entry.fields;

        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            if (!field) continue;

            if (field === query) return 0;
            if (field.startsWith(query)) return 0;
            if (field.includes(query)) best = Math.min(best, 1);

            const distance = FuzzyMatch.distance(query, field, best - 1);
            if (distance < best) best = distance;
        }

        return best;
    }
}

let searchIndex = [];

function buildFields(entry) {
    const fields = [];
    const label = FuzzyMatch.normalize(entry.label);
    const type = FuzzyMatch.normalize(entry.type);
    const category = FuzzyMatch.normalize(entry.category);

    if (label) fields.push(label);
    if (type) {
        fields.push(type);
        fields.push(type.replace(/_/g, " "));
        const parts = type.split("_");
        if (parts.length) fields.push(parts[parts.length - 1]);
    }
    if (category) fields.push(category);

    return fields;
}

function setIndex(entries) {
    searchIndex = Array.isArray(entries)
        ? entries.map((entry, index) => ({
            index,
            type: entry.type || "",
            label: entry.label || "",
            category: entry.category || "",
            hasOutput: !!entry.hasOutput,
            isBoolean: !!entry.isBoolean,
            fields: buildFields(entry)
        }))
        : [];
}

function isCompatible(entry, options) {
    if (!options) return true;

    if (options.reporterMode && !entry.hasOutput) return false;

    if (options.isBooleanTarget) {
        return entry.isBoolean;
    }

    if (options.reporterMode && entry.isBoolean) {
        return false;
    }

    return true;
}

function search(requestId, query, options) {
    const normalizedQuery = FuzzyMatch.normalize(query);
    if (!normalizedQuery) {
        return {
            type: "search-result",
            requestId,
            results: []
        };
    }

    const limit = Math.max(1, Math.min(options?.limit || 100, 200));
    const threshold = FuzzyMatch.threshold(normalizedQuery);
    const results = [];

    for (let i = 0; i < searchIndex.length; i++) {
        const entry = searchIndex[i];
        if (!isCompatible(entry, options)) continue;

        const distance = FuzzyMatch.bestDistance(
            normalizedQuery,
            entry,
            threshold
        );

        if (distance > threshold) continue;

        results.push({
            index: entry.index,
            type: entry.type,
            score: 1000 - distance
        });
    }

    results.sort((a, b) => b.score - a.score);

    return {
        type: "search-result",
        requestId,
        results: results.slice(0, limit)
    };
}

self.onmessage = event => {
    const message = event.data || {};

    try {
        if (message.type === "init") {
            setIndex(message.entries || []);
            self.postMessage({
                type: "ready",
                requestId: message.requestId || 0,
                count: searchIndex.length
            });
            return;
        }

        if (message.type === "search") {
            self.postMessage(search(
                message.requestId,
                message.query,
                message.options || {}
            ));
        }
    } catch (error) {
        self.postMessage({
            type: "error",
            requestId: message.requestId || 0,
            message: error && error.message ? error.message : String(error)
        });
    }
};