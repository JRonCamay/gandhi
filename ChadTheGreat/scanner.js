window.Chad = window.Chad || {};

(function () {
    "use strict";

    const scanner = {};

    const PROJECT_RE =
        /(TF|MC|CH|GG|BS|CP|HA|OT)-0*(\d{1,4})/i;

    const TASK_HEADER_RE =
        /(?:^|\n)\s*(?:#+\s*)?(?:🚨\s*)?(TF|MC|CH|GG|BS|CP|HA|OT)-0*(\d{1,4})(?:\s*🚨)?[^\n]*/gi;

    function normalizeText(text) {
        return String(text || "")
            .replace(/\u00a0/g, " ")
            .replace(/\r/g, "")
            .trim();
    }

    function escapeRegex(text) {
        return String(text || "")
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function getAssistantBlocks() {
        const selectors = [
            "[data-message-author-role='assistant']",
            "article"
        ];

        const seen = new Set();
        const blocks = [];

        for (const selector of selectors) {
            for (const el of document.querySelectorAll(selector)) {
                const role =
                    el.getAttribute("data-message-author-role");

                if (
                    selector === "article" &&
                    role &&
                    role !== "assistant"
                ) {
                    continue;
                }

                const text = normalizeText(
                    el.innerText ||
                    el.textContent ||
                    ""
                );

                if (!text || text.length < 12) {
                    continue;
                }

                if (!PROJECT_RE.test(text)) {
                    continue;
                }

                const key = text.slice(0, 900);

                if (seen.has(key)) {
                    continue;
                }

                seen.add(key);
                blocks.push({ el, text });
            }
        }

        return blocks;
    }

    function cleanTitle(line, id) {
        return normalizeText(line)
            .replace(/^#+\s*/, "")
            .replace(/[🚨🔥]/g, "")
            .replace(new RegExp("^" + escapeRegex(id) + "\\s*[-—:]?\\s*", "i"), "")
            .replace(/^Title:\s*/i, "")
            .trim() || "Codex Task";
    }

    function makeId(project, number) {
        return project.toUpperCase() +
            "-" +
            String(Number(number)).padStart(3, "0");
    }

    function getTaskHeaders(text) {
        const headers = [];
        let match;

        TASK_HEADER_RE.lastIndex = 0;

        while ((match = TASK_HEADER_RE.exec(text))) {
            const project = match[1].toUpperCase();
            const number = match[2];
            const id = makeId(project, number);

            headers.push({
                project,
                number,
                id,
                index: match.index,
                line: match[0]
            });
        }

        return headers;
    }

    function extractSegments(text) {
        const headers = getTaskHeaders(text);
        const segments = [];

        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            const end =
                i + 1 < headers.length
                    ? headers[i + 1].index
                    : text.length;

            segments.push({
                ...header,
                text: text.slice(header.index, end).trim()
            });
        }

        return segments;
    }

    function isCompletionOnly(text, id) {
        const trimmed = normalizeText(text);

        return new RegExp(
            "^\\s*(?:🔥|#|\\s)*" +
            escapeRegex(id) +
            "\\s*(?:COMPLETED|done|verified)\\b",
            "i"
        ).test(trimmed) &&
            !/Codex\s+Task/i.test(trimmed) &&
            !/Commit\s*:/i.test(trimmed);
    }

    function isRealCodexTask(segment) {
        const text = normalizeText(segment.text);

        if (isCompletionOnly(text, segment.id)) {
            return false;
        }

        const hasCodexTask = /Codex\s+Task/i.test(text);
        const hasGoal = /^\s*GOAL\s*$/im.test(text) || /Goal\s*:/i.test(text);
        const hasReport = /REPORT/i.test(text);
        const hasCommit = /Commit\s*:/i.test(text);
        const hasPush = /Push\s*(to|:)?/i.test(text);
        const hasRepo = /Repository\s*:/i.test(text) || /JRonCamay\/gandhi/i.test(text);
        const hasRules = /Rules\s*:/i.test(text);
        const hasDoNotTouch = /Do\s+not\s+(touch|modify|change)/i.test(text);

        if (hasCodexTask) return true;
        if (hasCommit && hasPush) return true;
        if (hasReport && (hasRepo || hasDoNotTouch || hasCommit)) return true;
        if (hasRules && hasGoal && (hasRepo || hasPush || hasCommit)) return true;

        return false;
    }

    function extractField(text, name) {
        const lines = text.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (
                new RegExp("^" + name + "\\s*:\\s*(.*)$", "i").test(line)
            ) {
                const inline = line.replace(
                    new RegExp("^" + name + "\\s*:\\s*", "i"),
                    ""
                ).trim();

                if (inline) {
                    return inline;
                }

                for (
                    let j = i + 1;
                    j < Math.min(lines.length, i + 4);
                    j++
                ) {
                    const next = lines[j].trim();

                    if (
                        next &&
                        !/^[=-]+$/.test(next)
                    ) {
                        return next;
                    }
                }
            }
        }

        return "";
    }

    function extractTitle(segment) {
        const titleField = extractField(
            segment.text,
            "Title"
        );

        if (titleField) {
            return titleField;
        }

        const lines = segment.text
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);

        const index = lines.findIndex(line =>
            new RegExp(escapeRegex(segment.id), "i").test(line)
        );

        if (index >= 0) {
            const sameLine = cleanTitle(
                lines[index],
                segment.id
            );

            if (
                sameLine &&
                sameLine !== "Codex Task"
            ) {
                return sameLine;
            }

            for (
                let i = index + 1;
                i < Math.min(lines.length, index + 12);
                i++
            ) {
                const line = lines[i];

                if (!line) continue;
                if (/^Project:?$/i.test(line)) continue;
                if (/^Title:?$/i.test(line)) continue;
                if (/^Timestamp:?$/i.test(line)) continue;
                if (/^Codex Task/i.test(line)) continue;
                if (/^Rules:?$/i.test(line)) continue;
                if (/^Repository:?$/i.test(line)) continue;
                if (/^Folder:?$/i.test(line)) continue;
                if (/^=+$/.test(line)) continue;
                if (/^[-_*]+$/.test(line)) continue;
                if (/^Do not/i.test(line)) continue;

                return cleanTitle(line, segment.id);
            }
        }

        return "Codex Task";
    }

    function extractTimestamp(segment) {
        return extractField(
            segment.text,
            "Timestamp"
        );
    }

    function scanTasks() {
        const store = window.Chad.storage;
        const state = store.state;
        const blocks = getAssistantBlocks();
        const existing = new Map(
            state.tasks.map(task => [task.id, task])
        );

        let added = 0;
        let updated = 0;
        let skippedDeleted = 0;

        for (const block of blocks) {
            const completionMatches = [
                ...block.text.matchAll(
                    /\b(TF|MC|CH|GG|BS|CP|HA|OT)-0*(\d{1,4})\s*(?:COMPLETED|done)\b/gi
                )
            ];

            for (const match of completionMatches) {
                const id = makeId(match[1], match[2]);
                const task = existing.get(id);

                if (
                    task &&
                    task.status !== "Completed"
                ) {
                    task.status = "Completed";
                    task.completedAt =
                        task.completedAt ||
                        store.nowStamp();
                    task.updatedAt = store.nowStamp();
                    updated++;
                }
            }

            const segments = extractSegments(block.text);

            for (const segment of segments) {
                if (existing.has(segment.id)) {
                    continue;
                }

                if (store.isDeletedTaskId(segment.id)) {
                    skippedDeleted++;
                    continue;
                }

                if (!isRealCodexTask(segment)) {
                    continue;
                }

                existing.set(segment.id, {
                    id: segment.id,
                    project: segment.project,
                    title: extractTitle(segment),
                    status: "Pending",
                    deadline: "No deadline",
                    prompt: segment.text,
                    createdAt:
                        extractTimestamp(segment) ||
                        store.nowStamp(),
                    updatedAt: store.nowStamp(),
                    completedAt: "",
                    sourceSnippet: segment.text.slice(0, 700),
                    chatPath: location.pathname
                });

                added++;
            }
        }

        state.tasks = [...existing.values()].sort((a, b) => {
            if (a.project !== b.project) {
                return a.project.localeCompare(b.project);
            }

            const an = Number(a.id.replace(/\D/g, ""));
            const bn = Number(b.id.replace(/\D/g, ""));

            return an - bn;
        });

        store.saveTasks();

        if (
            window.Chad.ui &&
            typeof window.Chad.ui.render === "function"
        ) {
            window.Chad.ui.render();
        }

        const status = document.querySelector(
            "#gandhi-chad-scan-status"
        );

        if (status) {
            status.textContent =
                `Scan: +${added}, ${updated} updated, ${skippedDeleted} skipped — ${store.nowStamp()}`;
        }

        return {
            added,
            updated,
            skippedDeleted
        };
    }

    function findSourceForTask(task) {
        const blocks = getAssistantBlocks();

        return blocks.find(block =>
            block.text.includes(task.id) &&
            isRealCodexTask({
                id: task.id,
                project: task.project,
                text: block.text
            })
        ) ||
        blocks.find(block =>
            block.text.includes(task.id)
        );
    }

    scanner.normalizeText = normalizeText;
    scanner.getAssistantBlocks = getAssistantBlocks;
    scanner.getMessageBlocks = getAssistantBlocks;
    scanner.extractSegments = extractSegments;
    scanner.scanTasks = scanTasks;
    scanner.findSourceForTask = findSourceForTask;
    scanner.makeId = makeId;

    window.Chad.scanner = scanner;
})();
