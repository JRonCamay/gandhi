window.Chad = window.Chad || {};

(function () {
    "use strict";

    const paint = {};

    let win = null;
    let canvas = null;
    let ctx = null;
    let viewport = null;
    let canvasWrap = null;
    let selectionBox = null;

    let activeTool = "brush";
    let activeColor = "#ef4444";
    let brushSize = 8;
    let textSize = 24;
    let textFont = "Arial";
    let zoom = 1;
    let panX = 30;
    let panY = 30;

    let isDown = false;
    let lastPoint = null;
    let startPoint = null;
    let selection = null;
    let panStart = null;
    let history = [];
    let historyIndex = -1;
    let initialized = false;

    const COLORS = [
        "#000000", "#ffffff", "#ef4444", "#f97316",
        "#facc15", "#22c55e", "#3b82f6", "#8b5cf6",
        "#ec4899", "#14b8a6", "#64748b", "#92400e",
        "#7f1d1d", "#14532d", "#1e3a8a", "#4c1d95",
        "#f8fafc", "#e2e8f0", "#94a3b8", "#334155",
        "#fee2e2", "#ffedd5", "#fef9c3", "#dcfce7",
        "#dbeafe", "#ede9fe", "#fce7f3", "#ccfbf1"
    ];

    function el(tag, props = {}, children = []) {
        const node = document.createElement(tag);

        for (const [key, value] of Object.entries(props)) {
            if (key === "style") Object.assign(node.style, value);
            else if (key === "text") node.textContent = value;
            else if (key === "html") node.innerHTML = value;
            else if (key.startsWith("on")) {
                node.addEventListener(key.slice(2).toLowerCase(), value);
            }
            else node.setAttribute(key, value);
        }

        for (const child of children) {
            if (typeof child === "string") node.appendChild(document.createTextNode(child));
            else if (child) node.appendChild(child);
        }

        return node;
    }

    function centerDialog(options) {
        const overlay = el("div", {
            style: {
                position: "fixed",
                inset: "0",
                background: "rgba(15,23,42,.35)",
                zIndex: "1000008",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Arial, sans-serif"
            }
        });

        const card = el("div", {
            style: {
                width: "360px",
                maxWidth: "calc(100vw - 40px)",
                background: "#ffffff",
                border: "1px solid #334155",
                borderRadius: "14px",
                boxShadow: "0 18px 60px rgba(15,23,42,.35)",
                padding: "14px",
                color: "#0f172a"
            }
        });

        const title = el("div", {
            text: options.title || "Chad",
            style: {
                fontSize: "15px",
                fontWeight: "900",
                marginBottom: "8px"
            }
        });

        const message = el("div", {
            text: options.message || "",
            style: {
                color: "#475569",
                fontSize: "13px",
                lineHeight: "1.4",
                marginBottom: "10px",
                whiteSpace: "pre-wrap"
            }
        });

        let input = null;

        if (options.input) {
            input = el("input", {
                value: options.value || "",
                style: {
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1px solid #cbd5e1",
                    borderRadius: "9px",
                    padding: "8px",
                    fontSize: "13px",
                    marginBottom: "10px"
                }
            });
        }

        const actions = el("div", {
            style: {
                display: "flex",
                justifyContent: "flex-end",
                gap: "6px"
            }
        });

        function finish(value) {
            overlay.remove();
            if (options.onDone) options.onDone(value);
        }

        const cancel = el("button", {
            text: options.cancelText || "Cancel",
            style: dialogButtonStyle("#f8fafc", "#cbd5e1"),
            onclick: () => finish(null)
        });

        const ok = el("button", {
            text: options.okText || "OK",
            style: dialogButtonStyle("#2563eb", "#2563eb", "#ffffff"),
            onclick: () => finish(input ? input.value : true)
        });

        if (options.type !== "info") actions.appendChild(cancel);
        actions.appendChild(ok);

        card.appendChild(title);
        card.appendChild(message);
        if (input) card.appendChild(input);
        card.appendChild(actions);
        overlay.appendChild(card);
        document.body.appendChild(overlay);

        if (input) {
            input.focus();
            input.select();
            input.addEventListener("keydown", event => {
                if (event.key === "Enter") finish(input.value);
                if (event.key === "Escape") finish(null);
            });
        }
    }

    function dialogButtonStyle(bg, border, color = "#0f172a") {
        return {
            background: bg,
            color,
            border: "1px solid " + border,
            borderRadius: "8px",
            padding: "7px 10px",
            fontSize: "12px",
            fontWeight: "800",
            cursor: "pointer"
        };
    }

    function notify(message) {
        centerDialog({ type: "info", title: "Quick Sketch", message, okText: "OK" });
    }

    function askText(title, value, done) {
        centerDialog({
            title,
            message: "Type the text below.",
            input: true,
            value: value || "",
            okText: "Add",
            onDone: done
        });
    }

    function confirmChad(message, done) {
        centerDialog({
            title: "Confirm",
            message,
            okText: "Yes",
            cancelText: "No",
            onDone: value => done(Boolean(value))
        });
    }

    function topButton(label, title, fn, extra = {}) {
        return el("button", {
            text: label,
            title,
            style: {
                background: extra.bg || "#f8fafc",
                color: extra.color || "#0f172a",
                border: "1px solid " + (extra.border || "#cbd5e1"),
                borderRadius: "8px",
                padding: "7px 10px",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer",
                whiteSpace: "nowrap"
            },
            onclick: event => {
                event.preventDefault();
                event.stopPropagation();
                fn();
            }
        });
    }

    function setTool(id) {
        activeTool = id;
        updateToolButtons();
        updateStatus();
        updateCursor();
    }

    function toolButton(id, icon, label) {
        return el("button", {
            class: "gandhi-chad-paint-tool",
            "data-tool": id,
            html:
                `<div style=\"font-size:20px;line-height:1\">${icon}</div>` +
                `<div style=\"font-size:10px;margin-top:3px\">${label}</div>`,
            title: label,
            style: toolButtonStyle(activeTool === id),
            onclick: event => {
                event.preventDefault();
                event.stopPropagation();
                setTool(id);
            }
        });
    }

    function toolButtonStyle(selected) {
        return {
            width: "70px",
            minHeight: "54px",
            border: "1px solid " + (selected ? "#2563eb" : "#cbd5e1"),
            borderRadius: "9px",
            background: selected ? "#eff6ff" : "#ffffff",
            color: "#0f172a",
            cursor: "pointer",
            fontWeight: selected ? "800" : "600"
        };
    }

    function updateToolButtons() {
        document.querySelectorAll(".gandhi-chad-paint-tool").forEach(button => {
            Object.assign(button.style, toolButtonStyle(button.dataset.tool === activeTool));
        });
    }

    function updateStatus() {
        const status = document.querySelector("#gandhi-chad-paint-status");
        if (status) status.textContent = `Tool: ${activeTool} · Color: ${activeColor}`;
    }

    function updateCursor() {
        if (!canvasWrap) return;
        canvasWrap.style.cursor = activeTool === "pan" ? "grab" : activeTool === "zoom" ? "zoom-in" : "crosshair";
    }

    function clearSelection() {
        selection = null;
        if (selectionBox) selectionBox.style.display = "none";
    }

    function saveHistory() {
        if (!canvas) return;
        history = history.slice(0, historyIndex + 1);
        history.push(canvas.toDataURL("image/png"));
        if (history.length > 40) history.shift();
        historyIndex = history.length - 1;
    }

    function restoreHistory(index) {
        if (!canvas || index < 0 || index >= history.length) return;
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = history[index];
        historyIndex = index;
    }

    function undo() { restoreHistory(historyIndex - 1); }
    function redo() { restoreHistory(historyIndex + 1); }

    function initCanvasOnce() {
        canvas = document.querySelector("#gandhi-chad-paint-canvas");
        if (!canvas || initialized) return;
        ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveHistory();
        initialized = true;
        zoomFit();
    }

    function getCanvasPoint(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) / zoom,
            y: (event.clientY - rect.top) / zoom
        };
    }

    function drawLine(from, to) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = brushSize;
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = activeTool === "eraser" ? "#ffffff" : activeColor;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        ctx.restore();
    }

    function updateSelectionBox() {
        if (!selectionBox || !selection) return;
        selectionBox.style.display = "block";
        selectionBox.style.left = (panX + selection.x * zoom) + "px";
        selectionBox.style.top = (panY + selection.y * zoom) + "px";
        selectionBox.style.width = (selection.w * zoom) + "px";
        selectionBox.style.height = (selection.h * zoom) + "px";
    }

    function applyTransform() {
        if (!canvasWrap) return;
        canvasWrap.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
        canvasWrap.style.transformOrigin = "0 0";
        updateSelectionBox();
        const zoomLabel = document.querySelector("#gandhi-chad-paint-zoom-label");
        if (zoomLabel) zoomLabel.textContent = Math.round(zoom * 100) + "%";
    }

    function zoomIn() {
        zoom = Math.min(4, Math.round((zoom + 0.1) * 10) / 10);
        applyTransform();
    }

    function zoomOut() {
        zoom = Math.max(0.2, Math.round((zoom - 0.1) * 10) / 10);
        applyTransform();
    }

    function zoomFit() {
        if (!viewport || !canvas) return;
        const zr = Math.min((viewport.clientWidth - 40) / canvas.width, (viewport.clientHeight - 40) / canvas.height);
        zoom = Math.max(0.2, Math.min(2, zr));
        panX = Math.max(20, (viewport.clientWidth - canvas.width * zoom) / 2);
        panY = Math.max(20, (viewport.clientHeight - canvas.height * zoom) / 2);
        applyTransform();
    }

    function zoomActual() {
        zoom = 1;
        panX = 30;
        panY = 30;
        applyTransform();
    }

    function drawPastedImage(img) {
        if (!canvas || !ctx || !img) return;

        const freshCanvas = historyIndex <= 0;

        if (freshCanvas) {
            canvas.width = Math.max(1, img.naturalWidth || img.width);
            canvas.height = Math.max(1, img.naturalHeight || img.height);
            ctx = canvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            clearSelection();
            saveHistory();
            zoomFit();
            notify("Image pasted. You can now draw over it.");
            return;
        }

        const maxW = canvas.width * 0.85;
        const maxH = canvas.height * 0.85;
        const scale = Math.min(1, maxW / img.width, maxH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;

        ctx.drawImage(img, x, y, w, h);
        clearSelection();
        saveHistory();
        notify("Image pasted on canvas.");
    }

    function pasteImageBlob(blob) {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            drawPastedImage(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            notify("Could not read pasted image.");
        };
        img.src = url;
    }

    async function pasteFromClipboard() {
        if (!navigator.clipboard || !navigator.clipboard.read) {
            notify("Clipboard image read is not available here. Try Ctrl+V after copying an image.");
            return;
        }

        try {
            const items = await navigator.clipboard.read();
            for (const item of items) {
                const imageType = item.types.find(type => type.startsWith("image/"));
                if (imageType) {
                    pasteImageBlob(await item.getType(imageType));
                    return;
                }
            }
            notify("No image found in clipboard.");
        }
        catch (error) {
            notify("Clipboard paste failed. Try Ctrl+V.\n\n" + error.message);
        }
    }

    function handlePaste(event) {
        if (!win || !event.clipboardData) return;

        const items = Array.from(event.clipboardData.items || []);
        const imageItem = items.find(item => item.type && item.type.startsWith("image/"));

        if (imageItem) {
            event.preventDefault();
            event.stopPropagation();
            pasteImageBlob(imageItem.getAsFile());
            return;
        }

        const text = event.clipboardData.getData("text/plain");
        if (text && activeTool === "text" && canvas && ctx) {
            event.preventDefault();
            ctx.save();
            ctx.fillStyle = activeColor;
            ctx.font = `${textSize}px ${textFont}`;
            ctx.textBaseline = "top";
            ctx.fillText(text, 40, 40);
            ctx.restore();
            saveHistory();
            notify("Text pasted onto canvas.");
        }
    }

    function onPointerDown(event) {
        if (!canvas || !ctx) return;
        isDown = true;
        startPoint = getCanvasPoint(event);
        lastPoint = startPoint;

        if (activeTool === "pan") {
            panStart = { x: event.clientX, y: event.clientY, panX, panY };
            return;
        }

        if (activeTool === "zoom") {
            if (event.shiftKey) zoomOut();
            else zoomIn();
            isDown = false;
            return;
        }

        if (activeTool === "text") {
            askText("Add Text", "Label", text => {
                if (text) {
                    ctx.save();
                    ctx.fillStyle = activeColor;
                    ctx.font = `${textSize}px ${textFont}`;
                    ctx.textBaseline = "top";
                    ctx.fillText(text, startPoint.x, startPoint.y);
                    ctx.restore();
                    saveHistory();
                }
            });
            isDown = false;
            return;
        }

        if (activeTool === "select" || activeTool === "crop") {
            selection = { x: startPoint.x, y: startPoint.y, w: 1, h: 1 };
            updateSelectionBox();
            return;
        }

        if (activeTool === "brush" || activeTool === "eraser") drawLine(startPoint, startPoint);
    }

    function onPointerMove(event) {
        if (!isDown) return;

        if (activeTool === "pan" && panStart) {
            panX = panStart.panX + (event.clientX - panStart.x);
            panY = panStart.panY + (event.clientY - panStart.y);
            applyTransform();
            return;
        }

        const point = getCanvasPoint(event);

        if (activeTool === "brush" || activeTool === "eraser") {
            drawLine(lastPoint, point);
            lastPoint = point;
            return;
        }

        if ((activeTool === "select" || activeTool === "crop") && startPoint) {
            const x = Math.min(startPoint.x, point.x);
            const y = Math.min(startPoint.y, point.y);
            const w = Math.abs(point.x - startPoint.x);
            const h = Math.abs(point.y - startPoint.y);
            selection = { x, y, w, h };
            updateSelectionBox();
        }
    }

    function onPointerUp() {
        if (!isDown) return;
        isDown = false;
        panStart = null;
        if (activeTool === "brush" || activeTool === "eraser") saveHistory();
    }

    async function canvasBlobFromSelection() {
        if (!canvas) return null;
        let source = canvas;

        if (selection && selection.w > 2 && selection.h > 2) {
            const temp = document.createElement("canvas");
            temp.width = Math.max(1, Math.round(selection.w));
            temp.height = Math.max(1, Math.round(selection.h));
            temp.getContext("2d").drawImage(canvas, selection.x, selection.y, selection.w, selection.h, 0, 0, temp.width, temp.height);
            source = temp;
        }

        return new Promise(resolve => source.toBlob(resolve, "image/png"));
    }

    async function copyImage() {
        const blob = await canvasBlobFromSelection();
        if (!blob) return;

        try {
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            notify(selection ? "Selected area copied." : "Image copied.");
        }
        catch (error) {
            saveLocal();
            notify("Clipboard image copy failed. PNG was saved instead.\n\n" + error.message);
        }
    }

    async function sendDirect() {
        const blob = await canvasBlobFromSelection();
        if (!blob) return;

        try {
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        }
        catch (error) {
            notify("Could not copy image for sending.\n\n" + error.message);
            return;
        }

        const input = document.querySelector("#prompt-textarea") || document.querySelector("textarea") || document.querySelector("[contenteditable='true']");
        if (input) input.focus();
        notify("Image copied. Press Ctrl+V in the chat box.");
    }

    function saveLocal() {
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = "chad-quick-sketch.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    }

    function clearCanvas() {
        if (!canvas || !ctx) return;
        confirmChad("Clear canvas?", yes => {
            if (!yes) return;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            clearSelection();
            saveHistory();
        });
    }

    function cropToSelection() {
        if (!selection || selection.w < 2 || selection.h < 2) {
            notify("Make a rectangle selection first.");
            return;
        }

        const temp = document.createElement("canvas");
        temp.width = Math.round(selection.w);
        temp.height = Math.round(selection.h);
        temp.getContext("2d").drawImage(canvas, selection.x, selection.y, selection.w, selection.h, 0, 0, temp.width, temp.height);

        canvas.width = temp.width;
        canvas.height = temp.height;
        ctx = canvas.getContext("2d");
        ctx.drawImage(temp, 0, 0);
        clearSelection();
        saveHistory();
        zoomFit();
    }

    function renderPalette() {
        return el("div", {
            style: {
                display: "grid",
                gridTemplateColumns: "repeat(14, 22px)",
                gap: "6px",
                padding: "8px",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                background: "#ffffff"
            }
        }, COLORS.map(color => el("button", {
            title: color,
            style: {
                width: "22px",
                height: "22px",
                borderRadius: "5px",
                border: "2px solid " + (activeColor === color ? "#0f172a" : "#cbd5e1"),
                background: color,
                cursor: "pointer",
                boxShadow: color === "#ffffff" ? "inset 0 0 0 1px #e2e8f0" : "none"
            },
            onclick: event => {
                event.preventDefault();
                event.stopPropagation();
                activeColor = color;
                renderInspectorOnly();
                updateStatus();
            }
        })));
    }

    function renderToolbar() {
        return el("div", {
            id: "gandhi-chad-paint-toolbar",
            style: {
                width: "88px",
                padding: "10px 8px",
                borderRight: "1px solid #cbd5e1",
                background: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                gap: "7px",
                boxSizing: "border-box",
                overflowY: "auto"
            }
        }, [
            toolButton("brush", "🖌", "Paint"),
            toolButton("eraser", "🧽", "Erase"),
            toolButton("select", "▭", "Select"),
            toolButton("text", "T", "Text"),
            toolButton("crop", "✂", "Crop"),
            toolButton("pan", "✋", "Pan"),
            toolButton("zoom", "🔍", "Zoom"),
            el("div", { style: { height: "1px", background: "#cbd5e1", margin: "4px 0" } }),
            topButton("↶", "Undo", undo),
            topButton("↷", "Redo", redo)
        ]);
    }

    function renderCanvasArea() {
        viewport = el("div", {
            id: "gandhi-chad-paint-viewport",
            style: {
                flex: "1",
                minWidth: "0",
                background: "#e2e8f0",
                padding: "16px",
                position: "relative",
                overflow: "hidden"
            }
        });

        const zoomBadge = el("div", {
            id: "gandhi-chad-paint-zoom-label",
            text: Math.round(zoom * 100) + "%",
            style: {
                position: "absolute",
                right: "14px",
                top: "10px",
                background: "rgba(255,255,255,.9)",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "5px 8px",
                fontSize: "11px",
                color: "#64748b",
                fontWeight: "700",
                zIndex: "3"
            }
        });

        canvasWrap = el("div", {
            id: "gandhi-chad-paint-canvas-wrap",
            style: {
                position: "absolute",
                left: "0",
                top: "0",
                transformOrigin: "0 0",
                boxShadow: "0 14px 38px rgba(15,23,42,.18)",
                cursor: "crosshair"
            }
        });

        canvas = el("canvas", {
            id: "gandhi-chad-paint-canvas",
            width: "1000",
            height: "650",
            style: {
                display: "block",
                background: "#ffffff",
                border: "1px solid #94a3b8",
                borderRadius: "8px"
            },
            onpointerdown: onPointerDown,
            onpointermove: onPointerMove,
            onpointerup: onPointerUp,
            onpointerleave: onPointerUp
        });

        selectionBox = el("div", {
            style: {
                position: "absolute",
                border: "2px dashed #2563eb",
                background: "rgba(37,99,235,.08)",
                display: "none",
                pointerEvents: "none",
                zIndex: "2"
            }
        });

        canvasWrap.appendChild(canvas);
        viewport.appendChild(zoomBadge);
        viewport.appendChild(canvasWrap);
        viewport.appendChild(selectionBox);

        setTimeout(() => {
            initCanvasOnce();
            applyTransform();
            updateCursor();
        }, 0);

        return viewport;
    }

    function renderInspector() {
        return el("div", {
            id: "gandhi-chad-paint-inspector",
            style: {
                width: "286px",
                padding: "10px",
                borderLeft: "1px solid #cbd5e1",
                background: "#f8fafc",
                boxSizing: "border-box",
                overflowY: "auto"
            }
        }, [
            el("div", { text: "Tool Settings", style: { fontWeight: "900", fontSize: "14px", marginBottom: "8px", color: "#0f172a" } }),
            el("label", { text: "Paint / Erase Size", style: { display: "block", color: "#334155", fontWeight: "800", fontSize: "11px", marginBottom: "5px" } }),
            el("div", { style: { display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" } }, [
                el("input", {
                    type: "range",
                    min: "1",
                    max: "80",
                    value: String(brushSize),
                    style: { flex: "1" },
                    oninput: event => {
                        brushSize = Number(event.target.value || 1);
                        const label = document.querySelector("#gandhi-chad-paint-brush-size-label");
                        if (label) label.textContent = brushSize + " px";
                    }
                }),
                el("span", { id: "gandhi-chad-paint-brush-size-label", text: brushSize + " px", style: { width: "46px", color: "#64748b", fontSize: "11px", fontWeight: "800" } })
            ]),
            el("div", { text: "Zoom", style: { color: "#334155", fontWeight: "800", fontSize: "11px", marginBottom: "5px" } }),
            el("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "12px" } }, [
                topButton("+ Zoom", "Zoom in", zoomIn),
                topButton("- Zoom", "Zoom out", zoomOut),
                topButton("Fit", "Fit canvas", zoomFit),
                topButton("1:1", "Actual size", zoomActual)
            ]),
            el("div", { text: "Colors", style: { color: "#334155", fontWeight: "800", fontSize: "11px", marginBottom: "5px" } }),
            renderPalette(),
            el("div", { style: { height: "10px" } }),
            el("div", { text: "Text Tool", style: { color: "#334155", fontWeight: "900", fontSize: "12px", marginBottom: "6px" } }),
            el("select", {
                style: { width: "100%", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "6px", marginBottom: "7px", background: "#ffffff" },
                onchange: event => { textFont = event.target.value; }
            }, [
                el("option", { text: "Arial", value: "Arial" }),
                el("option", { text: "Segoe UI", value: "Segoe UI" }),
                el("option", { text: "Consolas", value: "Consolas" }),
                el("option", { text: "Comic Sans MS", value: "Comic Sans MS" }),
                el("option", { text: "Times New Roman", value: "Times New Roman" })
            ]),
            el("div", { style: { display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" } }, [
                el("input", {
                    type: "range",
                    min: "8",
                    max: "96",
                    value: String(textSize),
                    style: { flex: "1" },
                    oninput: event => {
                        textSize = Number(event.target.value || 24);
                        const label = document.querySelector("#gandhi-chad-paint-text-size-label");
                        if (label) label.textContent = textSize + " px";
                    }
                }),
                el("span", { id: "gandhi-chad-paint-text-size-label", text: textSize + " px", style: { width: "46px", color: "#64748b", fontSize: "11px", fontWeight: "800" } })
            ]),
            el("div", { text: "Selection / Crop", style: { color: "#334155", fontWeight: "900", fontSize: "12px", marginBottom: "6px" } }),
            el("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" } }, [
                topButton("Copy Sel", "Copy selected rectangle", copyImage),
                topButton("Crop", "Crop to selection", cropToSelection),
                topButton("Clear Sel", "Clear selection", () => clearSelection()),
                topButton("Fit", "Fit to window", zoomFit)
            ])
        ]);
    }

    function renderInspectorOnly() {
        const old = document.querySelector("#gandhi-chad-paint-inspector");
        if (old) old.replaceWith(renderInspector());
    }

    function renderFooter() {
        return el("div", { style: { padding: "9px 12px", borderTop: "1px solid #cbd5e1", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" } }, [
            el("div", { text: "Tip: copy a screenshot, open Quick Sketch, then press Ctrl+V or Paste.", style: { color: "#64748b", fontSize: "11px", fontWeight: "700" } }),
            el("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap" } }, [
                topButton("📥 Paste", "Paste image from clipboard", pasteFromClipboard, { bg: "#fef3c7", border: "#fcd34d" }),
                topButton("🗑 Clear", "Clear canvas", clearCanvas),
                topButton("💾 Save Local", "Save PNG locally", saveLocal),
                topButton("☁ Save GDrive", "Save to Google Drive", () => notify("GDrive save will be added after extension conversion."), { bg: "#e0f2fe", border: "#7dd3fc" })
            ])
        ]);
    }

    function close() {
        if (win) win.remove();
        win = null;
        canvas = null;
        ctx = null;
        viewport = null;
        canvasWrap = null;
        selectionBox = null;
        initialized = false;
    }

    function handleKeyDown(event) {
        if (!win) return;
        if (event.ctrlKey && event.key.toLowerCase() === "v") {
            return;
        }
        if (event.key === "Escape") close();
    }

    function render() {
        if (!win) return;
        win.innerHTML = "";

        win.appendChild(el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#0f172a", color: "#ffffff", borderBottom: "1px solid #334155" } }, [
            el("div", { html: "<b>🎨 Quick Sketch</b> " + `<span id=\"gandhi-chad-paint-status\" style=\"color:#cbd5e1;font-size:12px\">Tool: ${activeTool} · Color: ${activeColor}</span>`, style: { fontSize: "16px" } }),
            el("div", { style: { display: "flex", gap: "6px", alignItems: "center" } }, [
                topButton("+", "Zoom in", zoomIn, { bg: "#e0f2fe", border: "#7dd3fc" }),
                topButton("-", "Zoom out", zoomOut, { bg: "#e0f2fe", border: "#7dd3fc" }),
                topButton("📥 Paste", "Paste image from clipboard", pasteFromClipboard, { bg: "#fef3c7", border: "#fcd34d" }),
                topButton("📋 Copy", "Copy image or selection", copyImage, { bg: "#dcfce7", border: "#86efac" }),
                topButton("📤 Send Now", "Copy then focus chat", sendDirect, { bg: "#fef3c7", border: "#fcd34d" }),
                topButton("✕", "Close", close, { bg: "#fee2e2", border: "#fecaca" })
            ])
        ]));

        win.appendChild(el("div", { style: { display: "flex", flex: "1", minHeight: "0" } }, [
            renderToolbar(),
            renderCanvasArea(),
            renderInspector()
        ]));

        win.appendChild(renderFooter());
    }

    function open() {
        if (win) {
            win.style.display = "flex";
            win.focus();
            return;
        }

        zoom = 1;
        panX = 30;
        panY = 30;
        history = [];
        historyIndex = -1;
        selection = null;
        initialized = false;

        win = el("div", {
            id: "gandhi-chad-paint-window",
            tabindex: "0",
            style: {
                position: "fixed",
                inset: "26px",
                zIndex: "1000003",
                background: "#ffffff",
                color: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "14px",
                boxShadow: "0 18px 70px rgba(15,23,42,.35)",
                fontFamily: "Arial, sans-serif",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
            },
            onpaste: handlePaste,
            onkeydown: handleKeyDown
        });

        document.body.appendChild(win);
        render();
        win.focus();
    }

    function patchDrawingButton() {
        const panel = document.querySelector("#gandhi-chad-panel");
        if (!panel) return;

        const drawingButton = panel.querySelector("#gandhi-chad-paint-button") ||
            Array.from(panel.querySelectorAll("button")).find(btn => btn.textContent.trim() === "🎨");

        if (!drawingButton || drawingButton.dataset.chadPaintPatched) return;

        drawingButton.dataset.chadPaintPatched = "1";
        drawingButton.title = "Open Quick Sketch";
        drawingButton.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            open();
        }, true);
    }

    function patchUI() {
        if (!window.Chad.ui || window.Chad.ui.__paintPatched) return;

        const originalRender = window.Chad.ui.render;
        window.Chad.ui.render = function () {
            originalRender.apply(window.Chad.ui, arguments);
            patchDrawingButton();
        };
        window.Chad.ui.__paintPatched = true;
    }

    paint.open = open;
    paint.close = close;
    paint.copyImage = copyImage;
    paint.pasteFromClipboard = pasteFromClipboard;
    paint.sendDirect = sendDirect;
    paint.saveLocal = saveLocal;
    paint.patchUI = patchUI;

    window.Chad.paint = paint;
    patchUI();
})();
