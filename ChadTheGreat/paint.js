window.Chad = window.Chad || {};

(function () {
    "use strict";

    const paint = {};
    let win = null;
    let activeTool = "brush";
    let activeColor = "#ef4444";
    let brushSize = 8;
    let textSize = 24;
    let textFont = "Arial";

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
            if (key === "style") {
                Object.assign(node.style, value);
            }
            else if (key === "text") {
                node.textContent = value;
            }
            else if (key === "html") {
                node.innerHTML = value;
            }
            else if (key.startsWith("on")) {
                node.addEventListener(
                    key.slice(2).toLowerCase(),
                    value
                );
            }
            else {
                node.setAttribute(key, value);
            }
        }

        for (const child of children) {
            if (typeof child === "string") {
                node.appendChild(document.createTextNode(child));
            }
            else if (child) {
                node.appendChild(child);
            }
        }

        return node;
    }

    function toolButton(id, icon, label) {
        const selected = activeTool === id;

        return el("button", {
            html:
                `<div style=\"font-size:20px;line-height:1\">${icon}</div>` +
                `<div style=\"font-size:10px;margin-top:3px\">${label}</div>`,
            title: label,
            style: {
                width: "70px",
                minHeight: "54px",
                border: "1px solid " + (selected ? "#2563eb" : "#cbd5e1"),
                borderRadius: "9px",
                background: selected ? "#eff6ff" : "#ffffff",
                color: "#0f172a",
                cursor: "pointer",
                fontWeight: selected ? "800" : "600"
            },
            onclick: () => {
                activeTool = id;
                render();
            }
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
            onclick: fn
        });
    }

    function placeholder(name) {
        return () => {
            alert(name + " function will be wired after the UI is approved.");
        };
    }

    function close() {
        if (win) {
            win.remove();
        }

        win = null;
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
        }, COLORS.map(color =>
            el("button", {
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
                onclick: () => {
                    activeColor = color;
                    render();
                }
            })
        ));
    }

    function renderToolbar() {
        return el("div", {
            style: {
                width: "88px",
                padding: "10px 8px",
                borderRight: "1px solid #cbd5e1",
                background: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                gap: "7px",
                boxSizing: "border-box"
            }
        }, [
            toolButton("brush", "🖌", "Brush"),
            toolButton("eraser", "🧽", "Erase"),
            toolButton("select", "▭", "Select"),
            toolButton("text", "T", "Text"),
            toolButton("crop", "✂", "Crop"),
            toolButton("pan", "✋", "Pan"),
            el("div", {
                style: {
                    height: "1px",
                    background: "#cbd5e1",
                    margin: "4px 0"
                }
            }),
            topButton("↶", "Undo", placeholder("Undo")),
            topButton("↷", "Redo", placeholder("Redo"))
        ]);
    }

    function renderCanvasArea() {
        return el("div", {
            style: {
                flex: "1",
                minWidth: "0",
                background: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
                position: "relative",
                overflow: "hidden"
            }
        }, [
            el("div", {
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
                    fontWeight: "700"
                },
                text: "Canvas Preview · 100%"
            }),
            el("div", {
                id: "gandhi-chad-paint-canvas-placeholder",
                style: {
                    width: "min(920px, 92%)",
                    height: "min(560px, 82%)",
                    minHeight: "360px",
                    background:
                        "linear-gradient(45deg,#f8fafc 25%,transparent 25%)," +
                        "linear-gradient(-45deg,#f8fafc 25%,transparent 25%)," +
                        "linear-gradient(45deg,transparent 75%,#f8fafc 75%)," +
                        "linear-gradient(-45deg,transparent 75%,#f8fafc 75%)",
                    backgroundColor: "#ffffff",
                    backgroundSize: "24px 24px",
                    backgroundPosition: "0 0,0 12px,12px -12px,-12px 0px",
                    border: "1px solid #94a3b8",
                    borderRadius: "10px",
                    boxShadow: "0 14px 38px rgba(15,23,42,.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                    fontSize: "16px",
                    fontWeight: "700",
                    textAlign: "center",
                    padding: "20px"
                },
                html:
                    "Paint canvas goes here.<br>" +
                    "Next step: wire screenshot + drawing engine."
            })
        ]);
    }

    function renderInspector() {
        return el("div", {
            style: {
                width: "286px",
                padding: "10px",
                borderLeft: "1px solid #cbd5e1",
                background: "#f8fafc",
                boxSizing: "border-box",
                overflowY: "auto"
            }
        }, [
            el("div", {
                text: "Tool Settings",
                style: {
                    fontWeight: "900",
                    fontSize: "14px",
                    marginBottom: "8px",
                    color: "#0f172a"
                }
            }),
            el("label", {
                text: "Brush / Eraser Size",
                style: {
                    display: "block",
                    color: "#334155",
                    fontWeight: "800",
                    fontSize: "11px",
                    marginBottom: "5px"
                }
            }),
            el("div", {
                style: {
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    marginBottom: "12px"
                }
            }, [
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
                el("span", {
                    id: "gandhi-chad-paint-brush-size-label",
                    text: brushSize + " px",
                    style: {
                        width: "46px",
                        color: "#64748b",
                        fontSize: "11px",
                        fontWeight: "800"
                    }
                })
            ]),
            el("div", {
                text: "Colors",
                style: {
                    color: "#334155",
                    fontWeight: "800",
                    fontSize: "11px",
                    marginBottom: "5px"
                }
            }),
            renderPalette(),
            el("div", {
                style: {
                    height: "10px"
                }
            }),
            el("div", {
                text: "Text Tool",
                style: {
                    color: "#334155",
                    fontWeight: "900",
                    fontSize: "12px",
                    marginBottom: "6px"
                }
            }),
            el("select", {
                style: {
                    width: "100%",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "6px",
                    marginBottom: "7px",
                    background: "#ffffff"
                },
                onchange: event => {
                    textFont = event.target.value;
                }
            }, [
                el("option", { text: "Arial", value: "Arial" }),
                el("option", { text: "Segoe UI", value: "Segoe UI" }),
                el("option", { text: "Consolas", value: "Consolas" }),
                el("option", { text: "Comic Sans MS", value: "Comic Sans MS" }),
                el("option", { text: "Times New Roman", value: "Times New Roman" })
            ]),
            el("div", {
                style: {
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    marginBottom: "8px"
                }
            }, [
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
                el("span", {
                    id: "gandhi-chad-paint-text-size-label",
                    text: textSize + " px",
                    style: {
                        width: "46px",
                        color: "#64748b",
                        fontSize: "11px",
                        fontWeight: "800"
                    }
                })
            ]),
            el("div", {
                style: {
                    display: "flex",
                    gap: "6px",
                    marginBottom: "12px"
                }
            }, [
                topButton("B", "Bold", placeholder("Bold text")),
                topButton("I", "Italic", placeholder("Italic text")),
                topButton("A", "Apply text", placeholder("Apply text"))
            ]),
            el("div", {
                text: "Selection / Crop",
                style: {
                    color: "#334155",
                    fontWeight: "900",
                    fontSize: "12px",
                    marginBottom: "6px"
                }
            }),
            el("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "6px"
                }
            }, [
                topButton("Copy Sel", "Copy selected rectangle", placeholder("Copy selection")),
                topButton("Crop", "Crop to selection", placeholder("Crop")),
                topButton("Clear Sel", "Clear selection", placeholder("Clear selection")),
                topButton("Fit", "Fit to window", placeholder("Fit"))
            ])
        ]);
    }

    function renderFooter() {
        return el("div", {
            style: {
                padding: "9px 12px",
                borderTop: "1px solid #cbd5e1",
                background: "#f8fafc",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px"
            }
        }, [
            el("div", {
                text: "Quick Sketch UI mockup. Drawing engine will be added after this layout is approved.",
                style: {
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: "700"
                }
            }),
            el("div", {
                style: {
                    display: "flex",
                    gap: "6px",
                    flexWrap: "wrap"
                }
            }, [
                topButton("🗑 Clear", "Clear canvas", placeholder("Clear")),
                topButton("💾 Save Local", "Save PNG locally", placeholder("Save local")),
                topButton("☁ Save GDrive", "Save to Google Drive", placeholder("Save to GDrive"), {
                    bg: "#e0f2fe",
                    border: "#7dd3fc"
                })
            ])
        ]);
    }

    function render() {
        if (!win) {
            return;
        }

        win.innerHTML = "";

        win.appendChild(el("div", {
            style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                background: "#0f172a",
                color: "#ffffff",
                borderBottom: "1px solid #334155"
            }
        }, [
            el("div", {
                html:
                    "<b>🎨 Quick Sketch</b> " +
                    `<span style=\"color:#cbd5e1;font-size:12px\">Tool: ${activeTool} · Color: ${activeColor}</span>`,
                style: {
                    fontSize: "16px"
                }
            }),
            el("div", {
                style: {
                    display: "flex",
                    gap: "6px",
                    alignItems: "center"
                }
            }, [
                topButton("📋 Copy", "Copy image or selection", placeholder("Copy to clipboard"), {
                    bg: "#dcfce7",
                    border: "#86efac"
                }),
                topButton("📤 Send Direct", "Send to ChatGPT directly", placeholder("Send direct"), {
                    bg: "#fef3c7",
                    border: "#fcd34d"
                }),
                topButton("✕", "Close", close, {
                    bg: "#fee2e2",
                    border: "#fecaca"
                })
            ])
        ]));

        win.appendChild(el("div", {
            style: {
                display: "flex",
                flex: "1",
                minHeight: "0"
            }
        }, [
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
            }
        });

        document.body.appendChild(win);
        render();
    }

    function patchDrawingButton() {
        const panel = document.querySelector("#gandhi-chad-panel");

        if (!panel) {
            return;
        }

        const drawingButton = Array.from(panel.querySelectorAll("button"))
            .find(btn => btn.textContent.trim() === "🎨");

        if (!drawingButton || drawingButton.dataset.chadPaintPatched) {
            return;
        }

        drawingButton.dataset.chadPaintPatched = "1";
        drawingButton.title = "Open Quick Sketch";
        drawingButton.onclick = null;
        drawingButton.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            open();
        }, true);
    }

    function patchUI() {
        if (!window.Chad.ui || window.Chad.ui.__paintPatched) {
            return;
        }

        const originalRender = window.Chad.ui.render;

        window.Chad.ui.render = function () {
            originalRender.apply(window.Chad.ui, arguments);
            patchDrawingButton();
        };

        window.Chad.ui.__paintPatched = true;
    }

    paint.open = open;
    paint.close = close;
    paint.render = render;
    paint.patchUI = patchUI;

    window.Chad.paint = paint;

    patchUI();
})();
