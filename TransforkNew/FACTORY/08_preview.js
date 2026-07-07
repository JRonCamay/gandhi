window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    function preview(state = {}) {
        state.previewReady = true;
        return state;
    }

    window.TransforkNew.FACTORY.preview = preview;
})();
