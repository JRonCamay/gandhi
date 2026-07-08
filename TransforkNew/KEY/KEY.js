(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "KEY.local.TransforkNew.KEY.KEY.js.makeReport", file: "TransforkNew/KEY/KEY.js", functionName: "makeReport", purpose: "local process member registration for makeReport", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.normalizeKey", file: "TransforkNew/KEY/KEY.js", functionName: "normalizeKey", purpose: "local process member registration for normalizeKey", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.modifierMatches", file: "TransforkNew/KEY/KEY.js", functionName: "modifierMatches", purpose: "local process member registration for modifierMatches", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.defaultShortcutMatches", file: "TransforkNew/KEY/KEY.js", functionName: "defaultShortcutMatches", purpose: "local process member registration for defaultShortcutMatches", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.defaultFindShortcut", file: "TransforkNew/KEY/KEY.js", functionName: "defaultFindShortcut", purpose: "local process member registration for defaultFindShortcut", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.isEditableTarget", file: "TransforkNew/KEY/KEY.js", functionName: "isEditableTarget", purpose: "local process member registration for isEditableTarget", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.focusGuard", file: "TransforkNew/KEY/KEY.js", functionName: "focusGuard", purpose: "local process member registration for focusGuard", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.shieldEvent", file: "TransforkNew/KEY/KEY.js", functionName: "shieldEvent", purpose: "local process member registration for shieldEvent", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.acquireLine", file: "TransforkNew/KEY/KEY.js", functionName: "acquireLine", purpose: "local process member registration for acquireLine", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.releaseLine", file: "TransforkNew/KEY/KEY.js", functionName: "releaseLine", purpose: "local process member registration for releaseLine", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.station01_validateEnabled", file: "TransforkNew/KEY/KEY.js", functionName: "station01_validateEnabled", purpose: "local process member registration for station01_validateEnabled", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.station02_findShortcut", file: "TransforkNew/KEY/KEY.js", functionName: "station02_findShortcut", purpose: "local process member registration for station02_findShortcut", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.station03_focusGuard", file: "TransforkNew/KEY/KEY.js", functionName: "station03_focusGuard", purpose: "local process member registration for station03_focusGuard", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.station04_acquireLine", file: "TransforkNew/KEY/KEY.js", functionName: "station04_acquireLine", purpose: "local process member registration for station04_acquireLine", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.station05_runShortcut", file: "TransforkNew/KEY/KEY.js", functionName: "station05_runShortcut", purpose: "local process member registration for station05_runShortcut", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.station06_releaseLine", file: "TransforkNew/KEY/KEY.js", functionName: "station06_releaseLine", purpose: "local process member registration for station06_releaseLine", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.dispatch", file: "TransforkNew/KEY/KEY.js", functionName: "dispatch", purpose: "local process member registration for dispatch", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.register", file: "TransforkNew/KEY/KEY.js", functionName: "register", purpose: "local process member registration for register", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.start", file: "TransforkNew/KEY/KEY.js", functionName: "start", purpose: "local process member registration for start", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.process", file: "TransforkNew/KEY/KEY.js", functionName: "process", purpose: "local process member registration for process", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.done", file: "TransforkNew/KEY/KEY.js", functionName: "done", purpose: "local process member registration for done", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.wait", file: "TransforkNew/KEY/KEY.js", functionName: "wait", purpose: "local process member registration for wait", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.stop", file: "TransforkNew/KEY/KEY.js", functionName: "stop", purpose: "local process member registration for stop", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.setEnabled", file: "TransforkNew/KEY/KEY.js", functionName: "setEnabled", purpose: "local process member registration for setEnabled", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.isEnabled", file: "TransforkNew/KEY/KEY.js", functionName: "isEnabled", purpose: "local process member registration for isEnabled", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.KEY.js.destroy", file: "TransforkNew/KEY/KEY.js", functionName: "destroy", purpose: "local process member registration for destroy", manager: "KEY", station: 0 }
        ].forEach(register);
    })();

    const previous = window.KEY;
    if (previous && typeof previous.destroy === "function") previous.destroy();

    console.log("[TN LOADER] KEY/KEY.js loaded");

    const FILE = "TransforkNew/KEY/KEY.js";
    const api = {};
    const registry = [];
    let enabled = false;
    let activeLine = null;

    function makeReport(status, extra = {}) {
        return Object.assign({ status }, extra);
    }

    const keyManager = {
        line: "KEY",
        name: "KEY",
        currStation: 0,
        maxStation: 6,
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
                    const finishedStation = this.currStation;
                    this.submitEndSession();
                    if (finishedStation >= this.maxStation) {
                        this.currStation = 0;
                        return makeReport("done", {
                            line: this.line,
                            station: finishedStation,
                            reason: "line complete"
                        });
                    }
                    continue;
                }

                if (report.status === "wait") {
                    this.releaseContextLine();
                    return report;
                }

                if (report.status === "stop") {
                    this.releaseContextLine();
                    return this.stop(report.reason || "station stopped");
                }

                this.releaseContextLine();
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

        submitEndSession() {
            this.currStation += 1;
            return this.currStation;
        },

        releaseContextLine() {
            try {
                const ctx = this.context || {};
                if (ctx.shortcutId) releaseLine(ctx.shortcutId);
            } catch (error) {
                this.sleeper(error, FILE, "releaseContextLine", this.currStation);
            }
        },

        done(extra = {}) {
            return makeReport("done", extra);
        },

        wait(extra = {}) {
            return makeReport("wait", extra);
        },

        stop(reason, extra = {}) {
            this.releaseContextLine();
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
    window.TransforkNew.MANAGERS = window.TransforkNew.MANAGERS || {};
    window.TransforkNew.MANAGERS.KEY = keyManager;

    function normalizeKey(key) {
        try {
            return String(key || "").toLowerCase();
        } catch (error) {
            keyManager.sleeper(error, FILE, "normalizeKey", 0);
            return "";
        }
    }

    function modifierMatches(event, shortcut, prop, eventProp) {
        try {
            if (typeof shortcut[prop] !== "boolean") return true;
            return Boolean(event[eventProp]) === shortcut[prop];
        } catch (error) {
            keyManager.sleeper(error, FILE, "modifierMatches", 0);
            return false;
        }
    }

    function defaultShortcutMatches(event, shortcut) {
        try {
            if (!shortcut || typeof shortcut.run !== "function") return false;
            if (shortcut.disabled) return false;
            if (event.repeat && !shortcut.repeat) return false;
            if (shortcut.key && normalizeKey(event.key) !== normalizeKey(shortcut.key)) return false;
            if (!modifierMatches(event, shortcut, "alt", "altKey")) return false;
            if (!modifierMatches(event, shortcut, "ctrl", "ctrlKey")) return false;
            if (!modifierMatches(event, shortcut, "shift", "shiftKey")) return false;
            if (!modifierMatches(event, shortcut, "meta", "metaKey")) return false;
            return true;
        } catch (error) {
            keyManager.sleeper(error, FILE, "defaultShortcutMatches", 2);
            return false;
        }
    }

    function defaultFindShortcut(event) {
        try {
            for (const shortcut of registry) {
                if (defaultShortcutMatches(event, shortcut)) return shortcut;
            }
            return null;
        } catch (error) {
            keyManager.sleeper(error, FILE, "defaultFindShortcut", 2);
            return null;
        }
    }

    function isEditableTarget(target) {
        try {
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
        } catch (error) {
            keyManager.sleeper(error, FILE, "isEditableTarget", 3);
            return false;
        }
    }

    function focusGuard(event, shortcut) {
        try {
            if (shortcut && shortcut.allowInEditable) return true;
            return !isEditableTarget(event.target) && !isEditableTarget(document.activeElement);
        } catch (error) {
            keyManager.sleeper(error, FILE, "focusGuard", 3);
            return false;
        }
    }

    function shieldEvent(event) {
        try {
            event.preventDefault?.();
            event.stopPropagation?.();
            event.stopImmediatePropagation?.();
        } catch (error) {
            keyManager.sleeper(error, FILE, "shieldEvent", 4);
        }
    }

    function acquireLine(id) {
        try {
            if (activeLine) return false;
            activeLine = id;
            return true;
        } catch (error) {
            keyManager.sleeper(error, FILE, "acquireLine", 4);
            return false;
        }
    }

    function releaseLine(id) {
        try {
            if (activeLine !== id) return;
            activeLine = null;
        } catch (error) {
            keyManager.sleeper(error, FILE, "releaseLine", 6);
        }
    }

    function station01_validateEnabled(ctx) {
        if (!keyManager.guard(1, FILE, "station01_validateEnabled")) return keyManager.stop("blocked station 1");

        try {
            if (!enabled) {
                return keyManager.stop("key disabled");
            }
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
        } catch (error) {
            keyManager.sleeper(error, FILE, "station01_validateEnabled", 1);
            return keyManager.stop("station01_validateEnabled crashed", { error });
        }
    }

    function station02_findShortcut(ctx) {
        if (!keyManager.guard(2, FILE, "station02_findShortcut")) return keyManager.stop("blocked station 2");

        try {
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
        } catch (error) {
            keyManager.sleeper(error, FILE, "station02_findShortcut", 2);
            return keyManager.stop("station02_findShortcut crashed", { error });
        }
    }

    function station03_focusGuard(ctx) {
        if (!keyManager.guard(3, FILE, "station03_focusGuard")) return keyManager.stop("blocked station 3");

        try {
            if (!focusGuard(ctx.event, ctx.shortcut)) {
                if (ctx.event?.key?.toLowerCase?.() === "r") console.log("[TN LOADER] KEY R blocked by focusGuard", ctx.shortcut);
                return keyManager.stop("focus blocked");
            }
            return keyManager.done({ station: 3 });
        } catch (error) {
            keyManager.sleeper(error, FILE, "station03_focusGuard", 3);
            return keyManager.stop("station03_focusGuard crashed", { error });
        }
    }

    function station04_acquireLine(ctx) {
        if (!keyManager.guard(4, FILE, "station04_acquireLine")) return keyManager.stop("blocked station 4");

        try {
            shieldEvent(ctx.event);
            ctx.shortcutId = ctx.shortcut.id || "shortcut." + registry.indexOf(ctx.shortcut);
            if (!acquireLine(ctx.shortcutId)) return keyManager.stop("line busy");
            return keyManager.done({ station: 4 });
        } catch (error) {
            keyManager.sleeper(error, FILE, "station04_acquireLine", 4);
            return keyManager.stop("station04_acquireLine crashed", { error });
        }
    }

    function station05_runShortcut(ctx) {
        if (!keyManager.guard(5, FILE, "station05_runShortcut")) return keyManager.stop("blocked station 5");

        try {
            if (ctx.event?.key?.toLowerCase?.() === "r") console.log("[TN LOADER] KEY running R shortcut", ctx.shortcut);
            const report = ctx.shortcut.run(ctx.event);
            if (!report || typeof report !== "object" || !report.status) {
                return keyManager.stop("shortcut returned no report");
            }
            if (report.status === "done") return keyManager.done({ station: 5, shortcutReport: report });
            if (report.status === "wait") return keyManager.wait({ station: 5, shortcutReport: report });
            return keyManager.stop(report.reason || "shortcut stopped");
        } catch (error) {
            keyManager.sleeper(error, FILE, "station05_runShortcut", 5);
            return keyManager.stop("station05_runShortcut crashed", { error });
        }
    }

    function station06_releaseLine(ctx) {
        if (!keyManager.guard(6, FILE, "station06_releaseLine")) return keyManager.stop("blocked station 6");

        try {
            releaseLine(ctx.shortcutId);
            return keyManager.done({ station: 6 });
        } catch (error) {
            keyManager.sleeper(error, FILE, "station06_releaseLine", 6);
            return keyManager.stop("station06_releaseLine crashed", { error });
        }
    }

    keyManager.register(1, station01_validateEnabled, { functionName: "station01_validateEnabled" });
    keyManager.register(2, station02_findShortcut, { functionName: "station02_findShortcut" });
    keyManager.register(3, station03_focusGuard, { functionName: "station03_focusGuard" });
    keyManager.register(4, station04_acquireLine, { functionName: "station04_acquireLine" });
    keyManager.register(5, station05_runShortcut, { functionName: "station05_runShortcut" });
    keyManager.register(6, station06_releaseLine, { functionName: "station06_releaseLine" });

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "KEY.dispatch", file: FILE, functionName: "dispatch", purpose: "starts KEY manager pipeline", manager: "KEY", station: 0 });
    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "KEY.station01.validateEnabled", file: FILE, functionName: "station01_validateEnabled", purpose: "validates KEY line is enabled", manager: "KEY", station: 1 });
    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "KEY.station02.findShortcut", file: FILE, functionName: "station02_findShortcut", purpose: "finds matched key shortcut", manager: "KEY", station: 2 });
    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "KEY.station03.focusGuard", file: FILE, functionName: "station03_focusGuard", purpose: "blocks shortcuts inside text inputs", manager: "KEY", station: 3 });
    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "KEY.station04.acquireLine", file: FILE, functionName: "station04_acquireLine", purpose: "acquires KEY line ownership", manager: "KEY", station: 4 });
    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "KEY.station05.runShortcut", file: FILE, functionName: "station05_runShortcut", purpose: "runs matched key shortcut", manager: "KEY", station: 5 });
    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "KEY.station06.releaseLine", file: FILE, functionName: "station06_releaseLine", purpose: "releases KEY line ownership", manager: "KEY", station: 6 });

    function rawKeyProbe(event) {
        if (event?.key?.toLowerCase?.() !== "r") return;
        console.log("[TN KEY RAW] keydown observed", {
            enabled,
            activeLine,
            registryCount: registry.length,
            managerStation: keyManager.currStation
        });
    }

    function dispatch(event) {
        try {
            if (event?.key?.toLowerCase?.() === "r") {
                console.log("[TN KEY] keydown received", {
                    enabled,
                    activeLine,
                    registryCount: registry.length,
                    currStation: keyManager.currStation
                });
            }
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
            try {
                enabled = Boolean(value);
            } catch (error) {
                keyManager.sleeper(error, FILE, "setEnabled", 0);
            }
        },
        isEnabled() {
            try {
                return enabled;
            } catch (error) {
                keyManager.sleeper(error, FILE, "isEnabled", 0);
                return false;
            }
        },
        destroy() {
            try {
                enabled = false;
                activeLine = null;
                registry.length = 0;
                window.removeEventListener("keydown", dispatch, true);
                window.removeEventListener("keydown", rawKeyProbe, true);
            } catch (error) {
                keyManager.sleeper(error, FILE, "destroy", 0);
            }
        }
    });

    window.KEY = api;
    window.addEventListener("keydown", rawKeyProbe, true);
    window.addEventListener("keydown", dispatch, true);
    console.log("[TN LOADER] KEY listener attached but disabled until loader ready");
})();
