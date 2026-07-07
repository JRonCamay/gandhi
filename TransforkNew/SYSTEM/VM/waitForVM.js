window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.VM = window.TransforkNew.SYSTEM.VM || {};

(function () {
    "use strict";

    function log(label, data) {
        window.TransforkNew.SYSTEM?.debug?.log?.("VM " + label, data);
    }

    function warn(label, data) {
        window.TransforkNew.SYSTEM?.debug?.warn?.("VM " + label, data);
    }

    function resolve(vm) {
        const api = window.TransforkNew.SYSTEM.VM;
        const state = api.state;
        log("resolve start", { vm, state });
        if (!state || !vm) {
            warn("resolve stopped", { hasState: !!state, hasVm: !!vm });
            return null;
        }

        state.vm = vm;
        state.ready = true;
        state.waiting = false;

        if (state.timer) {
            clearInterval(state.timer);
            state.timer = null;
        }

        const callbacks = state.callbacks.splice(0);
        log("resolve callbacks", { count: callbacks.length });
        for (const callback of callbacks) {
            try {
                callback(vm);
            } catch (error) {
                console.error("[TransforkNew][VM] waitForVM callback failed", error);
            }
        }

        log("resolve complete", state);
        return vm;
    }

    function poll() {
        const api = window.TransforkNew.SYSTEM.VM;
        const vm = api.find?.() || null;
        log("poll", { found: !!vm });
        if (!vm) return null;
        return resolve(vm);
    }

    function waitForVM(callback) {
        const api = window.TransforkNew.SYSTEM.VM;
        const state = api.state;
        log("waitForVM start", {
            hasCallback: typeof callback === "function",
            state
        });

        if (!state) {
            warn("waitForVM stopped: state missing");
            return null;
        }

        if (state.ready && state.vm) {
            log("waitForVM ready cache", state.vm);
            if (typeof callback === "function") callback(state.vm);
            return state.vm;
        }

        const vm = api.find?.() || null;
        log("waitForVM immediate find", { found: !!vm, vm });
        if (vm) {
            return resolve(vm);
        }

        if (typeof callback === "function") {
            state.callbacks.push(callback);
            log("waitForVM callback queued", { count: state.callbacks.length });
        }

        if (!state.waiting) {
            state.waiting = true;
            state.timer = setInterval(poll, 250);
            log("waitForVM polling started");
        }

        return null;
    }

    window.TransforkNew.SYSTEM.VM.waitForVM = waitForVM;
    window.TransforkNew.SYSTEM.VM.resolve = resolve;
})();
