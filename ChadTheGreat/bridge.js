window.Chad = window.Chad || {};

(function () {
    "use strict";

    const bridge = {};

    function hasExtensionRuntime() {
        return Boolean(
            typeof chrome !== "undefined" &&
            chrome.runtime &&
            chrome.runtime.id &&
            typeof chrome.runtime.sendMessage === "function"
        );
    }

    function sendMessage(message) {
        return new Promise((resolve, reject) => {
            if (!hasExtensionRuntime()) {
                reject(new Error("Chad extension runtime is not available."));
                return;
            }

            chrome.runtime.sendMessage(message, response => {
                const error = chrome.runtime.lastError;

                if (error) {
                    reject(new Error(error.message));
                    return;
                }

                if (response && response.ok === false) {
                    reject(new Error(response.error || "Extension command failed."));
                    return;
                }

                resolve(response || { ok: true });
            });
        });
    }

    bridge.isExtension = hasExtensionRuntime;

    bridge.openAgentTab = function (agent) {
        return sendMessage({
            type: "CHAD_OPEN_AGENT_TAB",
            agent
        });
    };

    bridge.groupCurrentTab = function () {
        return sendMessage({
            type: "CHAD_GROUP_CURRENT_TAB"
        });
    };

    window.Chad.bridge = bridge;
})();
