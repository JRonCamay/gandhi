window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.TOOLS = window.TransforkNew.TOOLS || {};
window.TransforkNew.MOVE = window.TransforkNew.MOVE || {};
window.TransforkNew.ROTATE = window.TransforkNew.ROTATE || {};
window.TransforkNew.SCALE = window.TransforkNew.SCALE || {};
window.TransforkNew.REFRESH = window.TransforkNew.REFRESH || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.TOOLS.factoryLine.js.visitTools", file: "TransforkNew/TOOLS/factoryLine.js", functionName: "visitTools", purpose: "local process member registration for visitTools", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.TOOLS.factoryLine.js.run", file: "TransforkNew/TOOLS/factoryLine.js", functionName: "run", purpose: "local process member registration for run", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

    const stages = [
        ["01 TOOL STAGE", "begin"],
        ["02 CAPTURE STAGE", "capture"],
        ["03 SIMULATION STAGE", "simulation"],
        ["04 TRANSFORM STAGE", "transform"],
        ["05 COMMIT STAGE", "commit"]
    ];

    const tools = [
        () => window.TransforkNew.MOVE,
        () => window.TransforkNew.ROTATE,
        () => window.TransforkNew.SCALE
    ];

    function visitTools(stageName, methodName, state) {
        for (const getTool of tools) {
            const tool = getTool();
            if (typeof tool?.[methodName] === "function") {
                tool[methodName](state);
            }
        }
    }

    function run(state = {}) {
        const line = window.TransforkNew.TOOLS.line;
        const lineId = state.id || "tools.factoryLine";

        if (!line?.acquireLine?.(lineId)) return false;

        try {
            for (const [stageName, methodName] of stages) {
                state.stage = stageName;
                visitTools(stageName, methodName, state);
            }

            window.TransforkNew.REFRESH.run?.(state);
            return true;
        } finally {
            line.releaseLine?.(lineId);
        }
    }

    window.TransforkNew.TOOLS.factoryLine = {
        stages,
        run
    };
})();
