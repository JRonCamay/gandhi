window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/FACTORY/06_boundingBox.js";
    const LINE = "MAIN";
    const STATION = 6;
    const ID = "FACTORY.06.boundingBox";
    const PURPOSE = "main factory refresh bounding box";

    window.TransforkNew.FACTORY.MANAGER?.register?.({ id: ID, file: FILE, functionName: "boundingBox", purpose: PURPOSE, line: LINE, station: STATION });

    function boundingBox(state = {}) {
        if (!window.TransforkNew.FACTORY.MANAGER?.guard?.(LINE, STATION, FILE, "boundingBox")) return { status: "stop", reason: "guardian blocked", station: STATION };
        try {
            const box = window.TransforkNew.UI?.elements?.boundingBox;
            window.TransforkNew.SYSTEM?.debug?.log?.("FACTORY station boundingBox before", {
                box,
                hasInit: typeof box?.init === "function",
                refreshApi: window.TransforkNew.UI?.elements?.BOUNDINGBOX
            });
            box?.init?.();
            const result = window.TransforkNew.UI?.elements?.BOUNDINGBOX?.refresh?.(box);
            state.box = box || null;
            state.boxRefreshResult = result || null;
            window.TransforkNew.SYSTEM?.debug?.log?.("FACTORY station boundingBox after", {
                box: state.box,
                result,
                visible: box?.visible,
                display: box?.node?.style?.display
            });
            if (!box?.visible) return { status: "stop", reason: "box not visible", station: STATION };
            return { status: "done", station: STATION };
        } catch (error) {
            window.TransforkNew.SYSTEM?.debug?.error?.(FILE + " boundingBox", error);
            return { status: "stop", reason: "boundingBox crashed", station: STATION, error };
        }
    }

    window.TransforkNew.FACTORY.boundingBox = boundingBox;
})();
