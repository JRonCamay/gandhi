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
    }
};
