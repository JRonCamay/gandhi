window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const drawableModule260705_DW6K3S = {
        getDrawable(target) {
            const renderer = api.vm && api.vm.getRenderer();
            if (!renderer || !target) return null;
            return renderer._allDrawables[target.drawableID] || null;
        },

        getBounds(target) {
            const drawable = this.getDrawable(target);
            if (!drawable || typeof drawable.getAABB !== "function") return null;
            return drawable.getAABB();
        },

        getScale(target) {
            const drawable = this.getDrawable(target);
            return drawable && drawable.scale ? drawable.scale.slice() : null;
        },

        setScale(target, scale) {
            const drawable = this.getDrawable(target);
            if (!drawable || !scale || typeof drawable.updateScale !== "function") return;
            drawable.updateScale(scale);
        },

        setVisible(target, visible) {
            const vm = api.vm && api.vm.getVM();
            const renderer = api.vm && api.vm.getRenderer();
            if (!vm || !renderer || !target) return;

            if (typeof renderer.updateDrawableVisible === "function") {
                renderer.updateDrawableVisible(target.drawableID, visible);
            }
            else {
                const drawable = this.getDrawable(target);
                if (drawable) drawable._visible = !!visible;
            }

            api.vm.requestRedraw(target);
        },

        isVisible(target) {
            const drawable = this.getDrawable(target);
            return !drawable || drawable._visible !== false;
        }
    };

    api.registerModule260705_NS8Q2M("drawable", drawableModule260705_DW6K3S);
})();
