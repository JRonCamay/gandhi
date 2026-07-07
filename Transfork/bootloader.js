/*
Transfork/bootloader.js
Loads all Transfork modules from the same Transfork folder.
*/

(function () {
    'use strict';

    if (window.__TransforkBootLoaded) return;
    window.__TransforkBootLoaded = true;

    let pendingRToggle = false;

    // if there is a pending toggle set by KEY fallback before bootloader loaded
    if (window.__TransforkPendingRToggle) {
        pendingRToggle = true;
        window.__TransforkPendingRToggle = false;
    }

    function isEditableTarget(target) {
        const tag = target && target.tagName;
        return (
            tag === 'TEXTAREA' ||
            target?.isContentEditable ||
            (
                tag === 'INPUT' &&
                !target.readOnly &&
                !target.disabled &&
                !target.closest?.('[class*="banner"], [class*="notice"], [class*="alert"], [class*="toast"]')
            )
        );
    }

    function isRKey(event) {
        return event && (event.code === 'KeyR' || String(event.key || '').toLowerCase() === 'r');
    }

    function consumeRKey(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }

    window.__TransforkInstallTransformToggle = function (toggle) {
        if (typeof toggle !== 'function') return;
        window.__TransforkToggleTransformMode = toggle;
        if (pendingRToggle) {
            pendingRToggle = false;
            toggle();
        }
    };

    // register R key handler through KEY subsystem or fallback
    const rKeyHandler = event => {
        if (event.repeat || !isRKey(event) || isEditableTarget(event.target)) return false;
        consumeRKey(event);
        if (typeof window.__TransforkToggleTransformMode === 'function') {
            window.__TransforkToggleTransformMode();
        } else {
            pendingRToggle = true;
            window.__TransforkPendingRToggle = true;
        }
        return true;
    };

    if (window.KEY && typeof window.KEY.register === 'function') {
        window.KEY.register(rKeyHandler);
    } else {
        window.addEventListener(
            'keydown',
            event => {
                rKeyHandler(event);
            },
            true
        );
    }

    window.addEventListener(
        'keyup',
        event => {
            if (!isRKey(event) || isEditableTarget(event.target)) return;
            consumeRKey(event);
        },
        true
    );

    const BASE =
        typeof TRANSFORK_BASE === 'string'
            ? TRANSFORK_BASE
            : 'https://raw.githubusercontent.com/JRonCamay/gandhi/main/Transfork/';

    const MODULES = [
        'config.js',
        'utils.js',
        'engine/simulation.js',
        'engine/transform.js',
        'geometry.js',
        'alpha-tools.js',
        'tools/move-tool.js',
        'tools/resize-tool.js',
        'tools/rotate-tool.js',
        'ui/overlay.js',
        'tools/move-tool.js',
        'snap-visuals.js',
        'snap/candidate-solver.js',
        'snap/edge-solver.js',
        'snapping.js',
        'snapping-v2.js',
        'snapping-v3.js',
        'vm.js',
        'asset-bake-engine.js',
        'overlay-tools.js',
        'skew-tools.js',
        'corner-snap-patch.js',
        'snap-settle-patch.js',
        'transfork-main.js'
    ];

    async function fallbackFetch(url) {
        const response = await fetch(url + '?v=' + Date.now(), {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error('HTTP ' + response.status + ' loading ' + url);
        }

        return response.text();
    }

    function fallbackRun(code, url) {
        new Function(code + '\n//# sourceURL=' + url)();
    }

    function prepareModuleCode(name, code) {
        if (name !== 'transfork-main.js') return code;
        return code.replace(
            '        function waitForVM() {',
            '        window.__TransforkInstallTransformToggle?.(toggleTransformMode);\n\n        function waitForVM() {'
        );
    }

    async function loadModule(name) {
        const url = BASE + name;

        const loadText =
            typeof TRANSFORK_LOAD_TEXT === 'function'
                ? TRANSFORK_LOAD_TEXT
                : fallbackFetch;

        const runCode =
            typeof TRANSFORK_RUN_CODE === 'function'
                ? TRANSFORK_RUN_CODE
                : fallbackRun;

        const code = prepareModuleCode(name, await loadText(url));
        runCode(code, url);
    }

    async function boot() {
        for (const moduleName of MODULES) {
            await loadModule(moduleName);
        }

        console.log('[Transfork] loaded from:', BASE);
    }

    boot().catch(error => {
        console.error('[Transfork bootloader]', error);
        alert('Transfork bootloader failed: ' + error.message);
    });
})();
