// ==UserScript==
// @name         Gandhi File Splitter
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Split large source files and generate loader-ready module sets
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
        bundleInput: null,
        baseUrlInput: null,
        files: []
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
            else if (key === "value") node.value = value;
            else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
            else node.setAttribute(key, value);
        });

        children.forEach(child => {
            if (typeof child === "string") node.appendChild(document.createTextNode(child));
            else if (child) node.appendChild(child);
        });

        return node;
    }

    function button260705_BT2H6F(label, fn, alt) {
        return createEl260705_CE8N3W("button", {
            text: label,
            onclick: event => {
                event.preventDefault();
                event.stopPropagation();
                fn();
            },
            style: {
                background: alt ? "#0f766e" : "#2563eb",
                color: "white",
                border: "1px solid " + (alt ? "#115e59" : "#1d4ed8"),
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

    function cleanBase260705(filename) {
        const clean = String(filename || "source.js").trim() || "source.js";
        const dot = clean.lastIndexOf(".");
        return dot > 0 ? clean.slice(0, dot) : clean;
    }

    function cleanExt260705(filename) {
        const clean = String(filename || "source.js").trim() || "source.js";
        const dot = clean.lastIndexOf(".");
        return dot > 0 ? clean.slice(dot) : ".js";
    }

    function makePartName260705_MN9D4V(filename, index) {
        return cleanBase260705(filename) + ".part" + String(index).padStart(2, "0") + cleanExt260705(filename);
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

    function getSplitParts260705() {
        const state = splitterState260705_FS4M9Q;
        const text = state.sourceInput.value;
        const marker = state.markerInput.value.trim();
        const maxLines = Math.max(1, parseInt(state.maxLinesInput.value, 10) || 300);

        return marker
            ? splitByMarkers260705_SM3C7P(text, marker)
            : splitByLines260705_SL5Q8A(text, maxLines);
    }

    function sanitize260705(name) {
        return String(name || "GandhiModuleSet")
            .replace(/[^a-zA-Z0-9_$]/g, "_")
            .replace(/^[^a-zA-Z_$]/, "_$&");
    }

    function normalizeBaseUrl260705(url) {
        const clean = String(url || "").trim();
        if (!clean) return "";
        return clean.endsWith("/") ? clean : clean + "/";
    }

    function makeModulePart260705(bundle, partName, source) {
        const key = sanitize260705(bundle);
        return [
            "window.GandhiModuleSets = window.GandhiModuleSets || {};",
            "window.GandhiModuleSets." + key + " = window.GandhiModuleSets." + key + " || {};",
            "(function (exports) {",
            "    \"use strict\";",
            "    // Source from " + partName,
            source,
            "})(window.GandhiModuleSets." + key + ");"
        ].join("\n");
    }

    function makeModuleLoader260705(bundle, filename, partNames, baseUrl) {
        const key = sanitize260705(bundle);
        const requires = partNames.map(name => "// @require      " + baseUrl + name).join("\n");

        return "// ==UserScript==\n" +
            "// @name         Gandhi Module Set - " + key + "\n" +
            "// @namespace    http://tampermonkey.net/\n" +
            "// @version      0.1\n" +
            "// @description  Loads generated module set " + key + "\n" +
            "// @match        *://www.cocrea.world/*\n" +
            "// @grant        none\n" +
            requires + "\n" +
            "// ==/UserScript==\n\n" +
            "(function () {\n" +
            "    \"use strict\";\n" +
            "    window.GandhiModuleSets = window.GandhiModuleSets || {};\n" +
            "    window.GandhiModuleSets.active = window.GandhiModuleSets." + key + ";\n" +
            "    console.log(\"Gandhi module set loaded: " + key + "\");\n" +
            "})();\n";
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

    function renderFiles260705_RP8S3N() {
        const state = splitterState260705_FS4M9Q;
        const output = state.output;
        output.innerHTML = "";

        if (!state.files.length) {
            output.appendChild(createEl260705_CE8N3W("div", {
                text: "No files yet.",
                style: { color: "#64748b", padding: "8px" }
            }));
            return;
        }

        state.files.forEach(file => {
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
                text: file.name + " — " + file.content.split("\n").length + " lines",
                style: { fontWeight: "800", marginBottom: "6px", color: "#0f172a" }
            }));

            card.appendChild(createEl260705_CE8N3W("div", {
                style: { display: "flex", gap: "6px", marginBottom: "6px" }
            }, [
                button260705_BT2H6F("COPY", () => copyText260705_CP2X7L(file.content)),
                button260705_BT2H6F("DOWNLOAD", () => downloadText260705_DL6F8R(file.name, file.content))
            ]));

            card.appendChild(createEl260705_CE8N3W("textarea", {
                value: file.content,
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

    function setFiles260705(files) {
        splitterState260705_FS4M9Q.files = files;
        renderFiles260705_RP8S3N();
    }

    function runPlainSplit260705_RS5J1M() {
        const filename = splitterState260705_FS4M9Q.filenameInput.value;
        const files = getSplitParts260705().map((part, index) => ({
            name: makePartName260705_MN9D4V(filename, index + 1),
            content: part
        }));

        setFiles260705(files);
    }

    function buildModuleSet260705_MS7K2P() {
        const state = splitterState260705_FS4M9Q;
        const filename = state.filenameInput.value;
        const bundle = state.bundleInput.value || cleanBase260705(filename);
        const baseUrl = normalizeBaseUrl260705(state.baseUrlInput.value);
        const parts = getSplitParts260705();
        const partNames = parts.map((_, index) => makePartName260705_MN9D4V(filename, index + 1));

        const files = [{
            name: cleanBase260705(filename) + ".loader.user.js",
            content: makeModuleLoader260705(bundle, filename, partNames, baseUrl)
        }];

        parts.forEach((part, index) => {
            files.push({
                name: partNames[index],
                content: makeModulePart260705(bundle, partNames[index], part)
            });
        });

        setFiles260705(files);
    }

    function downloadAll260705_DA6Q8X() {
        splitterState260705_FS4M9Q.files.forEach(file => {
            downloadText260705_DL6F8R(file.name, file.content);
        });
    }

    function makeInput260705(value, width, placeholder) {
        return createEl260705_CE8N3W("input", {
            value,
            placeholder: placeholder || "",
            style: {
                width,
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "5px"
            }
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
                width: "620px",
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

        const filenameInput = makeInput260705("source.js", "130px");
        const maxLinesInput = makeInput260705("300", "72px");
        maxLinesInput.type = "number";
        maxLinesInput.min = "1";
        const markerInput = makeInput260705("", "130px", "optional marker");
        const bundleInput = makeInput260705("GandhiModuleSet", "150px", "module set name");
        const baseUrlInput = makeInput260705(
            "https://raw.githubusercontent.com/JRonCamay/gandhi/main/Transfork/",
            "390px",
            "raw GitHub folder URL"
        );
        const output = createEl260705_CE8N3W("div", { style: { marginTop: "8px" } });

        panel.appendChild(createEl260705_CE8N3W("div", {
            style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px"
            }
        }, [
            createEl260705_CE8N3W("div", {
                html: "<b>Gandhi File Splitter</b><br><span style='font-size:12px;color:#64748b'>Plain split or generate loader-ready module set.</span>"
            }),
            button260705_BT2H6F("CLOSE", () => panel.style.display = "none")
        ]));

        panel.appendChild(sourceInput);
        panel.appendChild(createEl260705_CE8N3W("div", {
            style: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "8px" }
        }, [
            createEl260705_CE8N3W("span", { text: "Filename:" }), filenameInput,
            createEl260705_CE8N3W("span", { text: "Lines:" }), maxLinesInput,
            createEl260705_CE8N3W("span", { text: "Marker:" }), markerInput,
            button260705_BT2H6F("SPLIT", runPlainSplit260705_RS5J1M),
            button260705_BT2H6F("DOWNLOAD ALL", downloadAll260705_DA6Q8X)
        ]));

        panel.appendChild(createEl260705_CE8N3W("div", {
            style: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "8px" }
        }, [
            createEl260705_CE8N3W("span", { text: "Set:" }), bundleInput,
            createEl260705_CE8N3W("span", { text: "Base URL:" }), baseUrlInput,
            button260705_BT2H6F("BUILD MODULE SET", buildModuleSet260705_MS7K2P, true)
        ]));

        panel.appendChild(createEl260705_CE8N3W("div", {
            text: "Module set creates one loader plus wrapped part files. Upload all generated files to the Base URL folder, then install only the loader.",
            style: { fontSize: "12px", color: "#475569", marginTop: "6px" }
        }));

        panel.appendChild(output);
        document.body.appendChild(panel);

        state.panel = panel;
        state.sourceInput = sourceInput;
        state.filenameInput = filenameInput;
        state.maxLinesInput = maxLinesInput;
        state.markerInput = markerInput;
        state.bundleInput = bundleInput;
        state.baseUrlInput = baseUrlInput;
        state.output = output;

        renderFiles260705_RP8S3N();
    }

    window.addEventListener("keydown", event => {
        if (!event.ctrlKey || event.key.toLowerCase() !== "m") return;

        event.preventDefault();
        event.stopPropagation();
        createPanel260705_CP9K2D();
    }, true);
})();
