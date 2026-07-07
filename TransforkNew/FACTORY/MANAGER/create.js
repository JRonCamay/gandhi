window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};
window.TransforkNew.FACTORY.MANAGER = window.TransforkNew.FACTORY.MANAGER || {};

(function () {
    "use strict";

    function create(lineId, options = {}) {
        const state = window.TransforkNew.FACTORY.MANAGER.state;
        if (!state.lines[lineId]) {
            state.lines[lineId] = {
                id: lineId,
                currStation: options.currStation || 0,
                maxStation: options.maxStation || 0,
                stations: {},
                completed: {},
                queue: []
            };
        }
        return state.lines[lineId];
    }

    window.TransforkNew.FACTORY.MANAGER.create = create;
})();
