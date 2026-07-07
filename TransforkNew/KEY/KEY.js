(function () {
    "use strict";

    const previous = window.KEY;
    if (previous && typeof previous.destroy === "function") previous.destroy();

    console.log("[TN LOADER] KEY/KEY.js loaded");

    const FILE = "TransforkNew/KEY/KEY.js";
    const api = {};
    const registry = [];
    let enabled = true;
    let activeLine = null;

    const keyManager = {
        line: "KEY",
        currStation: 1,
        setStation(station) {
            this.currStation = station;
        },
        guard(station, file, functionName) {
            const allowed = this.currStation === station;
            if (!allowed) {
                window.TransforkNew?.SYSTEM?.debug?.warn?.("KEY guardian blocked", {
                    file,
                    functionName,
                    expectedStation: station,
                    currStation: this.currStation
                });
            }
            return allowed;
        },
        sleeper(error, file, functionName, station) {
            window.TransforkNew?.SYSTEM?.debug?.error?.("KEY sleeper catch", {
                file,
                functionName,
                station,
                error
            });
        }
    };

    window.TransforkNew = window.TransforkNew || {};
    window.TransforkNew.KEY_MANAGER = keyManager;

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({
        id: "KEY.dispatch",
        file: FILE,
        functionName: "dispatch",
        purpose: "single global keydown dispatcher",
        manager: "KEY",
        station: 1
    });

    function normalizeKey(key) {
        return String(key || "").toLowerCase();
    }

    function modifierMatches(event, shortcut, prop, eventProp) {
        if (typeof shortcut[prop] !== "boolean") return true;
        return Boolean(event[eventProp]) === shortcut[prop];
    }

    function defaultShortcutMatches(event, shortcut) {
        if (!shortcut || typeof shortcut.run !== "function") return false;
        if (shortcut.disabled) return false;
        if (event.repeat && !shortcut.repeat) return false;
        if (shortcut.key && normalizeKey(event.key) !== normalizeKey(shortcut.key)) return false;
        if (!modifierMatches(event, shortcut, "alt", "altKey")) return false;
        if (!modifierMatches(event, shortcut, "ctrl", "ctrlKey")) return false;
        if (!modifierMatches(event, shortcut, "shift", "shiftKey")) return false;
        if (!modifierMatches(event, shortcut, "meta", "metaKey")) return false;
        return true;
    }

    function defaultFindShortcut(event) {
        for (const shortcut of registry) {
            if (defaultShortcutMatches(event, shortcut)) return shortcut;
        }
        return null;
    }

    function isEditableTarget(target) {
        if (!target) return false;
        const element = target.nodeType === 1 ? target : target.parentElement;
        if (!element) return false;
        const tag = element.tagName;
        return (
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT" ||
            Boolean(element.isContentEditable) ||
            Boolean(element.closest?.("input, textarea, select, [contenteditable='true']"))
        );
    }

    function focusGuard(event, shortcut) {
        if (shortcut && shortcut.allowInEditable) return true;
        return !isEditableTarget(event.target) && !isEditableTarget(document.activeElement);
    }

    function shieldEvent(event) {
        event.preventDefault?.();
        event.stopPropagation?.();
        event.stopImmediatePropagation?.();
    }

    function acquireLine(id) {
        if (activeLine) return false;
        activeLine = id;
        return true;
    }

    function releaseLine(id) {
        if (activeLine !== id) return;
        activeLine = null;
    }

    function runRNoMatchFallback(event) {
        if (event?.key?.toLowerCase?.() !== "r") return false;
        console.warn("[TN LOADER] KEY R has no registered shortcut", {
            registry,
            registered: window.TransforkNew?.REGISTRY?.list?.() || []
        });
        return false;
    }

    function dispatch(event) {
        if (!keyManager.guard(1, FILE, "dispatch")) return;

        try {
            if (event?.key?.toLowerCase?.() === "r") {
                console.log("[TN LOADER] KEY dispatch saw R", {
                    enabled,
                    registryCount: registry.length,
                    activeLine,
                    target: event.target,
                    activeElement: document.activeElement
                });
            }
            if (!enabled) return;

            const shortcut = typeof api.findShortcut === "function"
                ? api.findShortcut(event)
                : defaultFindShortcut(event);

            if (!shortcut) {
                if (event?.key?.toLowerCase?.() === "r") console.log("[TN LOADER] KEY no shortcut matched R", registry);
                runRNoMatchFallback(event);
                return;
            }
            if (!focusGuard(event, shortcut)) {
                if (event?.key?.toLowerCase?.() === "r") console.log("[TN LOADER] KEY R blocked by focusGuard", shortcut);
                return;
            }

            shieldEvent(event);

            const id = shortcut.id || "shortcut." + registry.indexOf(shortcut);
            if (!acquireLine(id)) return;

            try {
                if (event?.key?.toLowerCase?.() === "r") console.log("[TN LOADER] KEY running R shortcut", shortcut);
                keyManager.setStation(2);
                const result = shortcut.run(event);
                keyManager.setStation(1);
                if (result && typeof result.finally === "function") {
                    result.finally(() => {
                        keyManager.setStation(1);
                        releaseLine(id);
                    });
                    return;
                }
            } catch (error) {
                keyManager.sleeper(error, FILE, "dispatch.shortcutRun", 2);
            }

            keyManager.setStation(1);
            releaseLine(id);
        } catch (error) {
            keyManager.setStation(1);
            keyManager.sleeper(error, FILE, "dispatch", 1);
        }
    }

    Object.assign(api, {
        __transforkNewKeySystem: true,
        registry,
        shortcuts: registry,
        normalizeKey,
        modifierMatches,
        shortcutMatches: defaultShortcutMatches,
        defaultFindShortcut,
        focusGuard,
        shieldEvent,
        acquireLine,
        releaseLine,
        manager: keyManager,
        getActiveLine: () => activeLine,
        setEnabled(value) {
            enabled = Boolean(value);
        },
        isEnabled() {
            return enabled;
        },
        destroy() {
            enabled = false;
            activeLine = null;
            registry.length = 0;
            window.removeEventListener("keydown", dispatch, true);
        }
    });

    window.KEY = api;
    window.addEventListener("keydown", dispatch, true);
    console.log("[TN LOADER] KEY listener attached");
})();
