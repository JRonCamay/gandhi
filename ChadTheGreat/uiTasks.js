window.Chad = window.Chad || {};

(function () {
    "use strict";

    function ui() { return window.Chad.ui; }
    function el(tag, props, children) { return ui().createEl(tag, props || {}, children || []); }
    function btn(label, fn, extra) { return ui().button(label, fn, extra || {}); }
    function esc(text) { return ui().escapeHTML(text); }
    function bodyStyle() { return ui().bodyStyle(); }
    function render() { return ui().render(); }

    function renderProjectFilters() {
        const state = window.Chad.storage.state;
        return el("div", { style: { display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "8px" } },
            window.Chad.data.projectOrder.map(project => btn(project, () => {
                state.activeProject = project;
                render();
            }, {
                bg: state.activeProject === project ? "#0f172a" : "#ffffff",
                color: state.activeProject === project ? "#ffffff" : "#0f172a",
                border: state.activeProject === project ? "#0f172a" : "#cbd5e1",
                bold: state.activeProject === project
            }))
        );
    }

    function renderTaskCard(task) {
        const done = task.status === "Completed";
        return el("div", {
            style: {
                border: "1px solid " + (done ? "#86efac" : "#cbd5e1"),
                borderRadius: "9px",
                padding: "8px",
                marginBottom: "8px",
                background: done ? "#f0fdf4" : "#f8fafc"
            }
        }, [
            el("div", { html: `<b>${esc(task.id)}</b><br><span style="color:#334155">${esc(task.title)}</span>` }),
            el("div", {
                html:
                    `<span style="color:#64748b">Project:</span> ${esc(task.project || "")}<br>` +
                    `<span style="color:#64748b">Status:</span> ${esc(task.status || "Pending")}<br>` +
                    `<span style="color:#64748b">Updated:</span> ${esc(task.updatedAt || "")}`,
                style: { fontSize: "11px", color: "#334155", lineHeight: "1.35", marginTop: "5px" }
            }),
            el("div", { style: { display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "7px" } }, [
                btn("OPEN", () => ui().openTextModal(task.id + " — " + task.title, task.prompt)),
                btn("SRC", () => window.Chad.actions.scrollToTask(task)),
                btn("COPY", () => window.Chad.actions.copyText(task.prompt)),
                btn("DUE", () => window.Chad.actions.setDeadline(task)),
                btn("DONE", () => { window.Chad.actions.markDone(task); ui().markDoneFlash(); }, { bg: "#dcfce7", border: "#86efac", bold: true }),
                btn("DELETE", () => window.Chad.actions.deleteTask(task), { bg: "#fee2e2", border: "#fecaca" })
            ])
        ]);
    }

    function renderTasks() {
        const store = window.Chad.storage;
        const state = store.state;
        const wrap = el("div", { style: bodyStyle() });

        wrap.appendChild(el("div", { style: { display: "flex", gap: "5px", marginBottom: "8px", flexWrap: "wrap" } }, [
            btn("SCAN", window.Chad.scanner.scanTasks, { bg: "#dcfce7", border: "#86efac", bold: true }),
            btn("RESET DELETED", () => {
                if (!confirm("Allow deleted tasks to be scanned again in this chat?")) return;
                store.resetDeletedTasks();
                window.Chad.scanner.scanTasks();
            }, { bg: "#fef3c7", border: "#fcd34d" })
        ]));

        wrap.appendChild(renderProjectFilters());
        let tasks = [...state.tasks];
        if (state.activeProject !== "ALL") tasks = tasks.filter(task => task.project === state.activeProject);

        if (!tasks.length) wrap.appendChild(el("div", { text: "No tasks yet. Click SCAN.", style: { color: "#64748b", padding: "10px" } }));
        for (const task of tasks.reverse()) wrap.appendChild(renderTaskCard(task));
        return wrap;
    }

    window.Chad.uiTasks = { render: renderTasks };
})();
