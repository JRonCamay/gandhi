window.Chad = window.Chad || {};

(function () {
    "use strict";

    const checker = {};
    const REPO_OWNER = "JRonCamay";
    const REPO_NAME = "gandhi";
    const BRANCH = "main";
    const FOLDER = "ChadTheGreat";
    const SNAPSHOT_KEY = "gandhi_chad_remote_snapshot_v1";
    const LAST_PROMPT_KEY = "gandhi_chad_last_update_prompt_v1";
    const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FOLDER}?ref=${BRANCH}`;

    function loadJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        }
        catch {
            return fallback;
        }
    }

    function saveJSON(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function escapeHTML(text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;");
    }

    function normalizeRemote(items) {
        return items
            .filter(item => item && item.type === "file" && !String(item.name || "").startsWith("."))
            .map(item => ({ name: item.name, sha: item.sha, size: item.size || 0 }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    function snapshotSignature(files) {
        return JSON.stringify(files.map(file => [file.name, file.sha, file.size]));
    }

    async function fetchRemoteSnapshot() {
        const response = await fetch(API_URL, {
            headers: { "Accept": "application/vnd.github+json" },
            cache: "no-store"
        });

        if (!response.ok) throw new Error(`GitHub update check failed: ${response.status}`);

        const data = await response.json();
        return normalizeRemote(Array.isArray(data) ? data : []);
    }

    function diffSnapshots(oldFiles, newFiles) {
        const oldMap = new Map((oldFiles || []).map(file => [file.name, file]));
        const changed = [];

        for (const file of newFiles || []) {
            const old = oldMap.get(file.name);
            if (!old || old.sha !== file.sha || old.size !== file.size) changed.push(file.name);
        }

        return changed;
    }

    function updateStepsText() {
        return [
            "Run:",
            "Update-Chad.bat",
            "",
            "Then:",
            "chrome://extensions",
            "Reload ChadTheGreat",
            "Refresh ChatGPT."
        ].join("\n");
    }

    function copyUpdateSteps() {
        const text = updateStepsText();
        if (window.Chad.actions && window.Chad.actions.copyText) window.Chad.actions.copyText(text);
        else navigator.clipboard.writeText(text).catch(() => {});
    }

    function openUpdateDialog(changedFiles, manual, error) {
        const existing = document.querySelector("#gandhi-chad-update-dialog");
        if (existing) existing.remove();

        const files = changedFiles || [];
        const overlay = document.createElement("div");
        overlay.id = "gandhi-chad-update-dialog";
        Object.assign(overlay.style, {
            position: "fixed",
            inset: "0",
            zIndex: "10000000",
            background: "rgba(15,23,42,.38)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Arial, sans-serif"
        });

        const box = document.createElement("div");
        Object.assign(box.style, {
            width: "440px",
            maxWidth: "92vw",
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "14px",
            boxShadow: "0 18px 50px rgba(15,23,42,.28)",
            overflow: "hidden",
            color: "#0f172a"
        });

        const message = error
            ? `Update check failed: ${error}`
            : files.length
                ? "A newer version of ChadTheGreat has been detected."
                : "No newer ChadTheGreat files were detected.";
        const fileList = files.map(name => `• ${name}`).join("\n") || "No changed files.";

        box.innerHTML = `
            <div style="padding:12px 14px;background:#fef3c7;border-bottom:1px solid #fcd34d">
                <div style="font-size:18px;font-weight:900">🚀 New Chad Update Available</div>
                <div style="font-size:12px;color:#64748b;margin-top:3px">${escapeHTML(message)}</div>
            </div>
            <div style="padding:14px;font-size:13px;line-height:1.45">
                <b>Changed files:</b> ${files.length}
                <pre style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px;white-space:pre-wrap;font-size:12px;max-height:150px;overflow:auto">${escapeHTML(fileList)}</pre>
                <div style="margin-top:8px">
                    Run:<br><b>Update-Chad.bat</b><br><br>
                    Then:<br><b>chrome://extensions</b><br>
                    Reload ChadTheGreat<br>
                    Refresh ChatGPT.
                </div>
            </div>
            <div style="padding:10px 14px;border-top:1px solid #e2e8f0;display:flex;gap:7px;justify-content:flex-end">
                <button data-close-update="1" style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:7px;padding:6px 10px;cursor:pointer">Close</button>
                <button data-copy-update="1" style="background:#dcfce7;border:1px solid #86efac;border-radius:7px;padding:6px 10px;cursor:pointer;font-weight:800">Copy Update Steps</button>
            </div>`;

        overlay.appendChild(box);
        overlay.addEventListener("click", event => {
            if (event.target === overlay || event.target.dataset.closeUpdate) overlay.remove();
            if (event.target.dataset.copyUpdate) copyUpdateSteps();
        });

        document.body.appendChild(overlay);
    }

    async function checkForUpdates(manual) {
        try {
            const remote = await fetchRemoteSnapshot();
            const saved = loadJSON(SNAPSHOT_KEY, null);
            const changed = saved && saved.files ? diffSnapshots(saved.files, remote) : [];

            saveJSON(SNAPSHOT_KEY, {
                checkedAt: Date.now(),
                signature: snapshotSignature(remote),
                files: remote
            });

            if (changed.length) {
                const lastPrompt = Number(localStorage.getItem(LAST_PROMPT_KEY) || 0);
                const shouldPrompt = manual || (Date.now() - lastPrompt > 1000 * 60 * 30);

                if (shouldPrompt) {
                    localStorage.setItem(LAST_PROMPT_KEY, String(Date.now()));
                    openUpdateDialog(changed, manual);
                }

                return { hasUpdate: true, changed };
            }

            if (manual) openUpdateDialog([], true);
            return { hasUpdate: false, changed: [] };
        }
        catch (error) {
            if (manual) openUpdateDialog([], true, error.message);
            return { hasUpdate: false, changed: [], error: error.message };
        }
    }

    function start() {
        setTimeout(() => checkForUpdates(false), 5000);
        setInterval(() => checkForUpdates(false), 1000 * 60 * 20);
    }

    checker.checkForUpdates = checkForUpdates;
    checker.openUpdateDialog = openUpdateDialog;

    window.Chad.updateChecker = checker;
    start();
})();