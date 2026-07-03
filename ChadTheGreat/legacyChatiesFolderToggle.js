window.Chad = window.Chad || {};

(function () {
    "use strict";

    const MODULE_KEY = "legacyFolderToggle";
    const OPEN_KEY = "gandhi_chad_folder_open_agent_v1";
    const runtimeSwitchboard = window.Chad.runtimeSwitchboard;

    runtimeSwitchboard.register({
        key: MODULE_KEY,
        file: "legacyChatiesFolderToggle.js",
        creator: "Manuel",
        purpose: "Legacy Chaties folder toggle runtime patch",
        timestamp: 260703,
        parent: "ChadTheGreat",
        on: false
    });

    function isModuleOn() {
        return runtimeSwitchboard.isOn(MODULE_KEY);
    }

    function activeTabIsChaties() {
        return !!(
            window.Chad &&
            window.Chad.storage &&
            window.Chad.storage.state &&
            window.Chad.storage.state.activeTab === "chaties"
        );
    }

    function getPanelBody() {
        const panel = document.querySelector("#gandhi-chad-panel");
        if (!panel || panel.children.length < 2) return null;
        return panel.children[1];
    }

    function getOpenAgent() {
        return sessionStorage.getItem(OPEN_KEY) || "";
    }

    function setOpenAgent(id) {
        if (id) sessionStorage.setItem(OPEN_KEY, id);
        else sessionStorage.removeItem(OPEN_KEY);
    }

    function resetOpenAgent() {
        setOpenAgent("");
    }

    function findAgentId(card) {
        const scan = card.querySelector("button");
        const text = scan ? scan.textContent.trim() : "";
        const agents = window.Chad && window.Chad.ui && window.Chad.ui.getAgents
            ? window.Chad.ui.getAgents()
            : [];

        const found = agents.find(agent => {
            const label = `${agent.icon || "🤖"} ${agent.name || "Agent"}`.trim();
            return text === label || text.includes(agent.name || "Agent");
        });

        return found ? found.id : text;
    }

    function makeFolderButton(agentId, isOpen) {
        const btn = document.createElement("button");
        btn.textContent = isOpen ? "📂" : "📁";
        btn.title = isOpen ? "Minimize profile" : "Maximize profile";
        btn.dataset.chadFolderToggle = "1";
        Object.assign(btn.style, {
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "4px 6px",
            fontSize: "15px",
            cursor: "pointer",
            lineHeight: "1"
        });

        btn.addEventListener("click", event => {
            if (!isModuleOn()) return;
            event.preventDefault();
            event.stopPropagation();
            setOpenAgent(isOpen ? "" : agentId);
            apply();
        });

        return btn;
    }

    function patchCard(card) {
        if (!card || card.dataset.chadFolderPatched === "1") return;

        const header = card.firstElementChild;
        if (!header) return;

        const firstButton = header.querySelector("button");
        if (!firstButton) return;

        const agentId = findAgentId(card);
        const isOpen = getOpenAgent() === agentId;
        const folder = makeFolderButton(agentId, isOpen);

        header.insertBefore(folder, firstButton);
        card.dataset.chadFolderPatched = "1";
        card.dataset.chadAgentId = agentId;
    }

    function updateCardState(card) {
        const agentId = card.dataset.chadAgentId || findAgentId(card);
        const isOpen = getOpenAgent() === agentId;
        const folder = card.querySelector("button[data-chad-folder-toggle='1']");

        if (folder) {
            folder.textContent = isOpen ? "📂" : "📁";
            folder.title = isOpen ? "Minimize profile" : "Maximize profile";
        }

        Array.from(card.children).forEach((child, index) => {
            if (index < 2) return;
            child.style.display = isOpen ? "" : "none";
        });
    }

    function getAgentCards(body) {
        return Array.from(body.children).filter(child => {
            if (!child || child.id === "gandhi-chad-render-debug") return false;
            const text = child.textContent || "";
            return text.includes("INFO") && !text.includes("Chaties");
        });
    }

    function apply() {
        if (!isModuleOn()) return;

        if (!activeTabIsChaties()) {
            resetOpenAgent();
            return;
        }

        const body = getPanelBody();
        if (!body) return;

        getAgentCards(body).forEach(card => {
            patchCard(card);
            updateCardState(card);
        });
    }

    function patchUiRender() {
        if (!isModuleOn()) return false;

        const ui = window.Chad && window.Chad.ui;
        if (!ui || !ui.render || ui.__legacyFolderTogglePatched) return false;

        const originalRender = ui.render;
        ui.render = function () {
            if (!isModuleOn()) {
                return originalRender.apply(ui, arguments);
            }

            const previousTab = window.Chad.storage && window.Chad.storage.state
                ? window.Chad.storage.state.activeTab
                : "";

            const result = originalRender.apply(ui, arguments);

            const currentTab = window.Chad.storage && window.Chad.storage.state
                ? window.Chad.storage.state.activeTab
                : "";

            if (currentTab !== "chaties" || previousTab !== currentTab) resetOpenAgent();
            if (currentTab === "chaties") setTimeout(apply, 0);

            return result;
        };

        ui.__legacyFolderTogglePatched = true;
        return true;
    }

    function start() {
        patchUiRender();
        apply();
        setInterval(() => {
            if (!isModuleOn()) return;
            patchUiRender();
            apply();
        }, 400);
    }

    window.Chad.legacyChatiesFolderToggle = {
        apply,
        resetOpenAgent
    };

    start();
})();
