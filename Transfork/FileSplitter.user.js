// ==UserScript==
// @name         Gandhi File Splitter
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Split large source files into copyable/downloadable parts for modular refactoring
// @match        *://chatgpt.com/*
// @match        *://github.com/*
// @match        *://raw.githubusercontent.com/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const splitterState260705_FS4M9Q = {
        panel: null,
        sourceInput: null,
        output: null,
        filenameInput: null,
        maxLinesInput: null,
        markerInput: null,
        parts: []
    };

    function createEl260705_CE8N3W(tag, props, children) {
        const node = document.createElement(tag);
        props = props || {};
        children = children || [];

        Object.keys(props).forEach(key => {
            const value = props[key];
            if (key === "style") Object.assign(node.style, value);
            else if (key === "text") node.textContent = value;
            else if (key === "html") node.innerHTML = value;
            else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
            else node.setAttribute(key, value);
        });

        children.forEach(child => {
            if (typeof child === "string") node.appendChild(document.createTextNode(child));
            else if (child) node.appendChild(child);
        });

        return node;
    }

    function button260705_BT2H6F(label, fn) {
        return createEl260705_CE8N3W("button", {
            text: label,
            onclick: event => {
                event.preventDefault();
                event.stopPropagation();
                fn();
            },
            style: {
                background: "#2563eb",
                color: "white",
                border: "1px solid #1d4ed8",
                borderRadius: "6px",
                padding: "6px 9px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "700"
            }
        });
    }

    function getPageSource260705_GS7B2K() {
        const pre = document.querySelector("pre");
        if (pre && pre.textContent.trim()) return pre.textContent;

        const code = document.querySelector("code");
        if (code && code.textContent.trim()) return code.textContent;

        return "";
    }

    function makePartName260705_MN9D4V(filename, index) {
        const clean = String(filename || "source.js").trim() || "source.js";
        const dot = clean.lastIndexOf(".");
        const base = dot > 0 ? clean.slice(0, dot) : clean;
        const ext = dot > 0 ? clean.slice(dot) : ".txt";
        return base + ".part" + String(index).padStart(2, "0") + ext;
    }

    function splitByLines260705_SL5Q8A(text, maxLines) {
        const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
        const parts = [];

        for (let i = 0; i < lines.length; i += maxLines) {
            parts.push(lines.slice(i, i + maxLines).join("\n"));
        }

        return parts;
    }

    function splitByMarkers260705_SM3C7P(text, marker) {
        if (!marker) return [];

        const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
        const parts = [];
        let current = [];

        lines.forEach(line => {
            if (line.includes(marker) && current.length) {
                parts.push(current.join("\n"));
                current = [];
            }
            current.push(line);
        });

        if (current.length) parts.push(current.join("\n"));
        return parts;
    }

    function downloadText260705_DL6F8R(filename, text) {
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }

    function copyText260705_CP2X7L(text) {
        navigator.clipboard.writeText(text).catch(() => {
            const area = document.createElement("textarea");
            area.value = text;
            document.body.appendChild(area);
            area.select();
            document.execCommand("copy");
            area.remove();
        });
    }

    function renderParts260705_RP8S3N() {
        const state = splitterState260705_FS4M9Q;
        const output = state.output;
        output.innerHTML = "";

        if (!state.parts.length) {
            output.appendChild(createEl260705_CE8N3W("div", {
                text: "No parts yet.",
                style: { color: "#64748b", padding: "8px" }
            }));
            return;
        }

        state.parts.forEach((part, index) => {
            const name = makePartName260705_MN9D4V(state.filenameInput.value, index + 1);
            const card = createEl260705_CE8N3W("div", {
                style: {
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    background: "#f8fafc",
                    padding: "8px",
                    marginBottom: "8px"
                }
            });

            card.appendChild(createEl260705_CE8N3W("div", {
                text: name + " — " + part.split("\n").length + " lines",
                style: { fontWeight: "800", marginBottom: "6px", color: "#0f172a" }
            }));

            card.appendChild(createEl260705_CE8N3W("div", {
                style: { display: "flex", gap: "6px", marginBottom: "6px" }
            }, [
                button260705_BT2H6F("COPY", () => copyText260705_CP2X7L(part)),
                button260705_BT2H6F("DOWNLOAD", () => downloadText260705_DL6F8R(name, part))
            ]));

            card.appendChild(createEl260705_CE8N3W("textarea", {
                value: part,
                readonly: "readonly",
                style: {
                    width: "100%",
                    height: "110px",
                    boxSizing: "border-box",
                    fontFamily: "Consolas, monospace",
                    fontSize: "11px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    padding: "6px",
                    whiteSpace: "pre"
                }
            }));

            output.appendChild(card);
        });
    }

    function runSplit260705_RS5J1M() {
        const state = splitterState260705_FS4M9Q;
        const text = state.sourceInput.value;
        const marker = state.markerInput.value.trim();
        const maxLines = Math.max(1, parseInt(state.maxLinesInput.value, 10) || 300);

        state.parts = marker
            ? splitByMarkers260705_SM3C7P(text, marker)
            : splitByLines260705_SL5Q8A(text, maxLines);

        renderParts260705_RP8S3N();
    }

    function downloadAll260705_DA6Q8X() {
        const state = splitterState260705_FS4M9Q;
        state.parts.forEach((part, index) => {
            downloadText260705_DL6F8R(
                makePartName260705_MN9D4V(state.filenameInput.value, index + 1),
                part
            );
        });
    }

    function createPanel260705_CP9K2D() {
        const state = splitterState260705_FS4M9Q;
        if (state.panel) {
            state.panel.style.display = state.panel.style.display === "none" ? "block" : "none";
            return;
        }

        const panel = createEl260705_CE8N3W("div", {
            style: {
                position: "fixed",
                right: "16px",
                top: "72px",
                width: "520px",
                maxHeight: "calc(100vh - 90px)",
                overflow: "auto",
                zIndex: "999999",
                background: "white",
                border: "1px solid #94a3b8",
                borderRadius: "12px",
                boxShadow: "0 12px 36px rgba(15,23,42,.25)",
                padding: "10px",
                fontFamily: "Arial, sans-serif",
                color: "#0f172a"
            }
        });

        const sourceInput = createEl260705_CE8N3W("textarea", {
            style: {
                width: "100%",
                height: "220px",
                boxSizing: "border-box",
                fontFamily: "Consolas, monospace",
                fontSize: "12px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "8px"
            }
        });
        sourceInput.value = getPageSource260705_GS7B2K();

        const filenameInput = createEl260705_CE8N3W("input", {
            value: "source.js",
            style: {
                width: "130px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "5px"
            }
        });

        const maxLinesInput = createEl260705_CE8N3W("input", {
            type: "number",
            value: "300",
            min: "1",
            style: {
                width: "72px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "5px"
            }
        });

        const markerInput = createEl260705_CE8N3W("input", {
            placeholder: "optional marker",
            style: {
                width: "130px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "5px"
            }
        });

        const output = createEl260705_CE8N3W("div", {
            style: { marginTop: "8px" }
        });

        panel.appendChild(createEl260705_CE8N3W("div", {
            style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px"
            }
        }, [
            createEl260705_CE8N3W("div", {
                html: "<b>Gandhi File Splitter</b><br><span style='font-size:12px;color:#64748b'>Paste source, split, copy/download parts.</span>"
            }),
            button260705_BT2H6F("CLOSE", () => panel.style.display = "none")
        ]));

        panel.appendChild(sourceInput);
        panel.appendChild(createEl260705_CE8N3W("div", {
            style: {
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexWrap: "wrap",
                marginTop: "8px"
            }
        }, [
            createEl260705_CE8N3W("span", { text: "Filename:" }),
            filenameInput,
            createEl260705_CE8N3W("span", { text: "Lines:" }),
            maxLinesInput,
            createEl260705_CE8N3W("span", { text: "Marker:" }),
            markerInput,
            button260705_BT2H6F("SPLIT", runSplit260705_RS5J1M),
            button260705_BT2H6F("DOWNLOAD ALL", downloadAll260705_DA6Q8X)
        ]));
        panel.appendChild(output);

        document.body.appendChild(panel);

        state.panel = panel;
        state.sourceInput = sourceInput;
        state.filenameInput = filenameInput;
        state.maxLinesInput = maxLinesInput;
        state.markerInput = markerInput;
        state.output = output;

        renderParts260705_RP8S3N();
    }

    window.addEventListener("keydown", event => {
        if (!event.ctrlKey || event.key.toLowerCase() !== "m") return;

        event.preventDefault();
        event.stopPropagation();
        createPanel260705_CP9K2D();
    }, true);
})();
