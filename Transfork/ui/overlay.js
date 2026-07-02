/*
Transfork/ui/overlay.js
Reusable overlay UI factory for Transfork.

This module only creates DOM elements.
It does not know VM, snapping, simulation, or transform behavior.
*/

(function () {
    'use strict';

    window.Transfork = window.Transfork || {};
    window.Transfork.ui = window.Transfork.ui || {};

    function applyStyle(element, style) {
        Object.assign(element.style, style);
        return element;
    }

    function createBox() {
        const overlay = document.createElement('div');
        overlay.id = 'gandi-transform-box';

        applyStyle(overlay, {
            position: 'fixed',
            border: '2px solid #00A2FF',
            pointerEvents: 'none',
            zIndex: '9999',
            boxSizing: 'border-box',
            display: 'none',
            userSelect: 'none',
            cursor: 'move'
        });

        return overlay;
    }

    function createHandle(options) {
        const handle = document.createElement('div');

        applyStyle(handle, Object.assign({
            position: 'absolute',
            width: '20px',
            height: '20px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            border: '1px solid white',
            pointerEvents: 'auto',
            boxSizing: 'border-box',
            userSelect: 'none'
        }, options.style || {}));

        if (options.id) handle.id = options.id;
        if (options.title) handle.title = options.title;
        if (options.text !== undefined) handle.innerHTML = options.text;

        return handle;
    }

    function createTooltip() {
        const tooltip = document.createElement('div');

        applyStyle(tooltip, {
            position: 'fixed',
            background: 'rgba(20,20,20,.92)',
            color: 'white',
            fontWeight: '500',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '10px',
            pointerEvents: 'none',
            zIndex: '10001',
            display: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,.4)'
        });

        return tooltip;
    }

    function moveTooltip(tooltip, event) {
        const offset = 8;
        let x = event.clientX + offset;
        let y = event.clientY + offset;
        const rect = tooltip.getBoundingClientRect();

        if (x + rect.width > window.innerWidth) {
            x = event.clientX - rect.width - offset;
        }

        if (y + rect.height > window.innerHeight) {
            y = event.clientY - rect.height - offset;
        }

        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
    }

    function showTooltip(tooltip, text, event) {
        tooltip.textContent = text;
        tooltip.style.display = 'block';
        moveTooltip(tooltip, event);
    }

    function hideTooltip(tooltip) {
        tooltip.style.display = 'none';
    }

    function attachTooltip(element, tooltip, label) {
        element.addEventListener('mouseenter', event => {
            showTooltip(tooltip, label, event);
        });

        element.addEventListener('mouseleave', () => {
            hideTooltip(tooltip);
        });

        element.addEventListener('mousemove', event => {
            moveTooltip(tooltip, event);
        });

        element.addEventListener('mousedown', () => {
            hideTooltip(tooltip);
        });

        element.addEventListener('click', () => {
            hideTooltip(tooltip);
        });
    }

    function createDefaultHandles(overlay) {
        const handles = {};

        handles.resize = createHandle({
            text: '',
            title: 'Resize',
            style: {
                width: '12px',
                height: '12px',
                background: '#00A2FF',
                right: '-6px',
                bottom: '-6px',
                cursor: 'nwse-resize'
            }
        });

        handles.move = createHandle({
            text: '✥',
            title: 'Move',
            style: {
                left: '50%',
                top: '-23px',
                width: '20px',
                height: '20px',
                marginLeft: '-12px',
                background: '#e53935',
                fontSize: '16px',
                cursor: 'move'
            }
        });

        handles.rotate = createHandle({
            text: '↻',
            title: 'Rotate',
            style: {
                left: '50%',
                top: '-44px',
                marginLeft: '-12px',
                background: '#ff9800',
                borderRadius: '50%',
                cursor: 'grab',
                fontSize: '14px',
                fontWeight: 'bold'
            }
        });

        handles.flipVertical = createHandle({
            text: '⇅',
            title: 'Flip Vertical',
            style: {
                left: '-26px',
                top: '24px',
                background: '#16a085',
                cursor: 'pointer'
            }
        });

        handles.skew = createHandle({
            text: '🛠',
            title: 'Skew',
            style: {
                right: '-27px',
                bottom: '66px',
                background: '#00A2FF',
                cursor: 'pointer'
            }
        });

        for (const key of Object.keys(handles)) {
            overlay.appendChild(handles[key]);
        }

        return handles;
    }

    function create() {
        const overlay = createBox();
        const tooltip = createTooltip();
        const handles = createDefaultHandles(overlay);

        document.body.appendChild(overlay);
        document.body.appendChild(tooltip);

        for (const key of Object.keys(handles)) {
            attachTooltip(handles[key], tooltip, handles[key].title || key);
        }

        return {
            overlay,
            tooltip,
            handles,
            show() {
                overlay.style.display = 'block';
            },
            hide() {
                overlay.style.display = 'none';
            },
            destroy() {
                overlay.remove();
                tooltip.remove();
            }
        };
    }

    window.Transfork.ui.overlay = {
        create,
        createBox,
        createHandle,
        createTooltip,
        attachTooltip,
        showTooltip,
        hideTooltip,
        moveTooltip
    };

    console.log('[Transfork UI] overlay loaded');
})();
