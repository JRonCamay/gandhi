// ==UserScript==
// @name         GitGit Big GitHub Editor
// @namespace    http://tampermonkey.net/
// @version      3.8.0
// @description  Full-window JavaScript editor with internal Search/Replace/Function panel and editor undo/redo, colored preview, GitHub accounts, file tree, load, and commit
// @author       You
// @match        https://github.com/*
// @match        https://example.com/*
// @match        https://raw.githubusercontent.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    if (window.__gitgitBigEditorModularLoaded === '3.8.0') return;
    window.__gitgitBigEditorModularLoaded = '3.8.0';

    function prepareStandalonePage() {
        const style = document.createElement('style');
        style.textContent = `
            html,
            body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: 100% !important;
                overflow: hidden !important;
                background: #0d1117 !important;
            }

            body > *:not(#gitgit-big-editor):not(#gitgit-style):not(#gitgit-mini-launcher) {
                display: none !important;
            }
        `;
        style.id = 'gitgit-standalone-page-style';
        document.documentElement.appendChild(style);

        const theme = document.createElement('style');
        theme.id = 'gitgit-readable-theme';
        theme.textContent = `
            #gitgit-big-editor,
            #gitgit-big-editor * {
                text-shadow: none !important;
            }

            #gitgit-big-editor {
                background: #1a1d21 !important;
                color: #f5f7fa !important;
            }

            #gitgit-big-editor input,
            #gitgit-big-editor textarea,
            #gitgit-big-editor select {
                background: #111418 !important;
                color: #ffffff !important;
                border-color: #4b5563 !important;
            }

            #gitgit-big-editor input::placeholder,
            #gitgit-big-editor textarea::placeholder {
                color: #b8c0cc !important;
                opacity: 1 !important;
            }

            #gitgit-big-editor button {
                color: #ffffff !important;
                border-color: #4b5563 !important;
            }

            #gitgit-code-area {
                background: #1a1d21 !important;
                color: #f5f7fa !important;
                caret-color: #ffffff !important;
            }

            #gitgit-code-area::selection {
                background: #264f78 !important;
                color: #ffffff !important;
            }

            #gitgit-line-gutter {
                background: #171a1f !important;
                color: #d5dbe3 !important;
                border-right-color: #3d4552 !important;
            }

            #gitgit-big-editor [style*="#010409"] {
                background: #171a1f !important;
            }

            #gitgit-big-editor [style*="#0d1117"] {
                background: #1a1d21 !important;
            }

            #gitgit-big-editor [style*="#161b22"] {
                background: #23272e !important;
            }

            #gitgit-big-editor [style*="#21262d"] {
                background: #2b313a !important;
            }

            #gitgit-big-editor [style*="#30363d"] {
                border-color: #3d4552 !important;
            }

            #gitgit-big-editor [style*="#8b949e"] {
                color: #d5dbe3 !important;
            }

            #gitgit-big-editor [style*="#c9d1d9"] {
                color: #f5f7fa !important;
            }

            #gitgit-big-editor [style*="#6e7681"] {
                color: #c7ced8 !important;
            }
        `;
        document.documentElement.appendChild(theme);
    }



    const STORAGE_KEY = 'gitgit_big_editor_settings_v1';

    function loadSettings() {
        try {
            const data =
                JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

            if (!data.accounts) {
                data.accounts = {};
            }

            return data;
        } catch (e) {
            return {
                accounts: {}
            };
        }
    }

    function saveSettings(settings) {
        if (!settings.accounts) {
            settings.accounts = {};
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }

    function getCurrentAccountName() {
        return settings.currentAccount || 'Default';
    }

    function getCurrentAccount() {
        const name = getCurrentAccountName();

        if (!settings.accounts) {
            settings.accounts = {};
        }

        if (!settings.accounts[name]) {
            settings.accounts[name] = {};
        }

        return settings.accounts[name];
    }

    function saveCurrentFieldsToAccount() {
        const name =
            accountSelect.value ||
            'Default';

        settings.currentAccount = name;

        if (!settings.accounts) {
            settings.accounts = {};
        }

        settings.accounts[name] = {
            owner: ownerInput.value.trim(),
            repo: repoInput.value.trim(),
            branch: branchInput.value.trim(),
            path: pathInput.value.trim(),
            token: tokenInput.value.trim()
        };

        saveSettings(settings);
    }

    function refreshAccountSelect() {
        accountSelect.innerHTML = '';

        if (!settings.accounts) {
            settings.accounts = {};
        }

        const names =
            Object.keys(settings.accounts);

        if (!names.includes('Default')) {
            names.unshift('Default');
        }

        names.forEach(name => {
            const option =
                document.createElement('option');

            option.value = name;
            option.textContent = name;

            accountSelect.appendChild(option);
        });

        accountSelect.value = getCurrentAccountName();
    }

    function loadAccountIntoFields(name) {
        settings.currentAccount = name;

        const account =
            settings.accounts && settings.accounts[name]
                ? settings.accounts[name]
                : {};

        ownerInput.value = account.owner || 'JRonCamay';
        repoInput.value = account.repo || 'gandhi';
        branchInput.value = account.branch || 'main';
        pathInput.value = account.path || 'TransformBoxTool.js';
        tokenInput.value = account.token || '';

        saveSettings(settings);
    }

    function createEl(tag, props) {
        const el = document.createElement(tag);

        if (props) {
            Object.keys(props).forEach(key => {
                if (key === 'style') {
                    el.style.cssText = props[key];
                    return;
                }

                if (key === 'text') {
                    el.innerText = props[key];
                    return;
                }

                if (key === 'html') {
                    el.innerHTML = props[key];
                    return;
                }

                el[key] = props[key];
            });
        }

        return el;
    }

    const style = createEl('style', {
        text: `
            #gitgit-big-editor * {
                box-sizing: border-box;
            }

            #gitgit-big-editor input,
            #gitgit-big-editor textarea,
            #gitgit-big-editor button {
                font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif;
            }

            #gitgit-code-area::-webkit-scrollbar,
            #gitgit-line-gutter::-webkit-scrollbar {
                width: 18px;
                height: 18px;
            }

            #gitgit-code-area::-webkit-scrollbar-track,
            #gitgit-line-gutter::-webkit-scrollbar-track {
                background: #1a1d21;
            }

            #gitgit-code-area::-webkit-scrollbar-thumb,
            #gitgit-line-gutter::-webkit-scrollbar-thumb {
                background: #6e7681;
                border-radius: 8px;
                border: 4px solid #0d1117;
            }

            #gitgit-mini-search-panel textarea {
                overflow: auto !important;
                scrollbar-width: thin;
                scrollbar-color: #6e7681 #0d1117;
            }

            #gitgit-mini-search-panel textarea::-webkit-scrollbar {
                width: 18px;
                height: 18px;
            }

            #gitgit-mini-search-panel textarea::-webkit-scrollbar-track {
                background: #1a1d21;
            }

            #gitgit-mini-search-panel textarea::-webkit-scrollbar-thumb {
                background: #6e7681;
                border-radius: 8px;
                border: 4px solid #0d1117;
            }
        `
    });

    document.head.appendChild(style);

    let settings = loadSettings();
    let currentAccount = getCurrentAccount();

    let currentContentSha = '';
    let currentSearch = '';
    let currentSearchIndex = -1;
    let statusTimer = null;

    const launcher = createEl('button', {
        text: '🐒✍️',
        title: 'Open GitGit Editor',
        style: `
            position: fixed;
            right: 80px;
            bottom: 20px;
            width: 46px;
            height: 46px;
            border-radius: 50%;
            border: 1px solid #30363d;
            background: #23272e;
            color: #f5f7fa;
            font-size: 24px;
            cursor: pointer;
            z-index: 999999;
            box-shadow: 0 6px 18px rgba(0,0,0,0.45);
        
            display: none !important;`
    });

    document.body.appendChild(launcher);

    const overlay = createEl('div', {
        id: 'gitgit-big-editor',
        style: `
            position: fixed;
            inset: 0;
            display: flex;
            flex-direction: column;
            background: #1a1d21;
            color: #f5f7fa;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif;
        `
    });

    const header = createEl('div', {
        style: `
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 12px;
            background: #23272e;
            border-bottom: 1px solid #30363d;
            flex-shrink: 0;
        `
    });

    const title = createEl('div', {
        html: '<strong>GitGit Big GitHub Editor v3.8</strong>',
        style: `
            font-size: 14px;
            color: #f0f6fc;
        `
    });

    const closeBtn = createEl('button', {
        text: '✕',
        style: `
            width: 32px;
            height: 28px;
            border: none;
            border-radius: 4px;
            background: #30363d;
            color: #f5f7fa;
            cursor: pointer;
            font-size: 14px;
        
            display: none !important;`
    });

    header.appendChild(title);
    header.appendChild(closeBtn);

    const githubBar = createEl('div', {
        style: `
            display: grid;
            grid-template-columns: 220px 34px 220px 220px 90px minmax(260px, 1fr) 34px auto auto auto;
            gap: 6px;
            padding: 8px;
            background: #1a1d21;
            border-bottom: 1px solid #30363d;
            flex-shrink: 0;
        `
    });

    function smallInput(placeholder, value, type) {
        return createEl('input', {
            type: type || 'text',
            placeholder,
            value: value || '',
            style: `
                height: 30px;
                background: #171a1f;
                color: #f5f7fa;
                border: 1px solid #30363d;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 12px;
                min-width: 0;
            `
        });
    }

    function smallSelect() {
        const select = createEl('select', {
            style: `
                height: 30px;
                background: #171a1f;
                color: #f5f7fa;
                border: 1px solid #30363d;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 12px;
                min-width: 0;
            `
        });

        return select;
    }

    const accountSelect = smallSelect();

    const ownerInput = smallInput('owner', currentAccount.owner || 'JRonCamay');
    const repoInput = smallInput('repo', currentAccount.repo || 'gandhi');
    const branchInput = smallInput('branch', currentAccount.branch || 'main');
    const pathInput = smallInput('file path', currentAccount.path || 'TransformBoxTool.js');
    const tokenInput = smallInput('GitHub token for commit', currentAccount.token || '', 'password');
    tokenInput.style.display = 'none';
    tokenInput.style.maxWidth = '260px';

    const tokenLockBtn = barButton('🔒', '#30363d');
    tokenLockBtn.title = 'Show/hide GitHub token';
    tokenLockBtn.style.width = '32px';
    tokenLockBtn.style.minWidth = '32px';
    tokenLockBtn.style.padding = '0';

    function barButton(label, color) {
        return createEl('button', {
            text: label,
            style: `
                height: 30px;
                background: ${color || '#238636'};
                color: white;
                border: none;
                border-radius: 4px;
                padding: 0 10px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                white-space: nowrap;
            `
        });
    }

    const saveAccountBtn = barButton('Save', '#30363d');
    const newAccountBtn = barButton('👤', '#30363d');
    newAccountBtn.title = 'New account';
    newAccountBtn.style.width = '32px';
    newAccountBtn.style.minWidth = '32px';
    newAccountBtn.style.padding = '0';

    const loadBtn = barButton('Load', '#1f6feb');
    const filesBtn = barButton('Files', '#30363d');
    const commitBtn = barButton('Commit', '#238636');

    githubBar.appendChild(accountSelect);
    githubBar.appendChild(newAccountBtn);
    githubBar.appendChild(ownerInput);
    githubBar.appendChild(repoInput);
    githubBar.appendChild(branchInput);
    githubBar.appendChild(pathInput);
    githubBar.appendChild(tokenLockBtn);
    githubBar.appendChild(tokenInput);
    githubBar.appendChild(loadBtn);
    githubBar.appendChild(filesBtn);
    githubBar.appendChild(commitBtn);
    githubBar.appendChild(saveAccountBtn);

    const fileTreePanel = createEl('div', {
        style: `
            display: none;
            max-height: 260px;
            overflow: auto;
            background: #171a1f;
            border-bottom: 1px solid #30363d;
            padding: 8px;
            font-family: Consolas, Menlo, Monaco, monospace;
            font-size: 12px;
            flex-shrink: 0;
        `
    });

    const toolBar = createEl('div', {
        style: `
            display: grid;
            grid-template-columns: minmax(260px, 1fr) minmax(260px, 1fr) auto auto auto auto auto auto auto;
            gap: 6px;
            padding: 8px;
            background: #1a1d21;
            border-bottom: 1px solid #30363d;
            flex-shrink: 0;
        `
    });

    const searchInput = smallInput('Search exact text');
    const replaceInput = smallInput('Replace with');
    const searchBtn = barButton('Search', '#21262d');
    const replaceBtn = barButton('Replace', '#8957e5');
    const replaceAllBtn = barButton('Replace All', '#8957e5');
    const syntaxBtn = barButton('🐵', '#6f42c1');
    const robotBtn = barButton('🤖', '#0969da');
    const undoBtn = barButton('Undo', '#30363d');
    const redoBtn = barButton('Redo', '#30363d');

    toolBar.appendChild(searchInput);
    toolBar.appendChild(replaceInput);
    toolBar.appendChild(searchBtn);
    toolBar.appendChild(replaceBtn);
    toolBar.appendChild(replaceAllBtn);
    toolBar.appendChild(syntaxBtn);
    toolBar.appendChild(robotBtn);
    toolBar.appendChild(undoBtn);
    toolBar.appendChild(redoBtn);

    const editorWrap = createEl('div', {
        style: `
            display: flex;
            flex: 1;
            min-height: 0;
            background: #1a1d21;
        `
    });

    const lineGutter = createEl('div', {
        id: 'gitgit-line-gutter',
        style: `
            width: 64px;
            flex-shrink: 0;
            overflow: hidden;
            background: #171a1f;
            color: #c7ced8;
            border-right: 1px solid #30363d;
            padding: 10px 8px 10px 0;
            text-align: right;
            font-family: Consolas, Menlo, Monaco, monospace;
            font-size: 13px;
            line-height: 20px;
            user-select: none;
            white-space: pre;
        `
    });

    const codeArea = createEl('textarea', {
        id: 'gitgit-code-area',
        spellcheck: false,
        placeholder: 'Paste JavaScript here, or load from GitHub...',
        style: `
            flex: 1;
            min-width: 0;
            resize: none;
            border: none;
            outline: none;
            overflow: auto;
            background: #1a1d21;
            color: #f5f7fa;
            padding: 10px;
            font-family: Consolas, Menlo, Monaco, monospace;
            font-size: 13px;
            line-height: 20px;
            tab-size: 4;
            white-space: pre;
        `
    });

    editorWrap.appendChild(lineGutter);
    editorWrap.appendChild(codeArea);

    const currentLineHighlight = createEl('div', {
        style: `
            position: absolute;
            left: 64px;
            right: 0;
            top: 0;
            height: 20px;
            background: rgba(255, 255, 255, 0.045);
            border-top: 1px solid rgba(255, 255, 255, 0.055);
            border-bottom: 1px solid rgba(255, 255, 255, 0.055);
            pointer-events: none;
            display: none;
            z-index: 1;
        `
    });

    editorWrap.style.position = 'relative';
    editorWrap.appendChild(currentLineHighlight);

    const rightTreePanel = createEl('div', {
        style: `
            width: 280px;
            min-width: 220px;
            max-width: 360px;
            display: flex;
            flex-direction: column;
            background: #171a1f;
            border-right: 1px solid #30363d;
            color: #f5f7fa;
            flex-shrink: 0;
            order: -3;
        `
    });

    const rightTreeHeader = createEl('div', {
        style: `
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 6px;
            padding: 6px;
            background: #23272e;
            border-bottom: 1px solid #30363d;
            font-size: 12px;
            flex-shrink: 0;
        `
    });

    const rightTreeTitle = createEl('div', {
        text: 'Files',
        style: `
            font-weight: 600;
            color: #f0f6fc;
            white-space: nowrap;
            margin-right: auto;
        `
    });

    const rightTreeRefreshBtn = createEl('button', {
        text: '⟳',
        title: 'Refresh file tree',
        style: `
            width: 26px;
            height: 23px;
            background: #2b313a;
            color: #f5f7fa;
            border: 1px solid #30363d;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `
    });

    const rightTreeCloseBtn = createEl('button', {
        text: '‹',
        title: 'Collapse file tree',
        style: `
            width: 26px;
            height: 23px;
            background: #2b313a;
            color: #f5f7fa;
            border: 1px solid #30363d;
            border-radius: 4px;
            cursor: pointer;
            font-size: 15px;
            line-height: 18px;
        `
    });

    rightTreeHeader.appendChild(rightTreeTitle);
    rightTreeHeader.appendChild(rightTreeRefreshBtn);
    rightTreeHeader.appendChild(rightTreeCloseBtn);

    const rightTreeSearch = createEl('input', {
        type: 'text',
        placeholder: 'Filter files...',
        style: `
            height: 28px;
            margin: 6px;
            background: #1a1d21;
            color: #f5f7fa;
            border: 1px solid #30363d;
            border-radius: 4px;
            padding: 4px 7px;
            font-size: 12px;
            flex-shrink: 0;
        `
    });

    const rightTreeList = createEl('div', {
        style: `
            flex: 1;
            overflow: auto;
            padding: 4px;
            font-family: Consolas, Menlo, Monaco, monospace;
            font-size: 12px;
        `,
        html: '<div style="color:#8b949e;padding:8px;">Loading tree...</div>'
    });

    const leftTreeCollapseBar = createEl('button', {
        text: '›',
        title: 'Open file tree',
        style: `
            width: 16px;
            min-width: 16px;
            display: none;
            align-items: center;
            justify-content: center;
            background: #23272e;
            color: #d5dbe3;
            border: none;
            border-right: 1px solid #30363d;
            cursor: pointer;
            font-size: 16px;
            order: -3;
            flex-shrink: 0;
        `
    });

    rightTreePanel.appendChild(rightTreeHeader);
    rightTreePanel.appendChild(rightTreeSearch);
    rightTreePanel.appendChild(rightTreeList);
    editorWrap.insertBefore(rightTreePanel, lineGutter);
    editorWrap.insertBefore(leftTreeCollapseBar, lineGutter);

    const editorCopyCorner = createEl('div', {
        style: `
            position: absolute;
            top: 8px;
            right: 42px;
            display: flex;
            gap: 6px;
            z-index: 4;
            pointer-events: auto;
        `
    });

    const editorCopyAllBtn = createEl('button', {
        text: '⧉',
        title: 'Copy all editor text',
        style: `
            width: 28px;
            height: 24px;
            border-radius: 8px;
            background: #2b313a;
            color: #f5f7fa;
            border: 1px solid #30363d;
            cursor: pointer;
            font-size: 13px;
        `
    });

    const editorCopySelectionBtn = createEl('button', {
        text: '▣',
        title: 'Copy selection',
        style: `
            width: 28px;
            height: 24px;
            border-radius: 8px;
            background: #2b313a;
            color: #f5f7fa;
            border: 1px solid #30363d;
            cursor: pointer;
            font-size: 12px;
        `
    });

    editorCopyCorner.appendChild(editorCopyAllBtn);
    editorCopyCorner.appendChild(editorCopySelectionBtn);
    editorWrap.appendChild(editorCopyCorner);


    const previewBar = createEl('div', {
        style: `
            display: flex;
            height: 24px;
            align-items: center;
            justify-content: space-between;
            background: #23272e;
            color: #d5dbe3;
            border-top: 1px solid #30363d;
            border-bottom: 1px solid #30363d;
            padding: 0 8px;
            font-size: 12px;
            cursor: pointer;
            user-select: none;
            flex-shrink: 0;
        `
    });

    const previewBarTitle = createEl('span', {
        text: 'Preview',
        style: `
            font-weight: 600;
            color: #f5f7fa;
        `
    });

    const previewBarIcon = createEl('span', {
        text: '▾',
        style: `
            color: #d5dbe3;
            font-size: 13px;
        `
    });

    previewBar.appendChild(previewBarTitle);
    previewBar.appendChild(previewBarIcon);

    const previewPanel = createEl('div', {
        style: `
            display: none;
            height: 32%;
            min-height: 160px;
            max-height: 360px;
            overflow: auto;
            background: #171a1f;
            color: #f5f7fa;
            border-top: 1px solid #30363d;
            padding: 10px;
            font-family: Consolas, Menlo, Monaco, monospace;
            font-size: 12px;
            line-height: 18px;
            white-space: normal;
            flex-shrink: 0;
        `
    });

    const statusBar = createEl('div', {
        text: 'Ready',
        style: `
            min-height: 26px;
            padding: 5px 8px;
            background: #23272e;
            color: #d5dbe3;
            border-top: 1px solid #30363d;
            font-size: 12px;
            flex-shrink: 0;
        `
    });


    const miniPanel = createEl('div', {
        id: 'gitgit-mini-search-panel',
        style: `
            position: absolute;
            right: 18px;
            bottom: 38px;
            width: 455px;
            background: #1a1d21;
            color: #f5f7fa;
            border: 1px solid #30363d;
            border-radius: 6px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.55);
            z-index: 5;
            display: none;
            flex-direction: column;
            overflow: hidden;
        `
    });

    const miniHeader = createEl('div', {
        style: `
            height: 34px;
            background: #23272e;
            color: #f0f6fc;
            border-bottom: 1px solid #30363d;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 8px 0 10px;
            font-size: 12px;
            cursor: move;
            user-select: none;
        `
    });

    const miniTitle = createEl('div', {
        html: '<strong>Git Git - Search/Replace Tool</strong> <span style="font-size:11px;color:#8b949e;">(Inside GitGit)</span>'
    });

    const miniCloseBtn = createEl('button', {
        text: '[_]',
        style: `
            width: 28px;
            height: 24px;
            background: transparent;
            color: #f5f7fa;
            border: none;
            cursor: pointer;
            font-weight: bold;
        `
    });

    miniHeader.appendChild(miniTitle);
    miniHeader.appendChild(miniCloseBtn);

    const miniBody = createEl('div', {
        style: `
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 3px;
        `
    });

    const miniSearchWrap = createEl('div', {
        style: `
            position: relative;
            width: 100%;
        `
    });

    const miniSearchBox = createEl('textarea', {
        placeholder: 'Target text or function...',
        spellcheck: false,
        style: `
            width: 100%;
            height: 138px;
            background: #1a1d21;
            color: #f5f7fa;
            border: 1px solid #30363d;
            border-radius: 4px;
            resize: vertical;
            padding: 6px;
            padding-right: 54px;
            box-sizing: border-box;
            font-family: Consolas, Menlo, Monaco, monospace;
            font-size: 12px;
        `
    });

    const miniCopyBtn = createEl('button', {
        html: '⧉',
        title: 'Copy search box',
        style: `
            position: absolute;
            right: 18px;
            top: 6px;
            width: 26px;
            height: 24px;
            background: #23272e;
            color: #f5f7fa;
            border: 1px solid #30363d;
            border-radius: 4px;
            cursor: pointer;
        `
    });

    miniSearchWrap.appendChild(miniSearchBox);
    miniSearchWrap.appendChild(miniCopyBtn);

    const miniReplaceLabel = createEl('div', {
        text: 'Replace Box',
        style: `
            padding: 2px 8px;
            background: #23272e;
            border: 1px solid #30363d;
            border-radius: 4px;
            font-size: 12px;
            color: #d5dbe3;
            user-select: none;
            line-height: 16px;
        `
    });

    const miniReplaceBox = createEl('textarea', {
        placeholder: 'Replace with...',
        spellcheck: false,
        style: `
            width: 100%;
            height: 138px;
            background: #1a1d21;
            color: #f5f7fa;
            border: 1px solid #30363d;
            border-radius: 4px;
            resize: vertical;
            padding: 6px;
            box-sizing: border-box;
            font-family: Consolas, Menlo, Monaco, monospace;
            font-size: 12px;
        `
    });

    const miniButtonRow = createEl('div', {
        style: `
            display: flex;
            gap: 5px;
        `
    });

    function miniButton(label, color) {
        return createEl('button', {
            html: label,
            style: `
                flex: 1;
                height: 30px;
                background: ${color};
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
            `
        });
    }

    const miniSearchBtn = miniButton('Search', '#21262d');
    const miniFunctionBtn = miniButton('🔍 Function()', '#1f6feb');
    const miniReplaceBtn = miniButton('Replace', '#238636');

    miniButtonRow.appendChild(miniSearchBtn);
    miniButtonRow.appendChild(miniFunctionBtn);
    miniButtonRow.appendChild(miniReplaceBtn);

    miniBody.appendChild(miniSearchWrap);
    miniBody.appendChild(miniReplaceLabel);
    miniBody.appendChild(miniReplaceBox);
    miniBody.appendChild(miniButtonRow);

    miniPanel.appendChild(miniHeader);
    miniPanel.appendChild(miniBody);

    const miniLauncher = createEl('button', {
        text: '🔎',
        title: 'Open embedded search/replace panel',
        style: `
            position: absolute;
            right: 64px;
            bottom: 4px;
            width: 28px;
            height: 22px;
            background: #2b313a;
            color: #f5f7fa;
            border: 1px solid #30363d;
            border-radius: 4px;
            cursor: pointer;
            z-index: 6;
            font-size: 13px;
        `
    });

    overlay.appendChild(header);
    overlay.appendChild(githubBar);
    overlay.appendChild(fileTreePanel);
    overlay.appendChild(toolBar);
    overlay.appendChild(editorWrap);
    overlay.appendChild(previewBar);
    overlay.appendChild(previewPanel);
    overlay.appendChild(miniPanel);
    overlay.appendChild(miniLauncher);
    overlay.appendChild(statusBar);

    // Do not attach the full editor to the page on load.
    // It will be attached only when the 🙈 launcher is clicked.

    function setStatus(message, type) {
        statusBar.innerText = message;

        if (statusTimer) {
            clearTimeout(statusTimer);
            statusTimer = null;
        }

        if (type === 'error') {
            statusBar.style.background = '#3b1111';
            statusBar.style.color = '#ffb4b4';
            statusBar.style.borderTopColor = '#8b1a1a';

            statusTimer = setTimeout(() => {
                statusBar.innerText = 'Ready';
                statusBar.style.background = '#161b22';
                statusBar.style.color = '#8b949e';
                statusBar.style.borderTopColor = '#30363d';
            }, 3000);

            return;
        }

        if (type === 'success') {
            statusBar.style.background = '#102b17';
            statusBar.style.color = '#9be9a8';
            statusBar.style.borderTopColor = '#238636';

            statusTimer = setTimeout(() => {
                statusBar.style.background = '#161b22';
                statusBar.style.color = '#8b949e';
                statusBar.style.borderTopColor = '#30363d';
            }, 3000);

            return;
        }

        statusBar.style.background = '#161b22';
        statusBar.style.color = '#8b949e';
        statusBar.style.borderTopColor = '#30363d';
    }

    function rememberGithubFields() {
        saveCurrentFieldsToAccount();
    }

    function updateLineNumbers() {
        const lines = codeArea.value.split('\n').length;
        let out = '';

        for (let i = 1; i <= lines; i++) {
            out += i + '\n';
        }

        lineGutter.textContent = out;
    }

    function syncScroll() {
        lineGutter.scrollTop = codeArea.scrollTop;
    }


    let editorUndoStack = [];
    let editorRedoStack = [];
    let editorHistoryLocked = false;
    let editorLastSnapshot = null;

    function getEditorSnapshot() {
        return {
            value: codeArea.value,
            selectionStart: codeArea.selectionStart || 0,
            selectionEnd: codeArea.selectionEnd || 0,
            scrollTop: codeArea.scrollTop || 0,
            scrollLeft: codeArea.scrollLeft || 0
        };
    }

    function sameSnapshot(a, b) {
        return (
            a &&
            b &&
            a.value === b.value &&
            a.selectionStart === b.selectionStart &&
            a.selectionEnd === b.selectionEnd
        );
    }

    function restoreEditorSnapshot(snapshot) {
        if (!snapshot) return;

        editorHistoryLocked = true;

        codeArea.value = snapshot.value;
        updateLineNumbers();
        updateCurrentLineHighlight();

        codeArea.scrollTop = snapshot.scrollTop || 0;
        codeArea.scrollLeft = snapshot.scrollLeft || 0;
        lineGutter.scrollTop = codeArea.scrollTop;

        codeArea.focus();
        codeArea.setSelectionRange(
            snapshot.selectionStart || 0,
            snapshot.selectionEnd || 0
        );

        if (previewPanel.style.display === 'block') {
            updatePreviewPanel();
        }

        editorLastSnapshot = getEditorSnapshot();
        editorHistoryLocked = false;
    }

    function resetEditorHistory() {
        editorUndoStack = [];
        editorRedoStack = [];
        editorLastSnapshot = getEditorSnapshot();
    }

    function pushEditorHistorySnapshot(snapshot) {
        if (editorHistoryLocked) return;

        const snap =
            snapshot || getEditorSnapshot();

        const last =
            editorUndoStack[editorUndoStack.length - 1];

        if (
            sameSnapshot(last, snap) ||
            sameSnapshot(editorLastSnapshot, snap)
        ) {
            return;
        }

        editorUndoStack.push(snap);
        editorRedoStack = [];
        editorLastSnapshot = snap;
    }

    function recordBeforeEditorChange() {
        if (editorHistoryLocked) return;

        const snap = getEditorSnapshot();
        const last = editorUndoStack[editorUndoStack.length - 1];

        if (!sameSnapshot(last, snap)) {
            editorUndoStack.push(snap);
            editorRedoStack = [];
        }
    }

    function editorUndo() {
        if (!editorUndoStack.length) {
            setStatus('Nothing to undo');
            return;
        }

        const current = getEditorSnapshot();
        const previous = editorUndoStack.pop();

        editorRedoStack.push(current);
        restoreEditorSnapshot(previous);

        setStatus('Undo', 'success');
    }

    function editorRedo() {
        if (!editorRedoStack.length) {
            setStatus('Nothing to redo');
            return;
        }

        const current = getEditorSnapshot();
        const next = editorRedoStack.pop();

        editorUndoStack.push(current);
        restoreEditorSnapshot(next);

        setStatus('Redo', 'success');
    }

    function replaceEditorValue(nextValue, selectionStart, selectionEnd, options) {
        const opts = options || {};
        const oldScrollTop = codeArea.scrollTop;
        const oldScrollLeft = codeArea.scrollLeft;

        recordBeforeEditorChange();

        editorHistoryLocked = true;
        codeArea.value = nextValue;
        updateLineNumbers();
        updateCurrentLineHighlight();

        if (previewPanel.style.display === 'block') {
            updatePreviewPanel();
        }

        codeArea.focus();

        if (
            typeof selectionStart === 'number' &&
            typeof selectionEnd === 'number'
        ) {
            codeArea.setSelectionRange(selectionStart, selectionEnd);
        }

        if (opts.keepScroll) {
            codeArea.scrollTop = oldScrollTop;
            codeArea.scrollLeft = oldScrollLeft;
            lineGutter.scrollTop = codeArea.scrollTop;
        } else if (typeof selectionStart === 'number') {
            revealEditorRange(selectionStart, selectionEnd || selectionStart);
        }

        editorHistoryLocked = false;
        editorLastSnapshot = getEditorSnapshot();
    }

    function getEditorIndexLineAndColumn(index) {
        const before = codeArea.value.slice(0, index);
        const parts = before.split('\n');

        return {
            lineIndex: parts.length - 1,
            columnIndex: parts[parts.length - 1].length
        };
    }

    function isEditorIndexVisible(index) {
        const pos = getEditorIndexLineAndColumn(index);
        const lineHeight =
            parseFloat(getComputedStyle(codeArea).lineHeight) || 20;

        const y = pos.lineIndex * lineHeight;

        return (
            y >= codeArea.scrollTop &&
            y <= codeArea.scrollTop + codeArea.clientHeight - lineHeight
        );
    }

    function revealEditorRange(start, end) {
        if (start < 0) return;

        const pos = getEditorIndexLineAndColumn(start);

        const lineHeight =
            parseFloat(getComputedStyle(codeArea).lineHeight) || 20;

        const approximateCharWidth = 8;

        const targetTop =
            Math.max(
                0,
                (pos.lineIndex * lineHeight) - (codeArea.clientHeight * 0.35)
            );

        const targetLeft =
            Math.max(
                0,
                (pos.columnIndex * approximateCharWidth) - 80
            );

        codeArea.scrollTop = targetTop;
        codeArea.scrollLeft = targetLeft;
        lineGutter.scrollTop = codeArea.scrollTop;
        updateCurrentLineHighlight();

        requestAnimationFrame(() => {
            codeArea.focus();
            codeArea.setSelectionRange(start, end);

            codeArea.scrollTop = targetTop;
            codeArea.scrollLeft = targetLeft;
            lineGutter.scrollTop = codeArea.scrollTop;
            updateCurrentLineHighlight();
        });
    }

    function updateCurrentLineHighlight() {
        if (!currentLineHighlight || overlay.style.display !== 'flex') {
            return;
        }

        const lineHeight =
            parseFloat(getComputedStyle(codeArea).lineHeight) || 20;

        const index =
            codeArea.selectionStart || 0;

        const lineIndex =
            (codeArea.value.slice(0, index).match(/\n/g) || []).length;

        const top =
            10 +
            (lineIndex * lineHeight) -
            codeArea.scrollTop;

        currentLineHighlight.style.left =
            codeArea.offsetLeft + 'px';

        currentLineHighlight.style.right =
            Math.max(
                0,
                editorWrap.clientWidth -
                    codeArea.offsetLeft -
                    codeArea.clientWidth
            ) + 'px';

        currentLineHighlight.style.top =
            top + 'px';

        currentLineHighlight.style.height =
            lineHeight + 'px';

        currentLineHighlight.style.display =
            top >= 0 && top <= codeArea.clientHeight
                ? 'block'
                : 'none';
    }

    function getLineNumberFromIndex(textValue, index) {
        return (textValue.slice(0, index).match(/\n/g) || []).length + 1;
    }

    function getAllExactMatchIndexes(textValue, query) {
        const indexes = [];
        if (!query) return indexes;

        let start = 0;

        while (true) {
            const index = textValue.indexOf(query, start);
            if (index === -1) break;

            indexes.push(index);
            start = index + Math.max(1, query.length);
        }

        return indexes;
    }

    function checkJavaScriptSyntax(codeText) {
        if (!codeText.trim()) {
            return {
                ok: false,
                message: 'No code to check'
            };
        }

        try {
            new Function(codeText);
            return {
                ok: true,
                message: 'Syntax OK'
            };
        } catch (error) {
            return {
                ok: false,
                message: error && error.message ? error.message : String(error)
            };
        }
    }

    function countIndentOpeners(line) {
        let count = 0;
        let quote = null;
        let inBlockComment = false;

        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            const next = line[i + 1];

            if (inBlockComment) {
                if (ch === '*' && next === '/') {
                    inBlockComment = false;
                    i++;
                }
                continue;
            }

            if (quote) {
                if (ch === '\\') {
                    i++;
                    continue;
                }

                if (ch === quote) {
                    quote = null;
                }

                continue;
            }

            if (ch === '/' && next === '/') break;

            if (ch === '/' && next === '*') {
                inBlockComment = true;
                i++;
                continue;
            }

            if (ch === '"' || ch === "'" || ch === '`') {
                quote = ch;
                continue;
            }

            if (ch === '{' || ch === '(' || ch === '[') count++;
            if (ch === '}' || ch === ')' || ch === ']') count--;
        }

        return count;
    }

    function leadingCloserCount(line) {
        const trimmed = line.trimStart();
        let count = 0;

        for (let i = 0; i < trimmed.length; i++) {
            const ch = trimmed[i];

            if (ch === '}' || ch === ')' || ch === ']') {
                count++;
                continue;
            }

            break;
        }

        return count;
    }

    function cleanJavaScriptFormatting(codeText) {
        const rawLines =
            codeText
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                .split('\n');

        let indentLevel = 0;
        let blankCount = 0;
        const output = [];

        for (const rawLine of rawLines) {
            const untabbed = rawLine.replace(/\t/g, '    ');
            const trimmedRight = untabbed.replace(/[ \t]+$/g, '');
            const trimmed = trimmedRight.trim();

            if (!trimmed) {
                blankCount++;

                if (blankCount <= 1 && output.length > 0) {
                    output.push('');
                }

                continue;
            }

            blankCount = 0;

            const lineIndent =
                Math.max(0, indentLevel - leadingCloserCount(trimmedRight));

            output.push('    '.repeat(lineIndent) + trimmed);

            indentLevel =
                Math.max(0, indentLevel + countIndentOpeners(trimmed));
        }

        return output.join('\n').trimEnd() + '\n';
    }

    function toBase64Unicode(text) {
        const bytes = new TextEncoder().encode(text);
        let binary = '';

        for (const byte of bytes) {
            binary += String.fromCharCode(byte);
        }

        return btoa(binary);
    }

    function fromBase64Unicode(base64) {
        const binary = atob(base64.replace(/\n/g, ''));
        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        return new TextDecoder().decode(bytes);
    }

    async function githubRequest(url, options) {
        const token = tokenInput.value.trim();

        const headers = {
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        };

        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...(options && options.headers ? options.headers : {})
            }
        });

        const text = await response.text();
        let data = null;

        try {
            data = text ? JSON.parse(text) : null;
        } catch (error) {
            data = {
                message: text
            };
        }

        if (!response.ok) {
            throw new Error(
                data && data.message
                    ? data.message
                    : 'GitHub request failed: ' + response.status
            );
        }

        return data;
    }


    function makeTreeNode(item, level) {
        const row = createEl('div', {
            style: `
                padding: 3px 6px 3px ${8 + (level * 16)}px;
                cursor: pointer;
                border-radius: 4px;
                white-space: nowrap;
                color: ${item.type === 'dir' ? '#79c0ff' : '#c9d1d9'};
            `
        });

        row.textContent =
            (item.type === 'dir' ? '📁 ' : '📄 ') +
            item.name;

        row.addEventListener('mouseenter', () => {
            row.style.background = '#161b22';
        });

        row.addEventListener('mouseleave', () => {
            row.style.background = 'transparent';
        });

        return row;
    }

    async function loadDirectoryTree(dirPath, level, parentEl) {
        rememberGithubFields();

        const owner = ownerInput.value.trim();
        const repo = repoInput.value.trim();
        const branch = branchInput.value.trim() || 'main';

        const apiPath =
            dirPath
                ? dirPath.split('/').map(encodeURIComponent).join('/')
                : '';

        const url =
            'https://api.github.com/repos/' +
            encodeURIComponent(owner) +
            '/' +
            encodeURIComponent(repo) +
            '/contents/' +
            apiPath +
            '?ref=' +
            encodeURIComponent(branch);

        const items = await githubRequest(url, {
            method: 'GET'
        });

        if (!Array.isArray(items)) {
            throw new Error('This path is not a directory');
        }

        items
            .slice()
            .sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === 'dir' ? -1 : 1;
                }

                return a.name.localeCompare(b.name);
            })
            .forEach(item => {
                const row = makeTreeNode(item, level);
                parentEl.appendChild(row);

                if (item.type === 'file') {
                    row.addEventListener('click', () => {
                        pathInput.value = item.path;
                        fileTreePanel.style.display = 'none';
                        loadFromGithub();
                    });
                    return;
                }

                if (item.type === 'dir') {
                    let expanded = false;
                    let childHolder = null;

                    row.addEventListener('click', async () => {
                        if (expanded) {
                            expanded = false;
                            row.textContent = '📁 ' + item.name;

                            if (childHolder) {
                                childHolder.remove();
                                childHolder = null;
                            }

                            return;
                        }

                        expanded = true;
                        row.textContent = '📂 ' + item.name;
                        childHolder = createEl('div');
                        row.after(childHolder);

                        try {
                            await loadDirectoryTree(item.path, level + 1, childHolder);
                        } catch (error) {
                            setStatus('Folder load failed: ' + error.message, 'error');
                        }
                    });
                }
            });
    }

    async function toggleFileTree() {
        if (fileTreePanel.style.display === 'block') {
            fileTreePanel.style.display = 'none';
            return;
        }

        rememberGithubFields();

        if (!ownerInput.value.trim() || !repoInput.value.trim()) {
            setStatus('Missing owner or repo', 'error');
            return;
        }

        fileTreePanel.innerHTML = '';
        fileTreePanel.style.display = 'block';

        const loading = createEl('div', {
            text: 'Loading repository tree...',
            style: `
                color: #d5dbe3;
                padding: 6px;
            `
        });

        fileTreePanel.appendChild(loading);

        try {
            fileTreePanel.innerHTML = '';
            await loadDirectoryTree('', 0, fileTreePanel);
            setStatus('File tree loaded', 'success');
        } catch (error) {
            fileTreePanel.innerHTML = '';
            setStatus('File tree failed: ' + error.message, 'error');
        }
    }

    let rightTreeRootItems = null;
    let rightTreeHasAutoLoaded = false;

    function shouldShowTreeItem(item, filter) {
        if (!filter) return true;

        if (
            item.path &&
            item.path.toLowerCase().includes(filter)
        ) {
            return true;
        }

        if (item.children) {
            return item.children.some(child =>
                shouldShowTreeItem(child, filter)
            );
        }

        return false;
    }

    function renderRightTreeNode(item, level, parentEl, filter) {
        if (!shouldShowTreeItem(item, filter)) {
            return;
        }

        const row = createEl('div', {
            style: `
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 3px 6px 3px ${6 + (level * 15)}px;
                border-radius: 4px;
                cursor: pointer;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: ${item.type === 'dir' ? '#79c0ff' : '#c9d1d9'};
            `
        });

        const icon = createEl('span', {
            text: item.type === 'dir'
                ? (item.expanded ? '▾' : '▸')
                : '·',
            style: `
                width: 12px;
                flex: 0 0 12px;
                color: #d5dbe3;
            `
        });

        const label = createEl('span', {
            text: (item.type === 'dir' ? '📁 ' : '📄 ') + item.name,
            style: `
                overflow: hidden;
                text-overflow: ellipsis;
            `
        });

        row.appendChild(icon);
        row.appendChild(label);

        row.addEventListener('mouseenter', () => {
            row.style.background = '#161b22';
        });

        row.addEventListener('mouseleave', () => {
            row.style.background = 'transparent';
        });

        row.addEventListener('click', async () => {
            if (item.type === 'file') {
                pathInput.value = item.path;
                await loadFromGithub();
                return;
            }

            item.expanded = !item.expanded;
            renderRightTree();
        });

        parentEl.appendChild(row);

        if (
            item.type === 'dir' &&
            item.expanded &&
            item.children
        ) {
            item.children.forEach(child => {
                renderRightTreeNode(child, level + 1, parentEl, filter);
            });
        }
    }

    function renderRightTree() {
        const filter =
            rightTreeSearch.value.trim().toLowerCase();

        rightTreeList.innerHTML = '';

        if (!rightTreeRootItems) {
            rightTreeList.innerHTML =
                '<div style="color:#8b949e; padding:8px;">Loading...</div>';
            return;
        }

        rightTreeRootItems.forEach(item => {
            renderRightTreeNode(item, 0, rightTreeList, filter);
        });

        if (!rightTreeList.children.length) {
            rightTreeList.innerHTML =
                '<div style="color:#8b949e; padding:8px;">No files found.</div>';
        }
    }

    async function loadTreeDirectory(dirPath) {
        rememberGithubFields();

        const owner = ownerInput.value.trim();
        const repo = repoInput.value.trim();
        const branch = branchInput.value.trim() || 'main';

        const apiPath =
            dirPath
                ? dirPath.split('/').map(encodeURIComponent).join('/')
                : '';

        const url =
            'https://api.github.com/repos/' +
            encodeURIComponent(owner) +
            '/' +
            encodeURIComponent(repo) +
            '/contents/' +
            apiPath +
            '?ref=' +
            encodeURIComponent(branch);

        const items = await githubRequest(url, {
            method: 'GET'
        });

        if (!Array.isArray(items)) {
            return [];
        }

        const sorted =
            items
                .slice()
                .sort((a, b) => {
                    if (a.type !== b.type) {
                        return a.type === 'dir' ? -1 : 1;
                    }

                    return a.name.localeCompare(b.name);
                });

        const output = [];

        for (const item of sorted) {
            const node = {
                name: item.name,
                path: item.path,
                type: item.type,
                expanded: false,
                children: null
            };

            if (item.type === 'dir') {
                node.children =
                    await loadTreeDirectory(item.path);
            }

            output.push(node);
        }

        return output;
    }

    async function openRightTreePanel(forceReload) {
        rightTreePanel.style.display = 'flex';
        leftTreeCollapseBar.style.display = 'none';
        requestAnimationFrame(updateCurrentLineHighlight);

        if (rightTreeRootItems && !forceReload) {
            renderRightTree();
            return;
        }

        rightTreeList.innerHTML =
            '<div style="color:#8b949e; padding:8px;">Loading tree...</div>';

        try {
            rightTreeRootItems =
                await loadTreeDirectory('');

            renderRightTree();
            setStatus('File tree loaded', 'success');
        } catch (error) {
            rightTreeRootItems = null;

            rightTreeList.innerHTML =
                '<div style="color:#ffb4b4; padding:8px;">' +
                'Tree load failed: ' +
                error.message +
                '</div>';

            setStatus('File tree failed: ' + error.message, 'error');
        }
    }

    function collapseRightTreePanel() {
        rightTreePanel.style.display = 'none';
        leftTreeCollapseBar.style.display = 'flex';
        requestAnimationFrame(updateCurrentLineHighlight);
    }

    function autoLoadRightTreePanel() {
        rightTreePanel.style.display = 'flex';
        leftTreeCollapseBar.style.display = 'none';

        if (!ownerInput.value.trim()) {
            ownerInput.value = 'JRonCamay';
        }

        if (!repoInput.value.trim()) {
            repoInput.value = 'gandhi';
        }

        if (!branchInput.value.trim()) {
            branchInput.value = 'main';
        }

        rightTreeList.innerHTML =
            '<div style="color:#8b949e; padding:8px;">Loading tree...</div>';

        openRightTreePanel(true);

        setTimeout(() => {
            if (!rightTreeRootItems) {
                openRightTreePanel(true);
            }
        }, 700);

        setTimeout(() => {
            if (!rightTreeRootItems) {
                openRightTreePanel(true);
            }
        }, 1700);
    }

    function toggleRightTreePanel() {
        if (rightTreePanel.style.display === 'flex') {
            collapseRightTreePanel();
            return;
        }

        openRightTreePanel(false);
    }

    async function loadFromGithub() {
        rememberGithubFields();

        const owner = ownerInput.value.trim();
        const repo = repoInput.value.trim();
        const branch = branchInput.value.trim() || 'main';
        const path = pathInput.value.trim();

        if (!owner || !repo || !path) {
            setStatus('Missing owner, repo, or path', 'error');
            return;
        }

        const url =
            'https://api.github.com/repos/' +
            encodeURIComponent(owner) +
            '/' +
            encodeURIComponent(repo) +
            '/contents/' +
            path.split('/').map(encodeURIComponent).join('/') +
            '?ref=' +
            encodeURIComponent(branch);

        setStatus('Loading from GitHub...');

        try {
            const data = await githubRequest(url, {
                method: 'GET'
            });

            if (!data || !data.content) {
                throw new Error('No file content returned');
            }

            currentContentSha = data.sha || '';
            codeArea.value = fromBase64Unicode(data.content);
            updateLineNumbers();
            resetEditorHistory();
            codeArea.scrollTop = 0;
            codeArea.scrollLeft = 0;
            lineGutter.scrollTop = 0;
            codeArea.setSelectionRange(0, 0);
            updateCurrentLineHighlight();

            if (previewPanel.style.display === 'block') {
                updatePreviewPanel();
            }

            currentSearch = '';
            currentSearchIndex = -1;

            setStatus(
                'Loaded ' + path + ' — ' + codeArea.value.length + ' chars',
                'success'
            );
        } catch (error) {
            setStatus('Load failed: ' + error.message, 'error');
        }
    }

    async function commitToGithub() {
        rememberGithubFields();

        const owner = ownerInput.value.trim();
        const repo = repoInput.value.trim();
        const branch = branchInput.value.trim() || 'main';
        const path = pathInput.value.trim();
        const token = tokenInput.value.trim();

        if (!owner || !repo || !path) {
            setStatus('Missing owner, repo, or path', 'error');
            return;
        }

        if (!token) {
            setStatus('GitHub token required to commit', 'error');
            return;
        }

        const syntax = checkJavaScriptSyntax(codeArea.value);

        if (!syntax.ok) {
            setStatus('Commit blocked: Syntax Error: ' + syntax.message, 'error');
            return;
        }

        let message = prompt(
            'Commit message:',
            'Update ' + path
        );

        if (!message) return;

        const url =
            'https://api.github.com/repos/' +
            encodeURIComponent(owner) +
            '/' +
            encodeURIComponent(repo) +
            '/contents/' +
            path.split('/').map(encodeURIComponent).join('/');

        const body = {
            message,
            content: toBase64Unicode(codeArea.value),
            branch
        };

        if (currentContentSha) {
            body.sha = currentContentSha;
        }

        setStatus('Committing to GitHub...');

        try {
            const data = await githubRequest(url, {
                method: 'PUT',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            currentContentSha =
                data &&
                data.content &&
                data.content.sha
                    ? data.content.sha
                    : currentContentSha;

            setStatus('Commit success: ' + message, 'success');
        } catch (error) {
            setStatus('Commit failed: ' + error.message, 'error');
        }
    }


    function miniEscRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function miniLineStartOf(textValue, index) {
        const lineStart = textValue.lastIndexOf('\n', index);
        return lineStart === -1 ? 0 : lineStart + 1;
    }

    function miniLineEndOf(textValue, index) {
        const lineEnd = textValue.indexOf('\n', index);
        return lineEnd === -1 ? textValue.length : lineEnd;
    }

    function miniLineNumberOf(textValue, index) {
        return getLineNumberFromIndex(textValue, index);
    }

    function scrollEditorToIndex(index) {
        revealEditorRange(index, index);
    }

    function miniSelectRange(start, end, message) {
        codeArea.focus();
        codeArea.setSelectionRange(start, end);
        revealEditorRange(start, end);

        setStatus(
            message || ('Selected line ' + miniLineNumberOf(codeArea.value, start)),
            'success'
        );

        if (previewPanel.style.display === 'block') {
            updatePreviewPanel();
        }
    }

    function miniSkipStringOrComment(textValue, i) {
        const ch = textValue[i];
        const next = textValue[i + 1];

        if (ch === '"' || ch === "'" || ch === '`') {
            const quote = ch;
            i++;

            while (i < textValue.length) {
                if (textValue[i] === '\\') {
                    i += 2;
                    continue;
                }

                if (textValue[i] === quote) {
                    return i;
                }

                i++;
            }

            return i;
        }

        if (ch === '/' && next === '/') {
            while (i < textValue.length && textValue[i] !== '\n') i++;
            return i;
        }

        if (ch === '/' && next === '*') {
            i += 2;

            while (
                i < textValue.length &&
                !(textValue[i] === '*' && textValue[i + 1] === '/')
            ) {
                i++;
            }

            return i + 1;
        }

        return i;
    }

    function miniFindStatementEnd(textValue, startIndex) {
        let stack = [];

        for (let i = startIndex; i < textValue.length; i++) {
            const before = i;
            i = miniSkipStringOrComment(textValue, i);
            if (i !== before) continue;

            const ch = textValue[i];

            if (ch === '(' || ch === '{' || ch === '[') {
                stack.push(ch);
                continue;
            }

            if (ch === ')' || ch === '}' || ch === ']') {
                if (stack.length) stack.pop();
                continue;
            }

            if (ch === ';' && stack.length === 0) {
                return i + 1;
            }
        }

        return miniLineEndOf(textValue, startIndex);
    }

    function miniScanBlockEnd(textValue, openIndex) {
        let stack = [];

        for (let i = openIndex; i < textValue.length; i++) {
            const before = i;
            i = miniSkipStringOrComment(textValue, i);
            if (i !== before) continue;

            const ch = textValue[i];

            if (ch === '(' || ch === '{' || ch === '[') {
                stack.push(ch);
                continue;
            }

            if (ch === ')' || ch === '}' || ch === ']') {
                if (stack.length) stack.pop();

                if (!stack.length) {
                    let end = i + 1;

                    while (end < textValue.length && /\s/.test(textValue[end])) {
                        end++;
                    }

                    if (textValue[end] === ';') {
                        end++;
                    }

                    return end;
                }
            }
        }

        return -1;
    }

    function miniFindNamedFunction(name) {
        const textValue = codeArea.value;
        const clean = name.replace(/\($/, '').trim();

        const rx =
            new RegExp('\\bfunction\\s+' + miniEscRegExp(clean) + '\\s*\\(', 'm');

        const match = rx.exec(textValue);
        if (!match) return null;

        const start = miniLineStartOf(textValue, match.index);
        const openBrace = textValue.indexOf('{', match.index);
        if (openBrace === -1) return null;

        const end = miniScanBlockEnd(textValue, openBrace);
        if (end === -1) return null;

        return {
            type: 'function',
            name: clean,
            start,
            end,
            text: textValue.substring(start, end).trim()
        };
    }

    function miniFindDeclarationOrAssignment(name) {
        const textValue = codeArea.value;
        const clean = name.replace(/\($/, '').trim();

        const rx = new RegExp(
            '(^|\\n)([ \\t]*(?:(?:const|let|var)\\s+)?' +
            miniEscRegExp(clean) +
            '\\s*=)',
            'm'
        );

        const match = rx.exec(textValue);
        if (!match) return null;

        const start = match.index + match[1].length;
        const equalIndex = textValue.indexOf('=', start);
        const afterEqual = textValue.slice(equalIndex, equalIndex + 300);

        let end = -1;

        if (
            afterEqual.includes('{') ||
            afterEqual.includes('function') ||
            afterEqual.includes('=>')
        ) {
            const openBrace = textValue.indexOf('{', equalIndex);
            const openParen = textValue.indexOf('(', equalIndex);
            const semi = textValue.indexOf(';', equalIndex);

            if (openBrace !== -1 && (semi === -1 || openBrace < semi)) {
                end = miniScanBlockEnd(textValue, openBrace);
            } else if (openParen !== -1 && (semi === -1 || openParen < semi)) {
                end = miniScanBlockEnd(textValue, openParen);
            }
        }

        if (end === -1) {
            end = miniFindStatementEnd(textValue, equalIndex);
        }

        return {
            type: 'declaration',
            name: clean,
            start,
            end,
            text: textValue.substring(start, end).trim()
        };
    }

    function miniFindPropertyFunction(name) {
        const textValue = codeArea.value;
        const clean = name.replace(/\($/, '').trim();

        const rx = new RegExp(
            '\\b' +
            miniEscRegExp(clean) +
            '\\s*[:=]\\s*(?:async\\s*)?(?:function\\b|\\([^)]*\\)\\s*=>|[A-Za-z_$][\\w$]*\\s*=>)',
            'm'
        );

        const match = rx.exec(textValue);
        if (!match) return null;

        const start = miniLineStartOf(textValue, match.index);
        const openBrace = textValue.indexOf('{', match.index);
        const openParen = textValue.indexOf('(', match.index);
        const open = openBrace !== -1 ? openBrace : openParen;

        if (open === -1) return null;

        const end = miniScanBlockEnd(textValue, open);
        if (end === -1) return null;

        return {
            type: 'property function',
            name: clean,
            start,
            end,
            text: textValue.substring(start, end).trim()
        };
    }

    function miniFindEventListener(query) {
        const textValue = codeArea.value;
        if (!query.includes('::')) return null;

        const parts = query.split('::');
        const objectName = parts[0].trim();
        const eventName = parts[1].trim();

        if (!objectName || !eventName) return null;

        const pattern =
            "\\b" +
            miniEscRegExp(objectName) +
            "\\s*\\.\\s*addEventListener\\s*\\(\\s*[\\\"'`]" +
            miniEscRegExp(eventName) +
            "[\\\"'`]";

        const rx = new RegExp(pattern, "m");
        const match = rx.exec(textValue);
        if (!match) return null;

        const start = miniLineStartOf(textValue, match.index);
        const openParen = textValue.indexOf('(', match.index);
        const end = miniScanBlockEnd(textValue, openParen);

        if (end === -1) return null;

        return {
            type: 'event listener',
            name: query,
            start,
            end,
            text: textValue.substring(start, end).trim()
        };
    }

    function miniFindAllUsageBlocks(name) {
        const textValue = codeArea.value;
        const clean = name.replace(/\($/, '').trim();
        const rx = new RegExp('\\b' + miniEscRegExp(clean) + '\\b', 'g');

        const results = [];
        let match;

        while ((match = rx.exec(textValue))) {
            const start = miniLineStartOf(textValue, match.index);
            let end = miniLineEndOf(textValue, match.index);

            const openBrace = textValue.indexOf('{', start);
            const lineEnd = miniLineEndOf(textValue, start);

            if (openBrace !== -1 && openBrace < lineEnd) {
                const blockEnd = miniScanBlockEnd(textValue, openBrace);
                if (blockEnd !== -1) end = blockEnd;
            } else {
                const semi = textValue.indexOf(';', match.index);
                if (semi !== -1 && semi < miniLineEndOf(textValue, match.index) + 500) {
                    end = semi + 1;
                }
            }

            const chunk = textValue.substring(start, end).trim();

            if (chunk && !results.some(item => item.text === chunk)) {
                results.push({
                    type: 'usage',
                    name: clean,
                    start,
                    end,
                    text: chunk
                });
            }
        }

        return results;
    }

    function miniFindSmartBlock(query) {
        const clean = query.trim();

        if (clean.includes('::')) {
            return miniFindEventListener(clean);
        }

        return (
            miniFindNamedFunction(clean) ||
            miniFindPropertyFunction(clean) ||
            miniFindDeclarationOrAssignment(clean)
        );
    }

    function miniParseLookFunctionCodes(textValue) {
        const firstLine = textValue.split('\n')[0].trim().toLowerCase();

        if (firstLine !== 'look function codes:') {
            return null;
        }

        return textValue
            .split('\n')
            .slice(1)
            .map(line => line.trim())
            .filter(Boolean);
    }

    function miniRunLookFunctionCodes() {
        const names = miniParseLookFunctionCodes(miniSearchBox.value);

        if (!names) return false;

        let output = 'Info:\n\n';
        const missing = [];

        names.forEach(name => {
            const found = miniFindSmartBlock(name);

            output += '-----------------[' + name + ']-----------------\n';

            if (found) {
                output += found.text + '\n\n';
            } else {
                missing.push(name);
                output += '[Not found]\n\n';
            }
        });

        if (missing.length) {
            output += 'Missing:\n';
            missing.forEach(name => {
                output += '- ' + name + '\n';
            });
        }

        miniSearchBox.value = output;

        setStatus(
            missing.length
                ? 'Look Function Codes completed with missing items'
                : 'Look Function Codes success',
            missing.length ? 'error' : 'success'
        );

        return true;
    }

    function miniSearchExact() {
        const query = miniSearchBox.value;
        if (!query) return;

        searchInput.value = query;
        searchNext();
    }

    function miniFindFunctionBlock() {
        if (miniRunLookFunctionCodes()) return;

        const query = miniSearchBox.value.trim();
        if (!query) return;

        if (
            query.startsWith('function ') ||
            query.startsWith('const ') ||
            query.startsWith('let ') ||
            query.startsWith('var ') ||
            query.startsWith('Info:')
        ) {
            setStatus('Body of Functions already found.', 'success');
            return;
        }

        const found = miniFindSmartBlock(query);

        if (!found) {
            const usages = miniFindAllUsageBlocks(query);

            if (usages.length) {
                let output = 'Info:\n\n';

                usages.forEach((item, index) => {
                    output +=
                        '-----------------[' +
                        query +
                        ' usage ' +
                        (index + 1) +
                        ']-----------------\n' +
                        item.text +
                        '\n\n';
                });

                miniSearchBox.value = output;

                miniSelectRange(
                    usages[0].start,
                    usages[0].end,
                    'Usage blocks found: ' + usages.length
                );

                return;
            }

            setStatus('Function/block not found', 'error');
            return;
        }

        miniSearchBox.value = found.text;

        miniSelectRange(
            found.start,
            found.end,
            'Found ' +
                found.type +
                ' at line ' +
                miniLineNumberOf(codeArea.value, found.start)
        );
    }

    function miniReplaceSelected() {
        const target = miniSearchBox.value;
        const replacement = miniReplaceBox.value;

        if (!target) return;

        const text = codeArea.value;
        let start = codeArea.selectionStart;
        let end = codeArea.selectionEnd;

        if (start === end || text.slice(start, end) !== target) {
            start = text.indexOf(target);
            end = start + target.length;
        }

        if (start < 0) {
            setStatus('Text not found', 'error');
            return;
        }

        const selectedAlready =
            start === codeArea.selectionStart &&
            end === codeArea.selectionEnd &&
            isEditorIndexVisible(start);

        replaceEditorValue(
            text.slice(0, start) +
                replacement +
                text.slice(end),
            start,
            start + replacement.length,
            {
                keepScroll: selectedAlready
            }
        );

        setStatus('Replace success inside GitGit editor', 'success');
    }

    function toggleMiniPanel() {
        miniPanel.style.display =
            miniPanel.style.display === 'flex'
                ? 'none'
                : 'flex';
    }

    function searchNext() {
        const query = searchInput.value;

        if (!query) return;

        const text = codeArea.value;
        const matches = getAllExactMatchIndexes(text, query);

        if (!matches.length) {
            setStatus('Text not found', 'error');
            return;
        }

        if (query !== currentSearch) {
            currentSearch = query;
            currentSearchIndex = -1;
        }

        let index =
            matches.find(i => i > currentSearchIndex);

        if (index === undefined) {
            index = matches[0];
        }

        currentSearchIndex = index;

        codeArea.focus();
        codeArea.setSelectionRange(index, index + query.length);
        revealEditorRange(index, index + query.length);

        const line =
            getLineNumberFromIndex(text, index);

        setStatus(
            'Search success (' +
            (matches.indexOf(index) + 1) +
            '/' +
            matches.length +
            ') line ' +
            line,
            'success'
        );
    }

    function replaceCurrent() {
        const query = searchInput.value;
        const replacement = replaceInput.value;

        if (!query) return;

        const text = codeArea.value;
        let index = codeArea.selectionStart;

        if (
            codeArea.selectionEnd <= codeArea.selectionStart ||
            text.slice(codeArea.selectionStart, codeArea.selectionEnd) !== query
        ) {
            index = text.indexOf(query);
        }

        if (index === -1) {
            setStatus('Text not found', 'error');
            return;
        }

        const selectedAlready =
            index === codeArea.selectionStart &&
            codeArea.selectionEnd === index + query.length &&
            isEditorIndexVisible(index);

        replaceEditorValue(
            text.slice(0, index) +
                replacement +
                text.slice(index + query.length),
            index,
            index + replacement.length,
            {
                keepScroll: selectedAlready
            }
        );

        setStatus('Replace success', 'success');
    }

    function replaceAll() {
        const query = searchInput.value;
        const replacement = replaceInput.value;

        if (!query) return;

        const count =
            getAllExactMatchIndexes(codeArea.value, query).length;

        if (!count) {
            setStatus('Text not found', 'error');
            return;
        }

        replaceEditorValue(
            codeArea.value.split(query).join(replacement),
            codeArea.selectionStart,
            codeArea.selectionEnd,
            {
                keepScroll: true
            }
        );

        setStatus('Replace All success: ' + count + ' replaced', 'success');
    }

    function syntaxCheck() {
        const result = checkJavaScriptSyntax(codeArea.value);

        if (result.ok) {
            setStatus(
                'Syntax OK — checked editor: ' + codeArea.value.length + ' chars',
                'success'
            );
        } else {
            setStatus(
                'Syntax Error: ' + result.message,
                'error'
            );
        }
    }

    function robotClean() {
        const result = checkJavaScriptSyntax(codeArea.value);

        if (!result.ok) {
            setStatus(
                'Robot Clean Failed: Syntax Error: ' + result.message,
                'error'
            );
            return;
        }

        const before = codeArea.value.length;
        replaceEditorValue(
            cleanJavaScriptFormatting(codeArea.value),
            codeArea.selectionStart,
            codeArea.selectionEnd,
            {
                keepScroll: true
            }
        );

        setStatus('Robot Cleaned: checked editor ' + before + ' chars', 'success');
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function highlightJavaScriptLine(line) {
        let html = escapeHtml(line);

        const commentIndex = html.indexOf('//');
        let commentPart = '';

        if (commentIndex !== -1) {
            commentPart = html.slice(commentIndex);
            html = html.slice(0, commentIndex);
        }

        html = html.replace(
            /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
            '<span style="color:#a5d6ff;">$1</span>'
        );

        html = html.replace(
            /\b(\d+(?:\.\d+)?)\b/g,
            '<span style="color:#d2a8ff;">$1</span>'
        );

        html = html.replace(
            /\b(true|false|null|undefined)\b/g,
            '<span style="color:#ff7b72;">$1</span>'
        );

        html = html.replace(
            /\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|class|new|try|catch|finally|throw|async|await|import|export|from|default)\b/g,
            '<span style="color:#ff7b72;">$1</span>'
        );

        html = html.replace(
            /\b(window|document|console|Math|Array|Object|String|Number|Boolean|JSON|Date|Promise|setTimeout|setInterval|clearTimeout|clearInterval)\b/g,
            '<span style="color:#79c0ff;">$1</span>'
        );

        html = html.replace(
            /\b([A-Za-z_$][\w$]*)\s*(?=\()/g,
            '<span style="color:#d2a8ff;">$1</span>'
        );

        if (commentPart) {
            html += '<span style="color:#8b949e;">' + commentPart + '</span>';
        }

        return html;
    }

    function findFunctionEnd(lines, startIndex) {
        let depth = 0;
        let started = false;

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i];

            for (let j = 0; j < line.length; j++) {
                const ch = line[j];

                if (ch === '{') {
                    depth++;
                    started = true;
                }

                if (ch === '}') {
                    depth--;

                    if (started && depth <= 0) {
                        return i;
                    }
                }
            }
        }

        return startIndex;
    }

    function getFunctionName(line) {
        const named =
            line.match(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/);

        if (named) return named[1];

        const assigned =
            line.match(/\b(?:const|let|var)?\s*([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/);

        if (assigned) return assigned[1];

        const method =
            line.match(/\b([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/);

        if (method) return method[1];

        return 'function';
    }

    function lineHtml(lineNo, lineText) {
        return (
            '<div style="display:flex; min-height:18px; line-height:18px;">' +
                '<span style="width:48px; flex:0 0 48px; color:#6e7681; text-align:right; padding-right:8px; user-select:none;">' +
                    lineNo +
                '</span>' +
                '<span style="white-space:pre; flex:1;">' +
                    highlightJavaScriptLine(lineText || '') +
                '</span>' +
            '</div>'
        );
    }

    function renderColoredPreview(codeText) {
        const lines = codeText.split('\n');
        const maxLines = 260;
        let html = '';

        for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
            const line = lines[i];
            const isFunctionStart =
                /\bfunction\s+[A-Za-z_$][\w$]*\s*\(/.test(line) ||
                /\b(?:const|let|var)?\s*[A-Za-z_$][\w$]*\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/.test(line);

            if (isFunctionStart && line.includes('{')) {
                const end = Math.min(findFunctionEnd(lines, i), maxLines - 1);
                const name = getFunctionName(line);
                const count = end - i + 1;

                html += (
                    '<details open style="border:1px solid #30363d; border-radius:4px; margin:3px 0; background:#0d1117;">' +
                        '<summary style="cursor:pointer; color:#d2a8ff; padding:3px 6px; background:#161b22;">' +
                            'ƒ ' + escapeHtml(name) + ' — lines ' + (i + 1) + '-' + (end + 1) + ' (' + count + ' lines)' +
                        '</summary>' +
                        '<div>'
                );

                for (let j = i; j <= end; j++) {
                    html += lineHtml(j + 1, lines[j]);
                }

                html += '</div></details>';
                i = end;
                continue;
            }

            html += lineHtml(i + 1, line);
        }

        if (lines.length > maxLines) {
            html += (
                '<div style="color:#8b949e; padding:8px;">' +
                '... Preview truncated at ' + maxLines + ' lines ...' +
                '</div>'
            );
        }

        return html;
    }

    function updatePreviewPanel() {
        const codeText = codeArea.value;
        const syntax = checkJavaScriptSyntax(codeText);
        const lines = codeText.split('\n');

        let header = '';
        header += '<div style="color:#8b949e; margin-bottom:8px; white-space:pre;">';
        header += 'File: ' + escapeHtml(pathInput.value.trim() || '(no file)') + '\n';
        header += 'Lines: ' + lines.length + '\n';
        header += 'Chars: ' + codeText.length + '\n';
        header += 'Syntax: ' + (syntax.ok ? 'OK' : 'ERROR - ' + escapeHtml(syntax.message)) + '\n';
        header += '------------------------------------------------------------';
        header += '</div>';

        previewPanel.innerHTML =
            header +
            renderColoredPreview(codeText);
    }

    function togglePreviewPanel() {
        if (previewPanel.style.display === 'block') {
            previewPanel.style.display = 'none';
            previewBarIcon.textContent = '▾';
            setStatus('Preview closed');
            return;
        }

        updatePreviewPanel();
        previewPanel.style.display = 'block';
        previewBarIcon.textContent = '▴';
        setStatus('Preview opened', 'success');
    }

    async function copyEditor() {
        try {
            await navigator.clipboard.writeText(codeArea.value);
            setStatus('Copied editor to clipboard', 'success');
        } catch (error) {
            setStatus('Copy failed: ' + error.message, 'error');
        }
    }

    function openEditor() {
        launcher.style.display = 'none';

        if (!overlay.isConnected) {
            document.body.appendChild(overlay);
        }

        overlay.style.display = 'flex';
        updateLineNumbers();
        resetEditorHistory();
        codeArea.focus();
        updateCurrentLineHighlight();
    }

    function closeEditor() {
        overlay.style.display = 'none';
        launcher.style.display = 'block';
    }

    refreshAccountSelect();

    accountSelect.addEventListener('change', () => {
        loadAccountIntoFields(accountSelect.value);
        currentContentSha = '';
        rightTreeRootItems = null;
        rightTreeHasAutoLoaded = false;
        if (overlay.style.display === 'flex') {
            openRightTreePanel(true);
        }
        setStatus('Account loaded: ' + accountSelect.value, 'success');
    });

    saveAccountBtn.addEventListener('click', () => {
        const name = accountSelect.value || 'Default';
        saveCurrentFieldsToAccount();
        refreshAccountSelect();
        accountSelect.value = name;
        setStatus('Account saved locally: ' + name, 'success');
    });

    newAccountBtn.addEventListener('click', () => {
        const name = prompt('Account name:', ownerInput.value.trim() || 'GitHub Account');
        if (!name) return;

        settings.currentAccount = name;
        settings.accounts[name] = {
            owner: ownerInput.value.trim() || 'JRonCamay',
            repo: repoInput.value.trim() || 'gandhi',
            branch: branchInput.value.trim() || 'main',
            path: pathInput.value.trim() || 'TransformBoxTool.js',
            token: tokenInput.value.trim()
        };

        saveSettings(settings);
        refreshAccountSelect();
        accountSelect.value = name;
        loadAccountIntoFields(name);
        setStatus('New account saved locally: ' + name, 'success');
    });

    launcher.addEventListener('click', openEditor);

    prepareStandalonePage();
    requestAnimationFrame(() => {
        openEditor();
    });
    closeBtn.addEventListener('click', event => event.preventDefault());
    [
        loadBtn,
        filesBtn,
        commitBtn,
        saveAccountBtn,
        newAccountBtn,
        searchBtn,
        replaceBtn,
        replaceAllBtn,
        syntaxBtn,
        robotBtn,
        undoBtn,
        redoBtn,
        editorCopyAllBtn,
        editorCopySelectionBtn,
        rightTreeRefreshBtn,
        rightTreeCloseBtn,
        leftTreeCollapseBar
    ].forEach(button => {
        button.addEventListener('mousedown', event => {
            event.preventDefault();
        });
    });

    tokenLockBtn.addEventListener('click', () => {
        const showing = tokenInput.style.display !== 'none';
        tokenInput.style.display = showing ? 'none' : 'block';
        tokenLockBtn.textContent = showing ? '🔒' : '🔓';
        if (!showing) {
            tokenInput.focus();
        }
    });

    loadBtn.addEventListener('click', loadFromGithub);
    filesBtn.addEventListener('click', toggleFileTree);
    commitBtn.addEventListener('click', commitToGithub);
    searchBtn.addEventListener('click', searchNext);
    replaceBtn.addEventListener('click', replaceCurrent);
    replaceAllBtn.addEventListener('click', replaceAll);
    syntaxBtn.addEventListener('click', syntaxCheck);
    robotBtn.addEventListener('click', robotClean);
    undoBtn.addEventListener('click', editorUndo);
    redoBtn.addEventListener('click', editorRedo);
    rightTreeRefreshBtn.addEventListener('click', () => openRightTreePanel(true));
    rightTreeCloseBtn.addEventListener('click', collapseRightTreePanel);
    leftTreeCollapseBar.addEventListener('click', () => openRightTreePanel(false));
    rightTreeSearch.addEventListener('input', renderRightTree);
    [ownerInput, repoInput, branchInput].forEach(input => {
        input.addEventListener('change', () => {
            rightTreeRootItems = null;
            rightTreeHasAutoLoaded = false;
        });
    });
    previewBar.addEventListener('click', togglePreviewPanel);
    editorCopyAllBtn.addEventListener('click', copyEditor);
    editorCopySelectionBtn.addEventListener('click', async () => {
        const selected =
            codeArea.value.substring(
                codeArea.selectionStart || 0,
                codeArea.selectionEnd || 0
            );

        if (!selected) {
            setStatus('No selection to copy', 'error');
            return;
        }

        await navigator.clipboard.writeText(selected);
        setStatus('Selection copied', 'success');
    });
    miniLauncher.addEventListener('click', toggleMiniPanel);
    miniCloseBtn.addEventListener('click', toggleMiniPanel);
    miniSearchBtn.addEventListener('click', miniSearchExact);
    miniFunctionBtn.addEventListener('click', miniFindFunctionBlock);
    miniReplaceBtn.addEventListener('click', miniReplaceSelected);
    miniCopyBtn.addEventListener('click', async () => {
        await navigator.clipboard.writeText(miniSearchBox.value);
        miniCopyBtn.innerHTML = '✓';
        setTimeout(() => miniCopyBtn.innerHTML = '⧉', 1000);
    });

    codeArea.addEventListener('beforeinput', () => {
        recordBeforeEditorChange();
    });

    codeArea.addEventListener('input', () => {
        updateLineNumbers();
        updateCurrentLineHighlight();

        if (previewPanel.style.display === 'block') {
            updatePreviewPanel();
        }

        editorLastSnapshot = getEditorSnapshot();
    });

    codeArea.addEventListener('click', updateCurrentLineHighlight);
    codeArea.addEventListener('keyup', updateCurrentLineHighlight);
    codeArea.addEventListener('select', updateCurrentLineHighlight);
    codeArea.addEventListener('paste', () => {
        setTimeout(() => {
            const lineCount =
                codeArea.value.split('\n').length;

            if (lineCount > 80) {
                codeArea.scrollTop = 0;
                codeArea.scrollLeft = 0;
                lineGutter.scrollTop = 0;
                codeArea.setSelectionRange(0, 0);
                updateCurrentLineHighlight();
                setStatus('Pasted whole file — scrolled to top', 'success');
            }
        }, 30);
    });
    codeArea.addEventListener('scroll', () => {
        syncScroll();
        updateCurrentLineHighlight();
    });

    codeArea.addEventListener('keydown', event => {
        if (event.key === 'Tab') {
            event.preventDefault();

            const start = codeArea.selectionStart;
            const end = codeArea.selectionEnd;

            replaceEditorValue(
                codeArea.value.slice(0, start) +
                    '    ' +
                    codeArea.value.slice(end),
                start + 4,
                start + 4,
                {
                    keepScroll: true
                }
            );
        }

        if (event.ctrlKey && event.key.toLowerCase() === 'z') {
            event.preventDefault();
            editorUndo();
            return;
        }

        if (
            event.ctrlKey &&
            (
                event.key.toLowerCase() === 'y' ||
                (
                    event.shiftKey &&
                    event.key.toLowerCase() === 'z'
                )
            )
        ) {
            event.preventDefault();
            editorRedo();
            return;
        }

        if (event.ctrlKey && event.key.toLowerCase() === 'f') {
            event.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
    });

    // Editor stays closed on page load. Line numbers update when opened.
})();
