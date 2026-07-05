// ==UserScript==
// @name         Gandhi File Splitter
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  Split large source files and generate loader-ready module sets
// @match        *://chatgpt.com/*
// @match        *://github.com/*
// @match        *://raw.githubusercontent.com/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const DEFAULT_RAW_ROOT_260705 =
    "https://raw.githubusercontent.com/JRonCamay/gandhi/main/";

    const splitterState260705_FS4M9Q = {
        panel: null,
        sourceInput: null,
        output: null,
        fileDirInput: null,
        filenameInput: null,
        outputFolderInput: null,
        maxLinesInput: null,
        markerInput: null,
        files: [],
        status: null
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

    function setStatus260705_ST6P4D(text, danger) {
        const state = splitterState260705_FS4M9Q;
        if (!state.status) return;
        state.status.textContent = text || "";
        state.status.style.color = danger ? "#b91c1c" : "#475569";
    }

    function getPageSource260705_GS7B2K() {
        const pre = document.querySelector("pre");
        if (pre && pre.textContent.trim()) return pre.textContent;

        const code = document.querySelector("code");
        if (code && code.textContent.trim()) return code.textContent;

        return "";
    }

    function cleanBase260705_CB7K2N(filename) {
        const clean = String(filename || "source.js").trim() || "source.js";
        const slash = Math.max(clean.lastIndexOf("/"), clean.lastIndexOf("\\"));
        const onlyName = slash >= 0 ? clean.slice(slash + 1) : clean;
        const dot = onlyName.lastIndexOf(".");
        return dot > 0 ? onlyName.slice(0, dot) : onlyName;
    }

    function cleanExt260705_CX8M1Q(filename) {
        const clean = String(filename || "source.js").trim() || "source.js";
        const dot = clean.lastIndexOf(".");
        return dot > 0 ? clean.slice(dot) : ".js";
    }

    function cleanFileName260705_FN2S8D(filename) {
        const clean = String(filename || "source.js").trim() || "source.js";
        const slash = Math.max(clean.lastIndexOf("/"), clean.lastIndexOf("\\"));
        return slash >= 0 ? clean.slice(slash + 1) : clean;
    }

    function safePath260705_SP4J7L(value) {
        return String(value || "")
            .trim()
            .replace(/^\/+/, "")
            .replace(/\/+$/, "")
            .replace(/\\/g, "/")
            .replace(/[^a-zA-Z0-9_\-/.]/g, "_");
    }

    function safeFolder260705_SF5H8X(value, filename) {
        const fallback = cleanBase260705_CB7K2N(filename);
        return safePath260705_SP4J7L(value || fallback);
    }

    function normalizeDir260705_ND9R2C(dir) {
        const clean = String(dir || "").trim();
        if (!clean) return DEFAULT_RAW_ROOT_260705;
        if (/^https?:\/\//i.test(clean)) return clean.endsWith("/") ? clean : clean + "/";
        return DEFAULT_RAW_ROOT_260705 + safePath260705_SP4J7L(clean) + "/";
    }

    function makeFileRawUrl260705_FR6Q1B(dir, filename) {
        return normalizeDir260705_ND9R2C(dir) + cleanFileName260705_FN2S8D(filename);
    }

    function makeOutputBaseUrl260705_OB3M5R(dir, folder, filename) {
        return normalizeDir260705_ND9R2C(dir) + safeFolder260705_SF5H8X(folder, filename) + "/";
    }

    function makePartName260705_MN9D4V(filename, index) {
        return cleanBase260705_CB7K2N(filename) + ".part" + String(index).padStart(2, "0") + cleanExt260705_CX8M1Q(filename);
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

    function getSplitParts260705_GP8H3M(source) {
        const state = splitterState260705_FS4M9Q;
        const marker = state.markerInput.value.trim();
        const maxLines = Math.max(1, parseInt(state.maxLinesInput.value, 10) || 300);

        return marker
            ? splitByMarkers260705_SM3C7P(source, marker)
            : splitByLines260705_SL5Q8A(source, maxLines);
    }

    function sanitize260705_SN2K9V(name) {
        return String(name || "GandhiModuleSet")
            .replace(/[^a-zA-Z0-9_$]/g, "_")
            .replace(/^[^a-zA-Z_$]/, "_$&");
    }

    function makeModulePart260705_MP6F4A(bundle, partName, source) {
        const key = sanitize260705_SN2K9V(bundle);
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

    function makeModuleLoader260705_ML7C3S(bundle, partNames, baseUrl) {
        const key = sanitize260705_SN2K9V(bundle);
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

    function makeUploadPlan260705_UP4L8D(fileDir, folder, fileUrl, baseUrl, files, sourceMode) {
        return [
            "# Gandhi File Splitter Upload Plan",
            "",
            "Source mode:",
            sourceMode,
            "",
            "File GitHub Dir:",
            fileDir || "(default Gandhi raw root)",
            "",
            "Fetched file URL:",
            fileUrl || "(not used; pasted source was prioritized)",
            "",
            "Upload folder:",
            folder,
            "",
            "Generated raw base URL:",
            baseUrl,
            "",
            "Upload these generated files into that folder:",
            ...files.map(file => "- " + file.name),
            "",
            "Download All only downloads files locally. It does not upload to GitHub.",
            "Install only the generated .loader.user.js in Tampermonkey after uploading the generated files."
        ].join("\n");
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
                text: "No generated files yet. Click SPLIT / BUILD LOCAL FILES.",
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
                button260705_BT2H6F("DOWNLOAD LOCAL", () => downloadText260705_DL6F8R(file.name, file.content))
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

    function setFiles260705_SF7P2N(files) {
        splitterState260705_FS4M9Q.files = files;
        renderFiles260705_RP8S3N();
    }

    async function getSourceForSplit260705_GS3V8J() {
        const state = splitterState260705_FS4M9Q;
        const pasted = state.sourceInput.value.trim();
        const filename = state.filenameInput.value.trim();
        const fileDir = state.fileDirInput.value.trim();

        if (pasted) {
            return {
                source: state.sourceInput.value,
                sourceMode: "Pasted source prioritized",
                fileUrl: ""
            };
        }

        if (!filename) throw new Error("Filename is required when pasted source is empty.");

        const fileUrl = makeFileRawUrl260705_FR6Q1B(fileDir, filename);
        setStatus260705_ST6P4D("Fetching source file from GitHub...");
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Could not fetch file: " + response.status + " " + fileUrl);

        return {
            source: await response.text(),
            sourceMode: "Fetched from filename because pasted source was empty",
            fileUrl
        };
    }

    async function buildModuleSet260705_MS7K2P() {
        const state = splitterState260705_FS4M9Q;

        try {
            const filename = state.filenameInput.value.trim() || "source.js";
            const fileDir = state.fileDirInput.value.trim();
            const folder = safeFolder260705_SF5H8X(state.outputFolderInput.value, filename);
            const bundle = cleanBase260705_CB7K2N(filename);
            const baseUrl = makeOutputBaseUrl260705_OB3M5R(fileDir, folder, filename);
            const sourceResult = await getSourceForSplit260705_GS3V8J();
            const parts = getSplitParts260705_GP8H3M(sourceResult.source);
            const partNames = parts.map((_, index) => makePartName260705_MN9D4V(filename, index + 1));

            const files = [{
                name: cleanBase260705_CB7K2N(filename) + ".loader.user.js",
                content: makeModuleLoader260705_ML7C3S(bundle, partNames, baseUrl)
            }];

            parts.forEach((part, index) => {
                files.push({
                    name: partNames[index],
                    content: makeModulePart260705_MP6F4A(bundle, partNames[index], part)
                });
            });

            files.push({
                name: "UPLOAD_PLAN.md",
                content: makeUploadPlan260705_UP4L8D(
                    fileDir,
                    folder,
                    sourceResult.fileUrl,
                    baseUrl,
                    files,
                    sourceResult.sourceMode
                )
            });

            setFiles260705_SF7P2N(files);
            setStatus260705_ST6P4D("Generated working module set. DOWNLOAD ALL LOCAL saves files to your computer only.");
        }
        catch (error) {
            setStatus260705_ST6P4D(error.message || String(error), true);
        }
    }

    function downloadAll260705_DA6Q8X() {
        const files = splitterState260705_FS4M9Q.files;
        if (!files.length) {
            setStatus260705_ST6P4D("Nothing to download yet. Split/build first.", true);
            return;
        }

        files.forEach(file => downloadText260705_DL6F8R(file.name, file.content));
        setStatus260705_ST6P4D("Downloaded generated files locally. Upload them to GitHub manually using UPLOAD_PLAN.md.");
    }

    function makeInput260705_MI5N8A(value, width, placeholder) {
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

    function label260705_LB7M2Q(text) {
        return createEl260705_CE8N3W("span", {
            text,
            style: { fontWeight: "700", color: "#334155" }
        });
    }

    function sectionTitle260705_ST9H3F(title, note) {
        return createEl260705_CE8N3W("div", {
            html: "<b>" + title + "</b><br><span style='font-size:12px;color:#64748b'>" + note + "</span>",
            style: { marginTop: "10px", marginBottom: "5px" }
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
                width: "700px",
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
            placeholder: "Optional. Paste source here. If this has content, it is used first.",
            style: {
                width: "100%",
                height: "190px",
                boxSizing: "border-box",
                fontFamily: "Consolas, monospace",
                fontSize: "12px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "8px"
            }
        });
        sourceInput.value = getPageSource260705_GS7B2K();

        const fileDirInput = makeInput260705_MI5N8A("", "430px", "example: Composer/ or full raw GitHub dir URL");
        const filenameInput = makeInput260705_MI5N8A("source.js", "170px", "file to split");
        const outputFolderInput = makeInput260705_MI5N8A("", "190px", "blank = filename subfolder");
        const maxLinesInput = makeInput260705_MI5N8A("300", "72px");
        maxLinesInput.type = "number";
        maxLinesInput.min = "1";
        const markerInput = makeInput260705_MI5N8A("", "150px", "optional marker");
        const status = createEl260705_CE8N3W("div", {
            text: "Download All Local saves generated files to your computer. It does not upload to GitHub.",
            style: { fontSize: "12px", color: "#475569", marginTop: "7px" }
        });
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
                html: "<b>Gandhi File Splitter</b><br><span style='font-size:12px;color:#64748b'>Split pasted source or fetch by filename, then generate a loader-ready module set.</span>"
            }),
            button260705_BT2H6F("CLOSE", () => panel.style.display = "none")
        ]));

        panel.appendChild(sectionTitle260705_ST9H3F("1. Optional pasted source", "Pasted source is always prioritized over fetching by filename."));
        panel.appendChild(sourceInput);

        panel.appendChild(sectionTitle260705_ST9H3F("2. Source file location", "Used only when pasted source is empty."));
        panel.appendChild(createEl260705_CE8N3W("div", {
            style: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }
        }, [
            label260705_LB7M2Q("File GitHub Dir:"), fileDirInput,
            label260705_LB7M2Q("Filename:"), filenameInput
        ]));

        panel.appendChild(sectionTitle260705_ST9H3F("3. Output", "Folder blank creates a subfolder using the filename. Download is local only."));
        panel.appendChild(createEl260705_CE8N3W("div", {
            style: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }
        }, [
            label260705_LB7M2Q("Folder:"), outputFolderInput,
            label260705_LB7M2Q("Lines:"), maxLinesInput,
            label260705_LB7M2Q("Marker:"), markerInput,
            button260705_BT2H6F("SPLIT / BUILD LOCAL FILES", buildModuleSet260705_MS7K2P, true),
            button260705_BT2H6F("DOWNLOAD ALL LOCAL", downloadAll260705_DA6Q8X)
        ]));

        panel.appendChild(createEl260705_CE8N3W("div", {
            text: "After download, upload all generated files to the GitHub folder shown in UPLOAD_PLAN.md. Install only the generated loader in Tampermonkey.",
            style: { fontSize: "12px", color: "#475569", marginTop: "6px" }
        }));

        panel.appendChild(status);
        panel.appendChild(output);
        document.body.appendChild(panel);

        state.panel = panel;
        state.sourceInput = sourceInput;
        state.fileDirInput = fileDirInput;
        state.filenameInput = filenameInput;
        state.outputFolderInput = outputFolderInput;
        state.maxLinesInput = maxLinesInput;
        state.markerInput = markerInput;
        state.status = status;
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
