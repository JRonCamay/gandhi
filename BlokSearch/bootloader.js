/*
BlokSearch/bootloader.js
Loads all BlokSearch modules from the same BlokSearch folder.
*/

(function () {
    'use strict';

    if (window.__BlokSearchBootLoaded) return;
    window.__BlokSearchBootLoaded = true;

    const BASE =
        typeof BLOKSEARCH_BASE === 'string'
            ? BLOKSEARCH_BASE
            : 'https://raw.githubusercontent.com/JRonCamay/gandhi/main/BlokSearch/';

    const MODULES = [
        'config.js',
        'utils.js',
        'smart-search-data.js',
        'history.js',
        'blockly-adapter.js',
        'ui.js',
        'shadow-event-proxy.js',
        'bloksearch-text-format.js',
        'bloksearch-block-shapes.js',
        'bloksearch-search-engine.js',
        'search-controller.js',
        'block-cache.js',
        'virtual-list-renderer.js',
        'persistence-manager.js',
        'canvas-injector.js',
        'app-orchestrator.js',
        'bloksearch-main.js'
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

    async function fetchModule(name, loadText) {
        const url = BASE + name;
        const code = await loadText(url);

        return {
            name,
            url,
            code
        };
    }

    function patchMainSearchPipeline(code) {
        const target = `filteredEntries = [
                ...smartResults,
                ...normalResults
            ];`;

        const replacement = `filteredEntries = [
                ...smartResults,
                ...normalResults
            ];

            if (
                filteredEntries.length === 0 &&
                window.BlokSearch &&
                window.BlokSearch.searchEngine &&
                window.BlokSearch.searchEngine.findFuzzyResults
            ) {
                filteredEntries = window.BlokSearch.searchEngine.findFuzzyResults({
                    cachedBlocks,
                    q,
                    reporterMode,
                    targetedConnection,
                    isBooleanTarget
                });
            }`;

        if (!code.includes(target)) return code;
        return code.replace(target, replacement);
    }

    function patchMainVirtualRenderer(code) {
        const stateTarget = `let selectedIndex = 0;
        let filteredEntries = [];`;
        const statePatch = `let selectedIndex = 0;
        let filteredEntries = [];
        let virtualRenderer = null;`;

        code = code.replace(stateTarget, statePatch);

        const renderRegex = /function renderResults\(\) \{[\s\S]*?\n        function refresh\(\) \{/;
        const renderPatch = `function renderResults() {
            if (!window.BlokSearch || !window.BlokSearch.VirtualListRenderer) {
                results.innerHTML = "";
                filteredEntries.forEach((entry, index) => {
                    const row = document.createElement("div");
                    row.textContent = entry.label;
                    row.onmousedown = e => {
                        if (e.button !== 0) return;
                        e.preventDefault();
                        e.stopPropagation();
                        const createdBlock = insertBlock(entry, window.mouseX, window.mouseY);
                        box.remove();
                        startDraggingBlock(createdBlock, e);
                    };
                    results.appendChild(row);
                });
                return;
            }

            const buildRow = (entry, index, selected, cache) => {
                const row = document.createElement("div");
                row.style.cssText = \`
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 4px 6px;
                    margin-bottom: 4px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background 0.1s;
                    box-sizing: border-box;
                \`;

                if (selected) {
                    row.style.background = "rgba(255,255,255,0.12)";
                }

                const blockFrame = document.createElement("div");
                blockFrame.style.cssText = getBlockFrameStyle(entry, "75%");
                const cacheKey = entry.type + "::" + entry.label;
                blockFrame.innerHTML = cache.getOrCreate(cacheKey, () => formatParameterText(entry.label));

                const categoryLabel = document.createElement("span");
                const categoryText = entry.category ? entry.category.charAt(0).toUpperCase() + entry.category.slice(1) : "Custom";
                categoryLabel.textContent = \`[\${categoryText}]\`;
                categoryLabel.style.cssText = \`
                    font-size: 10px;
                    color: #888;
                    font-weight: normal;
                    padding-left: 8px;
                    white-space: nowrap;
                \`;

                row.appendChild(blockFrame);
                row.appendChild(categoryLabel);

                row.onmouseenter = () => {
                    selectedIndex = index;
                    if (virtualRenderer) {
                        virtualRenderer.setSelectedIndex(selectedIndex);
                    }
                };

                row.onmousedown = e => {
                    if (e.button !== 0) return;
                    e.preventDefault();
                    e.stopPropagation();
                    const createdBlock = insertBlock(entry, window.mouseX, window.mouseY);
                    box.remove();
                    startDraggingBlock(createdBlock, e);
                };

                return row;
            };

            if (virtualRenderer) {
                virtualRenderer.dispose();
            }

            virtualRenderer = new window.BlokSearch.VirtualListRenderer(results, {
                rowHeight: 38,
                buffer: 8,
                cache: window.BlokSearch.blockFrameCache || (window.BlokSearch.blockFrameCache = new window.BlokSearch.BlockCache(500)),
                renderRow: buildRow
            });

            virtualRenderer.setItems(filteredEntries, selectedIndex);
            virtualRenderer.setSelectedIndex(selectedIndex);
        }

        function refresh() {`;

        return code.replace(renderRegex, renderPatch);
    }

    function prepareModuleCode(loadedModule) {
        if (loadedModule.name === 'bloksearch-main.js') {
            return patchMainVirtualRenderer(
                patchMainSearchPipeline(loadedModule.code)
            );
        }

        return loadedModule.code;
    }

    async function boot() {
        const loadText =
            typeof BLOKSEARCH_LOAD_TEXT === 'function'
                ? BLOKSEARCH_LOAD_TEXT
                : fallbackFetch;

        const runCode =
            typeof BLOKSEARCH_RUN_CODE === 'function'
                ? BLOKSEARCH_RUN_CODE
                : fallbackRun;

        const loadedModules = await Promise.all(
            MODULES.map(moduleName => fetchModule(moduleName, loadText))
        );

        for (const loadedModule of loadedModules) {
            runCode(prepareModuleCode(loadedModule), loadedModule.url);
        }

        console.log('[BlokSearch] loaded from:', BASE);
    }

    boot().catch(error => {
        console.error('[BlokSearch bootloader]', error);
        alert('BlokSearch bootloader failed: ' + error.message);
    });
})();