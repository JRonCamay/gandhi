/*
BlokSearch/utils.js
Shared helpers for future cleanup.
Current working code remains mostly inside bloksearch-main.js to avoid breaking behavior.
*/
window.BlokSearch = window.BlokSearch || {};

window.BlokSearch.utils = {
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    normalizeSearchText(text) {
        return String(text || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ");
    },

    levenshteinDistance(a, b, maxDistance = Infinity) {
        a = this.normalizeSearchText(a);
        b = this.normalizeSearchText(b);

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
            const bChar = b.charCodeAt(j - 1);

            for (let i = 1; i <= smallLength; i++) {
                const cost = a.charCodeAt(i - 1) === bChar ? 0 : 1;
                const deletion = previous[i] + 1;
                const insertion = current[i - 1] + 1;
                const substitution = previous[i - 1] + cost;
                const value = Math.min(deletion, insertion, substitution);

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
    },

    getFuzzyThreshold(query) {
        const length = this.normalizeSearchText(query).length;

        if (length <= 3) return 1;
        if (length <= 6) return 2;
        return 3;
    },

    findClosestString(query, candidates, maxDistance) {
        const normalizedQuery = this.normalizeSearchText(query);
        if (!normalizedQuery || !Array.isArray(candidates) || !candidates.length) return null;

        const threshold = Number.isFinite(maxDistance)
            ? maxDistance
            : this.getFuzzyThreshold(normalizedQuery);

        let bestValue = null;
        let bestDistance = threshold + 1;

        for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i];
            const normalizedCandidate = this.normalizeSearchText(candidate);

            if (!normalizedCandidate) continue;

            if (normalizedCandidate === normalizedQuery) {
                return {
                    value: candidate,
                    distance: 0
                };
            }

            const distance = this.levenshteinDistance(
                normalizedQuery,
                normalizedCandidate,
                bestDistance - 1
            );

            if (distance < bestDistance) {
                bestDistance = distance;
                bestValue = candidate;
            }
        }

        if (bestValue === null || bestDistance > threshold) return null;

        return {
            value: bestValue,
            distance: bestDistance
        };
    }
};