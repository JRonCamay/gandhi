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

    function makeReport(status, extra = {}) {
        return Object.assign({ status }, extra);
    }

    const keyManager = {
        line: "KEY",
        currStation: 0,
        stations: {},
        context: null,
        lastReport: null,

        register(station, fn, meta = {}) {
            this.stations[station] = { fn, meta };
        },

        start(context) {
            this.context = context;
            this.currStation = 1;
            return this.process();
        },

        process() {
            while (this.currStation > 0) {
                const entry = this.stations[this.currStation];
                if (!entry || typeof entry.fn !== "function") {
                    return this.stop("missing station function");
                }

                let report = null;
                try {
                    report = entry.fn(this.context);
                } catch (error) {
                    this.sleeper(error, FILE, entry.meta?.functionName || "unknown", this.currStation);
                    return this.stop("station crashed");
                }

                if (!report || typeof report !== "object" || !report.status) {
                    return this.stop("station returned no report");
                }

                this.lastReport = report;

                if (report.status === "done") {
                    this.currStation += 1;
                    continue;
                }

                if (report.status === "wait") {
                    return report;
                }

                if (report.status === "stop") {
                    return this.stop(report.reason || "station stopped");
                }

                return this.stop("unknown station report");
            }

            return makeReport("stop", { reason: "line inactive" });
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

        done(extra = {}) {
            return makeReport("done", extra);
        },

        wait(extra = {}) {
            return makeReport("wait", extra);
        },

        stop(reason, extra = {}) {
            this.currStation = 0;
            return makeReport("stop", Object.assign({ reason }, extra));
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

    function station01_validateEnabled(ctx) {
        if (!keyManager.guard(1, FILE, "station01_validateEnabled")) return keyManager.stop("blocked station 1");
        if (!enabled) return keyManager.stop("key disabled");
        if (ctx.event?.key?.toLowerCase?.() === "r") {
            console.log("[TN LOADER] KEY dispatch saw R", {
                enabled,
                registryCount: registry.length,
                activeLine,
                target: ctx.event.target,
                activeElement: document.activeElement
            });
        }
        return keyManager.done({ station: 1 });
    }

    function station02_findShortcut(ctx) {
        if (!keyManager.guard(2, FILE, "station02_findShortcut")) return keyManager.stop("blocked station 2");
        ctx.shortcut = typeof api.findShortcut === "function" ? api.findShortcut(ctx.event) : defaultFindShortcut(ctx.event);
        if (!ctx.shortcut) {
            if (ctx.event?.key?.toLowerCase?.() === "r") {
                console.warn("[TN LOADER] KEY R has no registered shortcut", {
                    registry,
                    registered: window.TransforkNew?.REGISTRY?.list?.() || []
                });
            }
            return keyManager.stop("no shortcut matched");
        }
        return keyManager.done({ station: 2 });
    }

    function station03_focusGuard(ctx) {
        if (!keyManager.guard(3, FILE, "station03_focusGuard")) return keyManager.stop("blocked station 3");
        if (!focusGuard(ctx.event, ctx.shortcut)) {
            if (ctx.event?.key?.toLowerCase?.() === "r") console.log("[TN LOADER] KEY R blocked by focusGuard", ctx.shortcut);
            return keyManager.stop("focus blocked");
        }
        return keyManager.done({ station: 3 });
    }

    function station04_acquireLine(ctx) {
        if (!keyManager.guard(4, FILE, "station04_acquireLine")) return keyManager.stop("blocked station 4");
        shieldEvent(ctx.event);
        ctx.shortcutId = ctx.shortcut.id || "shortcut." + registry.indexOf(ctx.shortcut);
        if (!acquireLine(ctx.shortcutId)) return keyManager.stop("line busy");
        return keyManager.done({ station: 4 });
    }

    function station05_runShortcut(ctx) {
        if (!keyManager.guard(5, FILE, "station05_runShortcut")) return keyManager.stop("blocked station 5");
        if (ctx.event?.key?.toLowerCase?.() === "r") console.log("[TN LOADER] KEY running R shortcut", ctx.shortcut);
        const report = ctx.shortcut.run(ctx.event);
        if (!report || typeof report !== "object" || !report.status) {
            return keyManager.stop("shortcut returned no report");
        }
        if (report.status === "done") return keyManager.done({ station: 5, shortcutReport: report });
        if (report.status === "wait") return keyManager.wait({ station: 5, shortcutReport: report });
        return keyManager.stop(report.reason || "shortcut stopped");
    }

    function station06_releaseLine(ctx) {
        if (!keyManager.guard(6, FILE, "station06_releaseLine")) return keyManager.stop("blocked station 6");
        releaseLine(ctx.shortcutId);
        return keyManager.done({ station: 6 });
    }

    keyManager.register(1, station01_validateEnabled, { functionName: "station01_validateEnabled" });
    keyManager.register(2, station02_findShortcut, { functionName: "station02_findShortcut" });
    keyManager.register(3, station03_focusGuard, { functionName: "station03_focusGuard" });
    keyManager.register(4, station04_acquireLine, { functionName: "station04_acquireLine" });
    keyManager.register(5, station05_runShortcut, { functionName: "station05_runShortcut" });
    keyManager.register(6, station06_releaseLine, { functionName: "station06_releaseLine" });

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "KEY.dispatch", file: FILE, functionName: "dispatch", purpose: "starts KEY manager pipeline", manager: "KEY", station: 0 });
    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "KEY.station05.runShortcut", file: FILE, functionName: "station05_runShortcut", purpose: "runs matched key shortcut", manager: "KEY", station: 5 });

    function dispatch(event) {
        try {
            return keyManager.start({ event });
        } catch (error) {
            keyManager.sleeper(error, FILE, "dispatch", 0);
            return keyManager.stop("dispatch crashed");
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
