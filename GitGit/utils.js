/*
GitGit/utils.js
Shared lightweight helpers. The current app still keeps most functions inside big-editor.js
to avoid risky refactors. Future helpers can move here safely.
*/
window.GitGit = window.GitGit || {};

window.GitGit.utils = {
    escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    createEl(tag, props) {
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
    },

    debounce(fn, delay) {
        let timer = null;

        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }
};
