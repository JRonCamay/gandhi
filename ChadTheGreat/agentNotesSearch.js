window.Chad = window.Chad || {};

(function () {
    "use strict";

    const MODULE_KEY = "agentNotesSearch";
    const runtimeSwitchboard = window.Chad.runtimeSwitchboard;

    runtimeSwitchboard.register({
        key: MODULE_KEY,
        file: "agentNotesSearch.js",
        creator: "Brenda",
        purpose: "Adds NOTES button under agent profile with multiline notes search popup",
        timestamp: 260704,
        parent: "ChadTheGreat",
        on: true
    });

    function isModuleOn() {
        return runtimeSwitchboard.isOn(MODULE_KEY);
    }

    function createEl(tag, props, children) {
        if (window.Chad.ui && window.Chad.ui.createEl) {
            return window.Chad.ui.createEl(tag, props || {}, children || []);
        }

        const node = document.createElement(tag);
        for (const key in props || {}) {
            if (key === "style") Object.assign(node.style, props[key]);
            else if (key === "text") node.textContent = props[key];
            else if (key === "html") node.innerHTML = props[key];
            else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), props[key]);
            else node.setAttribute(key, props[key]);
        }
        (children || []).forEach(child => child && node.appendChild(child));
        return node;
    }

    function escapeHTML(text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function button(label, fn, extra) {
        const btn = createEl("button", {
            text: label,
            title: extra && extra.title ? extra.title : "",
            style: {
                background: extra && extra.bg ? extra.bg : "#f8fafc",
                color: extra && extra.color ? extra.color : "#0f172a",
                border: "1px solid " + (extra && extra.border ? extra.border : "#cbd5e1"),
                borderRadius: "6px",
                padding: extra && extra.padding ? extra.padding : "4px 7px",
                fontSize: extra && extra.fontSize ? extra.fontSize : "11px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontWeight: extra && extra.bold ? "700" : "500",
                lineHeight: "1.1"
            }
        });

        btn.addEventListener("click", event => {
            if (!isModuleOn()) return;
            event.preventDefault();
            event.stopPropagation();
            fn(event);
        });

        return btn;
    }

    function readJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        }
        catch {
            return fallback;
        }
    }

    function textFrom(value) {
        if (value === null || value === undefined) return "";
        if (typeof value === "string") return value;
        try { return JSON.stringify(value, null, 2); }
        catch { return String(value); }
    }

    function getAgentByName(name) {
        const identity = window.Chad.agentIdentity;
        if (!identity || !identity.getAgents) return null;
        const cleanName = String(name || "").trim().toLowerCase();
        return identity.getAgents().find(agent => String(agent.name || "").trim().toLowerCase() === cleanName) || null;
    }

    function collectNotes(agent) {
        const notes = [];

        function add(source, title, value) {
            const text = textFrom(value).trim();
            if (!text) return;
            notes.push({ source, title, text });
        }

        if (agent) {
            add("agent", "Agent name", agent.name || "");
            add("agent", "Agent description", agent.description || "");
            add("agent", "Agent tab title", agent.tabTitle || "");
            add("agent", "Agent files", agent.files || []);
        }

        add("shared", "Shared notes", localStorage.getItem("gandhi_chad_shared_notes_v1") || "");
        add("chat", "Chad chat messages", readJSON("gandhi_chad_chat_messages_v1", []));

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i) || "";
            const lower = key.toLowerCase();
            if (
                lower.includes("note") ||
                lower.includes("notes") ||
                lower.includes("buddy") ||
                lower.includes("buddies") ||
                lower.includes("agent")
            ) {
                add("localStorage", key, localStorage.getItem(key));
            }
        }

        return notes;
    }

    function searchNotes(agent, query) {
        const terms = String(query || "")
            .toLowerCase()
            .split(/\s+/)
            .map(term => term.trim())
            .filter(Boolean);

        const notes = collectNotes(agent);
        if (!terms.length) return notes.slice(0, 30);

        return notes.filter(note => {
            const haystack = `${note.source}\n${note.title}\n${note.text}`.toLowerCase();
            return terms.every(term => haystack.includes(term));
        }).slice(0, 30);
    }

    function renderResults(results, container) {
        container.innerHTML = "";

        if (!results.length) {
            container.appendChild(createEl("div", {
                text: "No matching notes found.",
                style: { color: "#64748b", padding: "8px" }
            }));
            return;
        }

        results.forEach(result => {
            container.appendChild(createEl("div", {
                style: {
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "7px",
                    marginTop: "6px",
                    background: "#f8fafc"
                }
            }, [
                createEl("div", {
                    html: `<b>${escapeHTML(result.title)}</b><br><span style="color:#64748b">${escapeHTML(result.source)}</span>`,
                    style: { fontSize: "11px", lineHeight: "1.35", marginBottom: "5px" }
                }),
                createEl("pre", {
                    text: result.text.length > 900 ? result.text.slice(0, 900) + "\n..." : result.text,
                    style: {
                        whiteSpace: "pre-wrap",
                        margin: "0",
                        fontFamily: "Consolas, monospace",
                        fontSize: "11px",
                        lineHeight: "1.35",
                        color: "#334155",
                        maxHeight: "160px",
                        overflowY: "auto"
                    }
                })
            ]));
        });
    }

    function openNotesSearch(agent) {
        const bg = createEl("div", {
            style: {
                position: "fixed",
                inset: "0",
                background: "rgba(15,23,42,.35)",
                zIndex: "1000005",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: "55px"
            }
        });

        const results = createEl("div", {
            style: {
                marginTop: "8px",
                maxHeight: "300px",
                overflowY: "auto",
                borderTop: "1px solid #e2e8f0",
                paddingTop: "6px"
            }
        });

        const textarea = createEl("textarea", {
            placeholder: "Search notes...\nYou can type multiple lines here.",
            style: {
                width: "100%",
                height: "120px",
                resize: "vertical",
                boxSizing: "border-box",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "8px",
                fontFamily: "Consolas, monospace",
                fontSize: "12px",
                lineHeight: "1.35",
                outline: "none"
            }
        });

        const modal = createEl("div", {
            style: {
                width: "460px",
                maxWidth: "94vw",
                background: "#ffffff",
                color: "#111827",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                boxShadow: "0 12px 40px rgba(15,23,42,.25)",
                overflow: "hidden"
            }
        }, [
            createEl("div", {
                html: `<b>Search Notes</b><br><span style="color:#64748b">${escapeHTML(agent ? (agent.icon || "🤖") + " " + (agent.name || "Agent") : "Agent")}</span>`,
                style: { padding: "10px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", lineHeight: "1.35" }
            }),
            createEl("div", { style: { padding: "10px" } }, [
                textarea,
                createEl("div", { style: { display: "flex", justifyContent: "flex-end", gap: "6px", marginTop: "8px" } }, [
                    button("CANCEL", () => bg.remove(), { bg: "#f8fafc", border: "#cbd5e1" }),
                    button("SEARCH", () => renderResults(searchNotes(agent, textarea.value), results), { bg: "#2563eb", border: "#2563eb", color: "#ffffff", bold: true })
                ]),
                results
            ])
        ]);

        bg.appendChild(modal);
        document.body.appendChild(bg);
        setTimeout(() => textarea.focus(), 0);
    }

    function findAgentCardFromButton(btn) {
        let node = btn;
        for (let i = 0; i < 8 && node; i++) {
            if (node.textContent && node.textContent.includes("USE THIS CHAT") && node.textContent.includes("DELETE AGENT")) return node;
            node = node.parentElement;
        }
        return null;
    }

    function findAgentFromCard(card) {
        const nameButton = Array.from(card.querySelectorAll("button")).find(btn => {
            const text = (btn.textContent || "").trim();
            return text && !["▾", "▸", "INFO", "NOTES", "SCAN FILES", "USE THIS CHAT", "COPY LINK", "DELETE AGENT"].includes(text);
        });
        return getAgentByName(nameButton ? nameButton.textContent : "");
    }

    function injectNotesButtons() {
        if (!isModuleOn()) return;

        const panel = document.querySelector("#gandhi-chad-panel");
        const state = window.Chad.storage && window.Chad.storage.state;
        if (!panel || !state || state.activeTab !== "chaties") return;

        Array.from(panel.querySelectorAll("button")).forEach(btn => {
            if ((btn.textContent || "").trim() !== "DELETE AGENT") return;
            const row = btn.parentElement;
            if (!row || row.querySelector("button[data-chad-agent-notes='1']")) return;

            const card = findAgentCardFromButton(btn);
            const agent = card ? findAgentFromCard(card) : null;
            const notesBtn = button("NOTES", () => openNotesSearch(agent), { bg: "#ede9fe", border: "#c4b5fd", bold: true });
            notesBtn.dataset.chadAgentNotes = "1";
            row.insertBefore(notesBtn, btn);
        });
    }

    function patchUiChaties() {
        const uiChaties = window.Chad.uiChaties;
        if (!uiChaties || !uiChaties.renderIntoPanel || uiChaties.__agentNotesSearchPatched) return false;

        const originalRenderIntoPanel = uiChaties.renderIntoPanel;
        uiChaties.renderIntoPanel = function () {
            const result = originalRenderIntoPanel.apply(uiChaties, arguments);
            injectNotesButtons();
            return result;
        };

        uiChaties.__agentNotesSearchPatched = true;
        return true;
    }

    function start() {
        patchUiChaties();
        injectNotesButtons();
        setInterval(() => {
            if (!isModuleOn()) return;
            patchUiChaties();
            injectNotesButtons();
        }, 700);
    }

    window.Chad.agentNotesSearch = {
        openNotesSearch,
        searchNotes,
        collectNotes,
        injectNotesButtons
    };

    start();
})();