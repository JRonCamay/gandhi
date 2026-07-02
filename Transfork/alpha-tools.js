/*
Transfork/alpha-tools.js
Alpha / ghost effect helpers for Transfork.
*/

(function () {
    'use strict';

    window.Transfork = window.Transfork || {};

    function getTarget(targetOverride) {
        return targetOverride || window.vm?.editingTarget || null;
    }

    function applySpriteAlpha(value, targetOverride) {
        const target = getTarget(targetOverride);
        if (!target || typeof target.setEffect !== 'function') return;

        const opacity = Math.max(0, Math.min(100, Number(value)));
        target.setEffect('ghost', 100 - opacity);
    }

    function getSpriteAlpha(targetOverride) {
        const target = getTarget(targetOverride);
        if (!target) return 100;

        const ghost = target.effects?.ghost || 0;
        return 100 - ghost;
    }

    window.Transfork.alphaTools = {
        applySpriteAlpha,
        getSpriteAlpha
    };

    window.applySpriteAlpha = applySpriteAlpha;
    window.getSpriteAlpha = getSpriteAlpha;

    console.log('[Transfork] alpha tools loaded');
})();
