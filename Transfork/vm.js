window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const vmModule260705_VM7K2D = {
        getVM() {
            return window.vm || window.Scratch?.vm || null;
        },

        getRenderer() {
            const vm = this.getVM();
            return vm && vm.runtime ? vm.runtime.renderer : null;
        },

        getTargetByDrawableID(drawableID) {
            const vm = this.getVM();
            if (!vm || !vm.runtime || !vm.runtime.targets) return null;

            return vm.runtime.targets.find(
                target =>
                target &&
                !target.isStage &&
                target.drawableID === drawableID
            ) || null;
        },

        setEditingTarget(target) {
            const vm = this.getVM();
            if (!vm || !target || typeof vm.setEditingTarget !== "function") return;
            vm.setEditingTarget(target.id);
        },

        requestRedraw(target) {
            const vm = this.getVM();
            if (!vm || !vm.runtime) return;

            if (target && typeof target.emitVisualChange === "function") {
                target.emitVisualChange();
            }

            if (typeof vm.runtime.requestRedraw === "function") {
                vm.runtime.requestRedraw();
            }
        }
    };

    api.registerModule260705_NS8Q2M("vm", vmModule260705_VM7K2D);
})();
