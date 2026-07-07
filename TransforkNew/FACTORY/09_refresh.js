window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    function refresh(state = {}) {
        window.TransforkNew.REFRESH.state.lastRefresh = state;
        return state;
    }

    window.TransforkNew.FACTORY.refresh = refresh;
})();
