window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.VM = window.TransforkNew.SYSTEM.VM || {};

(function () {
    "use strict";

    function resolve(vm) {
        const api = window.TransforkNew.SYSTEM.VM;
        const state = api.state;
        if (!state || !vm) return null;

        state.vm = vm;
        state.ready = true;
        state.waiting = false;

        if (state.timer) {
            clearInterval(state.timer);
            state.timer = null;
        }

        const callbacks = state.callbacks.splice(0);
        for (const callback of callbacks) {
            try {
                callback(vm);
            } catch (error) {
                console.error("[TransforkNew][VM] waitForVM callback failed", error);
            }
        }

        return vm;
    }

    function poll() {
        const api = window.TransforkNew.SYSTEM.VM;
        const vm = api.find?.() || null;
        if (!vm) return null;
        return resolve(vm);
    }

    function waitForVM(callback) {
        const api = window.TransforkNew.SYSTEM.VM;
        const state = api.state;
        if (!state) return null;

        if (state.ready && state.vm) {
            if (typeof callback === "function") callback(state.vm);
            return state.vm;
        }

        const vm = api.find?.() || null;
        if (vm) {
            return resolve(vm);
        }

        if (typeof callback === "function") {
            state.callbacks.push(callback);
        }

        if (!state.waiting) {
            state.waiting = true;
            state.timer = setInterval(poll, 250);
        }

        return null;
    }

    window.TransforkNew.SYSTEM.VM.waitForVM = waitForVM;
    window.TransforkNew.SYSTEM.VM.resolve = resolve;
})();
