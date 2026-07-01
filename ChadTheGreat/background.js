const CHATIES_GROUP_NAME = "Chaties";

function normalizeUrl(url) {
    try {
        const parsed = new URL(url);
        parsed.hash = "";
        return parsed.href;
    }
    catch {
        return String(url || "").split("#")[0];
    }
}

async function ensureChatiesGroup(tabId) {
    const groups = await chrome.tabGroups.query({
        title: CHATIES_GROUP_NAME
    });

    const group = groups && groups[0];

    if (!group) {
        const groupId = await chrome.tabs.group({
            tabIds: [tabId]
        });

        await chrome.tabGroups.update(groupId, {
            title: CHATIES_GROUP_NAME,
            color: "blue"
        });

        return groupId;
    }

    await chrome.tabs.group({
        tabIds: [tabId],
        groupId: group.id
    });

    return group.id;
}

async function openAgentTab(agent) {
    if (!agent || !agent.chatUrl) {
        throw new Error("Missing agent chat URL.");
    }

    const targetUrl = normalizeUrl(agent.chatUrl);
    const tabs = await chrome.tabs.query({});
    const existing = tabs.find(tab =>
        tab.url && normalizeUrl(tab.url) === targetUrl
    );

    if (existing) {
        await ensureChatiesGroup(existing.id);
        await chrome.tabs.update(existing.id, { active: true });
        await chrome.windows.update(existing.windowId, { focused: true });
        return {
            ok: true,
            reused: true,
            tabId: existing.id
        };
    }

    const created = await chrome.tabs.create({
        url: agent.chatUrl,
        active: true
    });

    await ensureChatiesGroup(created.id);

    return {
        ok: true,
        reused: false,
        tabId: created.id
    };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || !message.type) {
        return false;
    }

    if (message.type === "CHAD_OPEN_AGENT_TAB") {
        openAgentTab(message.agent)
            .then(sendResponse)
            .catch(error => sendResponse({
                ok: false,
                error: error.message
            }));

        return true;
    }

    if (message.type === "CHAD_GROUP_CURRENT_TAB") {
        const tabId = sender.tab && sender.tab.id;

        if (!tabId) {
            sendResponse({ ok: false, error: "No sender tab." });
            return false;
        }

        ensureChatiesGroup(tabId)
            .then(groupId => sendResponse({ ok: true, groupId }))
            .catch(error => sendResponse({ ok: false, error: error.message }));

        return true;
    }

    return false;
});
