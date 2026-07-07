window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.REFRESH = window.TransforkNew.REFRESH || {};

(function () {
    "use strict";

    function run(state = {}) {
        window.TransforkNew.REFRESH.boundingBox?.(state);
        window.TransforkNew.REFRESH.buttons?.(state);
        window.TransforkNew.REFRESH.overlay?.(state);
    }

    window.TransforkNew.REFRESH.run = run;
})();
