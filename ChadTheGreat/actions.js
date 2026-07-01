window.Chad = window.Chad || {};

(function () {
    "use strict";

    const actions = {};

    function copyText(text) {
        navigator.clipboard.writeText(text || "");
    }

    function setChatInput(text) {
        const input =
            document.querySelector("#prompt-textarea") ||
            document.querySelector("textarea") ||
            document.querySelector("[contenteditable='true']");

        if (!input) {
            navigator.clipboard.writeText(text);
            alert(
                "Chat input not found. Message copied instead."
            );
            return;
        }

        input.focus();

        if (input.tagName === "TEXTAREA") {
            input.value = text;
            input.dispatchEvent(
                new Event("input", { bubbles: true })
            );
        }
        else {
            input.textContent = text;
            input.dispatchEvent(
                new InputEvent("input", {
                    bubbles: true,
                    inputType: "insertText",
                    data: text
                })
            );
        }
    }

    function focusSource(el) {
        el.style.scrollMarginTop = "110px";
        el.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        el.style.outline =
            "4px solid #22c55e";

        el.style.borderRadius =
            "10px";

        setTimeout(() => {
            el.style.outline = "";
        }, 2200);
    }

    function scrollToTask(task) {
        const found =
            window.Chad.scanner.findSourceForTask(task);

        if (found) {
            focusSource(found.el);
        }
        else {
            alert(
                "Source task not found in visible chat."
            );
        }
    }

    function markDone(task) {
        const store = window.Chad.storage;

        task.status = "Completed";
        task.completedAt =
            task.completedAt ||
            store.nowStamp();
        task.updatedAt = store.nowStamp();

        store.saveTasks();

        setChatInput(task.id + " done");

        window.Chad.ui.render();
    }

    function deleteTask(task) {
        const store = window.Chad.storage;
        const state = store.state;

        store.rememberDeletedTask(task.id);

        state.tasks = state.tasks.filter(
            item => item.id !== task.id
        );

        store.saveTasks();
        window.Chad.ui.render();
    }

    function setDeadline(task) {
        const store = window.Chad.storage;

        const value = prompt(
            "Deadline for " + task.id,
            task.deadline || "No deadline"
        );

        if (value === null) {
            return;
        }

        task.deadline =
            value.trim() ||
            "No deadline";

        task.updatedAt =
            store.nowStamp();

        store.saveTasks();
        window.Chad.ui.render();
    }

    function copyRules() {
        copyText(window.Chad.data.companionRules);
        alert("Companion rules copied.");
    }

    function copyChatRules() {
        copyText(window.Chad.data.chatRules);
        alert("Chat rules copied.");
    }

    function addPin(title, text, sourceText) {
        const store = window.Chad.storage;
        const state = store.state;

        state.pins.unshift({
            id: "pin-" + Date.now(),
            title: title || "Pinned Response",
            text,
            sourceText:
                sourceText ||
                text.slice(0, 400),
            createdAt: store.nowStamp()
        });

        store.savePins();
        window.Chad.ui.render();
    }

    function pinSelection() {
        const selected =
            window.Chad.scanner.normalizeText(
                window.getSelection &&
                window.getSelection().toString()
            );

        if (!selected) {
            alert(
                "Select text in the chat first, then click Pin Selected."
            );
            return;
        }

        const title =
            prompt(
                "Pin title",
                selected.split("\n")[0].slice(0, 60)
            ) ||
            "Pinned Response";

        addPin(
            title,
            selected,
            selected.slice(0, 400)
        );
    }

    function pinLastAssistant() {
        const blocks =
            window.Chad.scanner.getAssistantBlocks();

        const last = [...blocks]
            .reverse()
            .find(block => block.text.length > 80);

        if (!last) {
            alert("No response found to pin.");
            return;
        }

        const title =
            prompt(
                "Pin title",
                last.text.split("\n")[0].slice(0, 60)
            ) ||
            "Pinned Response";

        addPin(
            title,
            last.text,
            last.text.slice(0, 400)
        );
    }

    function scrollToPin(pin) {
        const blocks =
            window.Chad.scanner.getAssistantBlocks();

        const seed =
            window.Chad.scanner.normalizeText(
                pin.sourceText ||
                pin.text
            ).slice(0, 120);

        const found = blocks.find(block =>
            window.Chad.scanner
                .normalizeText(block.text)
                .includes(seed)
        );

        if (found) {
            focusSource(found.el);
        }
        else {
            alert(
                "Pinned source not found in visible chat."
            );
        }
    }

    function rawUrl(path) {
        const repo = window.Chad.data.repo;

        return `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${repo.branch}/${path}`;
    }

    function fileUrl(path) {
        const repo = window.Chad.data.repo;

        return `https://github.com/${repo.owner}/${repo.repo}/blob/${repo.branch}/${path}`;
    }

    async function copyRawFile(path) {
        const url = rawUrl(path);

        try {
            const res = await fetch(
                url,
                { cache: "no-store" }
            );

            if (!res.ok) {
                throw new Error(
                    res.status + " " + res.statusText
                );
            }

            const text = await res.text();

            await navigator.clipboard.writeText(text);

            alert(
                "Copied raw file content:\n" +
                path
            );
        }
        catch (error) {
            await navigator.clipboard.writeText(url);

            alert(
                "Could not fetch raw content. Copied raw URL instead.\n" +
                error.message
            );
        }
    }

    async function loadRepoTree(force) {
        const store = window.Chad.storage;
        const state = store.state;
        const repo = window.Chad.data.repo;

        if (!force) {
            const cached =
                store.loadRepoCache();

            if (
                cached &&
                cached.items &&
                cached.items.length
            ) {
                state.repoTree = cached;
                return;
            }
        }

        state.repoLoading = true;
        window.Chad.ui.render();

        try {
            const api =
                `https://api.github.com/repos/${repo.owner}/${repo.repo}/git/trees/${repo.branch}?recursive=1`;

            const res = await fetch(
                api,
                { cache: "no-store" }
            );

            if (!res.ok) {
                throw new Error(
                    res.status + " " + res.statusText
                );
            }

            const data = await res.json();

            const items = (data.tree || [])
                .filter(item =>
                    item.type === "blob" ||
                    item.type === "tree"
                )
                .map(item => ({
                    path: item.path,
                    type: item.type
                }))
                .sort((a, b) =>
                    a.path.localeCompare(b.path)
                );

            state.repoTree = {
                loadedAt: store.nowStamp(),
                items
            };

            store.saveRepoCache(state.repoTree);
        }
        catch (error) {
            state.repoTree = {
                loadedAt: store.nowStamp(),
                error: error.message,
                items: window.Chad.data.fallbackRepoItems
            };
        }

        state.repoLoading = false;
        window.Chad.ui.render();
    }

    function ensureRepoTreeLoaded() {
        const state =
            window.Chad.storage.state;

        if (
            !state.repoTree &&
            !state.repoLoading
        ) {
            loadRepoTree(false);
        }
    }

    function refreshRepoMemory() {
        const repo = window.Chad.data.repo;

        setChatInput(
`Refresh your memory about the current repo.

Repo: ${repo.owner}/${repo.repo}
Branch: ${repo.branch}
Current focus: Gandhi development.

Please use the latest repo context before answering.`
        );
    }

    actions.copyText = copyText;
    actions.setChatInput = setChatInput;
    actions.focusSource = focusSource;
    actions.scrollToTask = scrollToTask;
    actions.markDone = markDone;
    actions.deleteTask = deleteTask;
    actions.setDeadline = setDeadline;
    actions.copyRules = copyRules;
    actions.copyChatRules = copyChatRules;
    actions.addPin = addPin;
    actions.pinSelection = pinSelection;
    actions.pinLastAssistant = pinLastAssistant;
    actions.scrollToPin = scrollToPin;
    actions.rawUrl = rawUrl;
    actions.fileUrl = fileUrl;
    actions.copyRawFile = copyRawFile;
    actions.loadRepoTree = loadRepoTree;
    actions.ensureRepoTreeLoaded = ensureRepoTreeLoaded;
    actions.refreshRepoMemory = refreshRepoMemory;

    window.Chad.actions = actions;
})();
