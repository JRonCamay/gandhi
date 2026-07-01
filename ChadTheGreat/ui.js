window.Chad = window.Chad || {};

(function () {
    "use strict";

    const ui = {};
    let panel = null;
    let contextMenu = null;

    function createEl(tag, props = {}, children = []) {
        const el = document.createElement(tag);

        for (const [key, value] of Object.entries(props)) {
            if (key === "style") {
                Object.assign(el.style, value);
            }
            else if (key === "text") {
                el.textContent = value;
            }
            else if (key === "html") {
                el.innerHTML = value;
            }
            else if (key.startsWith("on")) {
                el.addEventListener(
                    key.slice(2).toLowerCase(),
                    value
                );
            }
            else {
                el.setAttribute(key, value);
            }
        }

        for (const child of children) {
            if (typeof child === "string") {
                el.appendChild(
                    document.createTextNode(child)
                );
            }
            else if (child) {
                el.appendChild(child);
            }
        }

        return el;
    }

    function escapeHTML(text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function button(label, fn, extra = {}) {
        return createEl("button", {
            text: label,
            onclick: fn,
            title: extra.title || "",
            style: {
                background: extra.bg || "#f8fafc",
                color: extra.color || "#0f172a",
                border:
                    "1px solid " +
                    (extra.border || "#cbd5e1"),
                borderRadius: "6px",
                padding: "4px 7px",
                fontSize: "11px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontWeight: extra.bold ? "700" : "500"
            }
        });
    }

    function bodyStyle() {
        return {
            padding: "8px",
            overflowY: "auto",
            height: "calc(100vh - 158px)",
            background: "#ffffff"
        };
    }

    function renderHeader() {
        const store = window.Chad.storage;
        const state = store.state;

        const tabs = [
            ["Tasks", "tasks"],
            ["Roadmap", "roadmap"],
            ["Pins", "pins"],
            ["Repo", "repo"],
            ["Notes", "notes"]
        ];

        return createEl("div", {
            style: {
                padding: "9px",
                background: "#f1f5f9",
                borderBottom: "1px solid #cbd5e1"
            }
        }, [
            createEl("div", {
                style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom:
                        state.minimized ? "0" : "7px"
                }
            }, [
                createEl("div", {
                    text: "Chad",
                    style: {
                        fontWeight: "800",
                        fontSize: "17px",
                        color: "#0f172a"
                    }
                }),
                createEl("div", {
                    style: {
                        display: "flex",
                        gap: "4px"
                    }
                }, [
                    button(
                        "RULES",
                        window.Chad.actions.copyRules,
                        {
                            bg: "#e0f2fe",
                            border: "#7dd3fc",
                            bold: true
                        }
                    ),
                    button(
                        "CHAT RULES",
                        window.Chad.actions.copyChatRules,
                        {
                            bg: "#fef3c7",
                            border: "#fcd34d",
                            bold: true
                        }
                    ),
                    button(
                        state.minimized ? "□" : "—",
                        () => {
                            state.minimized =
                                !state.minimized;
                            render();
                        }
                    ),
                    button(
                        "✕",
                        () => {
                            panel.style.display = "none";
                        }
                    )
                ])
            ]),
            state.minimized ? null : createEl("div", {
                style: {
                    display: "flex",
                    gap: "5px",
                    flexWrap: "wrap"
                }
            }, [
                ...tabs.map(([label, tab]) =>
                    button(label, () => {
                        state.activeTab = tab;
                        render();

                        if (tab === "repo") {
                            window.Chad.actions
                                .ensureRepoTreeLoaded();
                        }
                    }, {
                        bg:
                            state.activeTab === tab
                                ? "#2563eb"
                                : "#ffffff",
                        color:
                            state.activeTab === tab
                                ? "#ffffff"
                                : "#0f172a",
                        border:
                            state.activeTab === tab
                                ? "#2563eb"
                                : "#cbd5e1",
                        bold: state.activeTab === tab
                    })
                ),
                button(
                    "Scan",
                    window.Chad.scanner.scanTasks,
                    {
                        bg: "#dcfce7",
                        border: "#86efac",
                        bold: true
                    }
                ),
                createEl("span", {
                    id: "gandhi-chad-scan-status",
                    text: "",
                    style: {
                        fontSize: "11px",
                        color: "#64748b",
                        alignSelf: "center"
                    }
                })
            ])
        ]);
    }

    function renderProjectFilters() {
        const state = window.Chad.storage.state;
        const order = window.Chad.data.projectOrder;

        return createEl("div", {
            style: {
                display: "flex",
                gap: "4px",
                flexWrap: "wrap",
                marginBottom: "8px"
            }
        }, order.map(project =>
            button(project, () => {
                state.activeProject = project;
                render();
            }, {
                bg:
                    state.activeProject === project
                        ? "#0f172a"
                        : "#ffffff",
                color:
                    state.activeProject === project
                        ? "#ffffff"
                        : "#0f172a",
                border:
                    state.activeProject === project
                        ? "#0f172a"
                        : "#cbd5e1",
                bold: state.activeProject === project
            })
        ));
    }

    function currentTaskSummary() {
        const state = window.Chad.storage.state;

        const pending = state.tasks
            .filter(task => task.status !== "Completed")
            .slice()
            .reverse()[0];

        if (!pending) {
            return createEl("div", {
                text: "Current: none",
                style: {
                    color: "#64748b",
                    marginBottom: "8px"
                }
            });
        }

        return createEl("div", {
            html:
                `<b>Current:</b> ${escapeHTML(pending.id)} — ${escapeHTML(pending.title)}<br>` +
                `<span style="color:#64748b">Status: ${escapeHTML(pending.status)} | Deadline: ${escapeHTML(pending.deadline || "No deadline")}</span>`,
            style: {
                padding: "7px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                background: "#f8fafc",
                marginBottom: "8px"
            }
        });
    }

    function renderTaskCard(task) {
        const isDone =
            task.status === "Completed";

        return createEl("div", {
            style: {
                border:
                    "1px solid " +
                    (isDone ? "#86efac" : "#cbd5e1"),
                borderRadius: "9px",
                padding: "8px",
                marginBottom: "8px",
                background:
                    isDone ? "#f0fdf4" : "#f8fafc"
            }
        }, [
            createEl("div", {
                style: {
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "8px",
                    alignItems: "flex-start",
                    marginBottom: "5px"
                }
            }, [
                createEl("div", {
                    html:
                        `<b>${escapeHTML(task.id)}</b><br>` +
                        `<span style="color:#334155">${escapeHTML(task.title)}</span>`
                }),
                createEl("span", {
                    text: task.status,
                    style: {
                        color:
                            isDone ? "#15803d" : "#ca8a04",
                        fontWeight: "bold"
                    }
                })
            ]),
            createEl("div", {
                html:
                    `<span style="color:#64748b">Project:</span> ${escapeHTML(task.project || "")}<br>` +
                    `<span style="color:#64748b">Created:</span> ${escapeHTML(task.createdAt || "")}<br>` +
                    `<span style="color:#64748b">Updated:</span> ${escapeHTML(task.updatedAt || "")}<br>` +
                    `<span style="color:#64748b">Deadline:</span> ${escapeHTML(task.deadline || "No deadline")}`,
                style: {
                    fontSize: "11px",
                    color: "#334155",
                    lineHeight: "1.35"
                }
            }),
            createEl("div", {
                style: {
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px",
                    marginTop: "7px"
                }
            }, [
                button(
                    "OPEN",
                    () => openTaskModal(task)
                ),
                button(
                    "SRC",
                    () => window.Chad.actions
                        .scrollToTask(task)
                ),
                button(
                    "COPY",
                    () => window.Chad.actions
                        .copyText(task.prompt)
                ),
                button(
                    "DUE",
                    () => window.Chad.actions
                        .setDeadline(task)
                ),
                button(
                    "DONE",
                    () => window.Chad.actions
                        .markDone(task),
                    {
                        bg: "#dcfce7",
                        border: "#86efac",
                        bold: true
                    }
                ),
                button(
                    "DELETE",
                    () => window.Chad.actions
                        .deleteTask(task),
                    {
                        bg: "#fee2e2",
                        border: "#fecaca"
                    }
                )
            ])
        ]);
    }

    function renderTasks() {
        const store = window.Chad.storage;
        const state = store.state;

        const body = createEl("div", {
            style: bodyStyle()
        });

        body.appendChild(currentTaskSummary());

        body.appendChild(createEl("div", {
            style: {
                display: "flex",
                gap: "5px",
                marginBottom: "8px",
                flexWrap: "wrap"
            }
        }, [
            button(
                "SCAN",
                window.Chad.scanner.scanTasks,
                {
                    bg: "#dcfce7",
                    border: "#86efac",
                    bold: true
                }
            ),
            button(
                "RESET DELETED",
                () => {
                    if (
                        !confirm(
                            "Allow deleted tasks to be scanned again in this chat?"
                        )
                    ) {
                        return;
                    }

                    store.resetDeletedTasks();
                    window.Chad.scanner.scanTasks();
                },
                {
                    bg: "#fef3c7",
                    border: "#fcd34d"
                }
            )
        ]));

        body.appendChild(renderProjectFilters());

        let list = [...state.tasks];

        if (state.activeProject !== "ALL") {
            list = list.filter(
                task => task.project === state.activeProject
            );
        }

        if (!list.length) {
            body.appendChild(createEl("div", {
                text: "No tasks yet. Click SCAN.",
                style: {
                    color: "#64748b",
                    padding: "10px"
                }
            }));
        }

        for (const task of list.reverse()) {
            body.appendChild(renderTaskCard(task));
        }

        return body;
    }

    function renderRoadmap() {
        const body = createEl("div", {
            style: bodyStyle()
        });

        body.appendChild(
            button(
                "Refresh Repo Memory",
                window.Chad.actions.refreshRepoMemory,
                {
                    bg: "#ede9fe",
                    border: "#c4b5fd",
                    bold: true
                }
            )
        );

        body.appendChild(createEl("div", {
            style: { height: "8px" }
        }));

        for (const item of window.Chad.storage.state.roadmap) {
            body.appendChild(createEl("div", {
                style: {
                    border: "1px solid #cbd5e1",
                    borderRadius: "9px",
                    padding: "8px",
                    marginBottom: "8px",
                    background: "#f8fafc"
                }
            }, [
                createEl("div", {
                    html:
                        `<b>${escapeHTML(item.title)}</b><br>` +
                        `<span style="color:#ca8a04">${escapeHTML(item.status)}</span><br>` +
                        `<span style="color:#64748b">Updated: ${escapeHTML(item.updatedAt || "")}</span>`,
                    style: {
                        marginBottom: "6px"
                    }
                }),
                createEl("pre", {
                    text: item.text,
                    style: {
                        whiteSpace: "pre-wrap",
                        fontFamily: "Consolas, monospace",
                        fontSize: "11px",
                        color: "#334155",
                        margin: "0"
                    }
                })
            ]));
        }

        return body;
    }

    function renderPins() {
        const state = window.Chad.storage.state;

        const body = createEl("div", {
            style: bodyStyle()
        }, [
            createEl("div", {
                style: {
                    display: "flex",
                    gap: "5px",
                    marginBottom: "8px"
                }
            }, [
                button(
                    "Pin Selected",
                    window.Chad.actions.pinSelection,
                    {
                        bg: "#ede9fe",
                        border: "#c4b5fd"
                    }
                ),
                button(
                    "Pin Last",
                    window.Chad.actions.pinLastAssistant,
                    {
                        bg: "#ede9fe",
                        border: "#c4b5fd"
                    }
                )
            ])
        ]);

        if (!state.pins.length) {
            body.appendChild(createEl("div", {
                text: "No pinned responses yet.",
                style: {
                    color: "#64748b",
                    padding: "10px"
                }
            }));
        }

        for (const pin of state.pins) {
            body.appendChild(createEl("div", {
                style: {
                    border: "1px solid #cbd5e1",
                    borderRadius: "9px",
                    padding: "8px",
                    marginBottom: "8px",
                    background: "#f8fafc"
                }
            }, [
                createEl("div", {
                    html:
                        `<b>${escapeHTML(pin.title)}</b><br>` +
                        `<span style="color:#64748b">${escapeHTML(pin.createdAt)}</span>`,
                    style: {
                        marginBottom: "6px"
                    }
                }),
                createEl("div", {
                    style: {
                        display: "flex",
                        gap: "4px",
                        marginBottom: "6px"
                    }
                }, [
                    button(
                        "OPEN",
                        () => openTextModal(
                            pin.title,
                            pin.text
                        )
                    ),
                    button(
                        "SRC",
                        () => window.Chad.actions
                            .scrollToPin(pin)
                    ),
                    button(
                        "COPY",
                        () => window.Chad.actions
                            .copyText(pin.text)
                    ),
                    button(
                        "DELETE",
                        () => {
                            state.pins = state.pins.filter(
                                item => item.id !== pin.id
                            );

                            window.Chad.storage.savePins();
                            render();
                        },
                        {
                            bg: "#fee2e2",
                            border: "#fecaca"
                        }
                    )
                ])
            ]));
        }

        return body;
    }

    function buildTree(items) {
        const root = {
            name: window.Chad.data.repo.repo,
            path: "",
            type: "tree",
            children: {},
            open: true
        };

        for (const item of items) {
            const parts = item.path.split("/");
            let node = root;
            let currentPath = "";

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                currentPath =
                    currentPath
                        ? currentPath + "/" + part
                        : part;

                const isLast =
                    i === parts.length - 1;

                const type =
                    isLast ? item.type : "tree";

                if (!node.children[part]) {
                    node.children[part] = {
                        name: part,
                        path: currentPath,
                        type,
                        children: {},
                        open:
                            currentPath === "Transfork" ||
                            currentPath === "ChadTheGreat" ||
                            currentPath === "MiniConsole"
                    };
                }

                node = node.children[part];
            }
        }

        return root;
    }

    function isFolderOpen(path, fallback) {
        const state = window.Chad.storage.state;

        if (
            Object.prototype.hasOwnProperty.call(
                state.openFolders,
                path
            )
        ) {
            return state.openFolders[path];
        }

        return fallback;
    }

    function setFolderOpen(path, open) {
        const store = window.Chad.storage;
        store.state.openFolders[path] = open;
        store.saveOpenFolders();
    }

    function renderTreeNode(node, depth, body) {
        if (node.path !== "") {
            const isFolder = node.type === "tree";
            const open =
                isFolderOpen(node.path, node.open);

            const row = createEl("div", {
                style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "3px 5px",
                    margin: "1px 0",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontFamily: "Consolas, monospace",
                    fontSize: "12px",
                    color: isFolder ? "#0f172a" : "#334155",
                    marginLeft: (depth * 13) + "px",
                    background: "transparent"
                },
                onmouseenter: () => {
                    row.style.background = "#f1f5f9";
                },
                onmouseleave: () => {
                    row.style.background = "transparent";
                },
                onclick: event => {
                    event.stopPropagation();

                    if (isFolder) {
                        setFolderOpen(
                            node.path,
                            !open
                        );
                        render();
                    }
                    else {
                        window.Chad.actions.copyRawFile(
                            node.path
                        );
                    }
                },
                oncontextmenu: event => {
                    event.preventDefault();
                    event.stopPropagation();

                    if (!isFolder) {
                        showRepoContextMenu(
                            event.clientX,
                            event.clientY,
                            node.path
                        );
                    }
                }
            }, [
                createEl("span", {
                    text: isFolder
                        ? (open ? "▾" : "▸")
                        : "•",
                    style: { width: "12px" }
                }),
                createEl("span", {
                    text:
                        (isFolder ? "📁 " : "📄 ") +
                        node.name
                })
            ]);

            body.appendChild(row);

            if (isFolder && !open) {
                return;
            }
        }

        const children = Object.values(node.children)
            .sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === "tree" ? -1 : 1;
                }

                return a.name.localeCompare(b.name);
            });

        for (const child of children) {
            renderTreeNode(
                child,
                depth + (node.path ? 1 : 0),
                body
            );
        }
    }

    function menuItem(text, fn) {
        return createEl("div", {
            text,
            style: {
                padding: "7px 9px",
                cursor: "pointer",
                borderRadius: "5px",
                color: "#0f172a"
            },
            onmouseenter: event => {
                event.currentTarget.style.background = "#f1f5f9";
            },
            onmouseleave: event => {
                event.currentTarget.style.background = "transparent";
            },
            onclick: () => {
                hideRepoContextMenu();
                fn();
            }
        });
    }

    function hideRepoContextMenu() {
        if (contextMenu) {
            contextMenu.remove();
        }

        contextMenu = null;
    }

    function showRepoContextMenu(x, y, path) {
        hideRepoContextMenu();

        contextMenu = createEl("div", {
            style: {
                position: "fixed",
                left: x + "px",
                top: y + "px",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                boxShadow: "0 8px 24px rgba(15,23,42,.22)",
                zIndex: "1000002",
                padding: "5px",
                minWidth: "150px"
            }
        }, [
            menuItem(
                "Copy RAW",
                () => window.Chad.actions.copyRawFile(path)
            ),
            menuItem(
                "Copy URL",
                () => window.Chad.actions.copyText(
                    window.Chad.actions.fileUrl(path)
                )
            ),
            menuItem(
                "Copy Raw URL",
                () => window.Chad.actions.copyText(
                    window.Chad.actions.rawUrl(path)
                )
            )
        ]);

        document.body.appendChild(contextMenu);
    }

    document.addEventListener(
        "click",
        hideRepoContextMenu,
        true
    );

    function renderRepo() {
        const state = window.Chad.storage.state;
        const repo = window.Chad.data.repo;

        const body = createEl("div", {
            style: bodyStyle()
        });

        body.appendChild(createEl("div", {
            html:
                `<b>${repo.owner}/${repo.repo}</b><br>` +
                `<span style="color:#64748b">Branch: ${repo.branch}</span>`,
            style: {
                marginBottom: "8px"
            }
        }));

        body.appendChild(createEl("div", {
            style: {
                display: "flex",
                gap: "5px",
                marginBottom: "8px"
            }
        }, [
            button(
                "Refresh Tree",
                () => window.Chad.actions
                    .loadRepoTree(true),
                {
                    bg: "#e0f2fe",
                    border: "#7dd3fc",
                    bold: true
                }
            ),
            button(
                "Copy Repo URL",
                () => window.Chad.actions.copyText(
                    `https://github.com/${repo.owner}/${repo.repo}`
                )
            )
        ]));

        if (state.repoLoading) {
            body.appendChild(createEl("div", {
                text: "Loading repo tree...",
                style: {
                    color: "#64748b",
                    padding: "10px"
                }
            }));

            return body;
        }

        if (!state.repoTree) {
            body.appendChild(createEl("div", {
                text: "Click Refresh Tree to load the Gandhi repo file tree.",
                style: {
                    color: "#64748b",
                    padding: "10px"
                }
            }));

            return body;
        }

        if (state.repoTree.error) {
            body.appendChild(createEl("div", {
                text:
                    "Using fallback tree. Error: " +
                    state.repoTree.error,
                style: {
                    color: "#b45309",
                    marginBottom: "8px"
                }
            }));
        }
        else {
            body.appendChild(createEl("div", {
                text:
                    "Loaded: " +
                    state.repoTree.loadedAt,
                style: {
                    color: "#64748b",
                    marginBottom: "8px",
                    fontSize: "11px"
                }
            }));
        }

        const treeRoot = buildTree(
            state.repoTree.items || []
        );

        renderTreeNode(treeRoot, 0, body);

        return body;
    }

    function renderNotes() {
        const store = window.Chad.storage;
        const state = store.state;

        const body = createEl("div", {
            style: bodyStyle()
        });

        body.appendChild(createEl("div", {
            text: "Simple notes for this chat only.",
            style: {
                color: "#64748b",
                marginBottom: "7px",
                fontSize: "11px"
            }
        }));

        const textarea = createEl("textarea", {
            style: {
                width: "100%",
                height: "calc(100vh - 220px)",
                boxSizing: "border-box",
                resize: "vertical",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "9px",
                fontFamily: "Consolas, monospace",
                fontSize: "13px",
                lineHeight: "1.4",
                color: "#0f172a",
                background: "#ffffff",
                outline: "none"
            }
        });

        textarea.value =
            state.notesText;

        textarea.addEventListener("input", () => {
            state.notesText = textarea.value;
            store.saveNotes();
        });

        body.appendChild(textarea);

        body.appendChild(createEl("div", {
            style: {
                display: "flex",
                gap: "5px",
                marginTop: "8px"
            }
        }, [
            button(
                "COPY NOTES",
                () => window.Chad.actions
                    .copyText(state.notesText),
                {
                    bg: "#e0f2fe",
                    border: "#7dd3fc"
                }
            ),
            button(
                "CLEAR NOTES",
                () => {
                    if (
                        !confirm(
                            "Clear notes for this chat?"
                        )
                    ) {
                        return;
                    }

                    state.notesText = "";
                    store.saveNotes();
                    render();
                },
                {
                    bg: "#fee2e2",
                    border: "#fecaca"
                }
            )
        ]));

        return body;
    }

    function openTextModal(title, text) {
        const bg = createEl("div", {
            style: {
                position: "fixed",
                inset: "0",
                background: "rgba(15,23,42,.35)",
                zIndex: "1000000",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: "40px"
            }
        });

        const modal = createEl("div", {
            style: {
                width: "780px",
                maxWidth: "94vw",
                maxHeight: "86vh",
                background: "#ffffff",
                color: "#111827",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                boxShadow: "0 12px 40px rgba(15,23,42,.25)",
                overflow: "hidden"
            }
        }, [
            createEl("div", {
                style: {
                    padding: "10px",
                    borderBottom: "1px solid #cbd5e1",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "sticky",
                    top: "0",
                    background: "#f8fafc",
                    zIndex: "1"
                }
            }, [
                createEl("div", {
                    text: title,
                    style: {
                        fontSize: "17px",
                        fontWeight: "800"
                    }
                }),
                createEl("div", {
                    style: {
                        display: "flex",
                        gap: "5px"
                    }
                }, [
                    button(
                        "COPY",
                        () => window.Chad.actions.copyText(text)
                    ),
                    button(
                        "✕",
                        () => bg.remove()
                    )
                ])
            ]),
            createEl("pre", {
                text,
                style: {
                    margin: "0",
                    padding: "14px",
                    overflow: "auto",
                    maxHeight: "72vh",
                    whiteSpace: "pre-wrap",
                    fontFamily: "Consolas, monospace",
                    fontSize: "14px",
                    lineHeight: "1.45",
                    color: "#334155"
                }
            })
        ]);

        bg.appendChild(modal);
        document.body.appendChild(bg);
    }

    function openTaskModal(task) {
        openTextModal(
            task.id + " — " + task.title,
            task.prompt
        );
    }

    function render() {
        if (!panel) {
            return;
        }

        const state =
            window.Chad.storage.state;

        panel.innerHTML = "";
        panel.appendChild(renderHeader());

        if (state.minimized) {
            return;
        }

        if (state.activeTab === "tasks") {
            panel.appendChild(renderTasks());
        }
        else if (state.activeTab === "roadmap") {
            panel.appendChild(renderRoadmap());
        }
        else if (state.activeTab === "pins") {
            panel.appendChild(renderPins());
        }
        else if (state.activeTab === "repo") {
            panel.appendChild(renderRepo());
        }
        else if (state.activeTab === "notes") {
            panel.appendChild(renderNotes());
        }
    }

    function start() {
        if (document.querySelector("#gandhi-chad-panel")) {
            return;
        }

        panel = createEl("div", {
            id: "gandhi-chad-panel",
            style: {
                position: "fixed",
                right: "14px",
                top: "70px",
                bottom: "14px",
                width: "410px",
                background: "#ffffff",
                color: "#111827",
                border: "1px solid #cbd5e1",
                borderRadius: "12px",
                zIndex: "999999",
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                boxShadow: "0 10px 35px rgba(15,23,42,.20)",
                overflow: "hidden"
            }
        });

        document.body.appendChild(panel);

        render();

        setTimeout(
            window.Chad.scanner.scanTasks,
            1200
        );
    }

    ui.createEl = createEl;
    ui.button = button;
    ui.render = render;
    ui.start = start;
    ui.openTextModal = openTextModal;
    ui.openTaskModal = openTaskModal;

    window.Chad.ui = ui;
})();
