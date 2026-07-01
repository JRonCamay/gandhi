window.Chad = window.Chad || {};

(function () {
    "use strict";

    const bridge = {};
    const originalOpen = window.open.bind(window);
    const RUNTIME_RETRY_MS = 250;
    const RUNTIME_TIMEOUT_MS = 5000;

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

    function waitForRuntime() {
        return new Promise(resolve => {
            const start = Date.now();

            function check() {
                if (hasExtensionRuntime()) {
                    resolve(true);
                    return;
                }

                if (Date.now() - start >= RUNTIME_TIMEOUT_MS) {
                    resolve(false);
                    return;
                }

                setTimeout(check, RUNTIME_RETRY_MS);
            }

            check();
        });
    }

    function openFallback(agent) {
        const url = agent && agent.chatUrl
            ? agent.chatUrl
            : "https://chatgpt.com/";
        const target = agent && agent.id
            ? "chad_agent_" + agent.id
            : "_blank";

        originalOpen(url, target);
        return { ok: true, fallback: true };
    }

    bridge.isExtension = hasExtensionRuntime;

    bridge.openAgentTab = async function (agent) {
        const ready = await waitForRuntime();
        if (!ready) return openFallback(agent);

        try {
            return await sendMessage({ type: "CHAD_OPEN_AGENT_TAB", agent });
        }
        catch {
            return openFallback(agent);
        }
    };

    bridge.groupCurrentTab = function () {
        return sendMessage({ type: "CHAD_GROUP_CURRENT_TAB" });
    };

    bridge.doneTabFeedback = function () {
        return sendMessage({ type: "CHAD_DONE_TAB_FEEDBACK" });
    };

    bridge.resetTabFeedback = function () {
        return sendMessage({ type: "CHAD_RESET_TAB_FEEDBACK" });
    };

    function patchWindowOpen() {
        if (window.__ChadBridgeWindowOpenPatched) return;
        window.__ChadBridgeWindowOpenPatched = true;

        window.open = function (url, target, features) {
            const isAgentOpen = String(target || "").startsWith("chad_agent_");
            if (isAgentOpen) {
                bridge.openAgentTab({ id: String(target || "").replace(/^chad_agent_/, ""), chatUrl: String(url || "") });
                return null;
            }
            return originalOpen(url, target, features);
        };
    }

    window.Chad.bridge = bridge;
    patchWindowOpen();
})();
