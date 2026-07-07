((function() {
  'use strict';
  // Initialize KEY namespace if not already defined
  if (window.KEY) return;
  window.KEY = {
    handlers: [],
    register: function(fn) {
      if (typeof fn === 'function') {
        this.handlers.push(fn);
      }
    }
  };

  // Global keydown dispatcher
  function dispatch(event) {
    for (const handler of window.KEY.handlers) {
      try {
        const consumed = handler(event);
        if (consumed) {
          // Stop further listeners if handler consumed the event
          if (typeof event.preventDefault === 'function') event.preventDefault();
          if (typeof event.stopPropagation === 'function') event.stopPropagation();
          if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
          break;
        }
      } catch (_) {
        // Ignore handler errors to avoid breaking dispatch
      }
    }
  }

  window.addEventListener('keydown', dispatch, true);

  // Fallback for early shortcuts before modules register handlers
  window.addEventListener('keydown', function(event) {
    // Ignore repeated keydown events
    if (event.repeat) return;
    const key = event.key?.toLowerCase?.();
    if (!key) return;

    // R without modifiers toggles TransforkNew overlay and Transfork transform mode
    if (!event.ctrlKey && !event.metaKey && !event.altKey && key === 'r') {
      let consumed = false;
      try {
        if (window.TransforkNew?.INPUT?.SHORTCUTS?.toggleR) {
          window.TransforkNew.INPUT.SHORTCUTS.toggleR();
          consumed = true;
        } else {
          window.__TransforkNewPendingR = true;
        }
      } catch (_) {}
      try {
        if (typeof window.__TransforkToggleTransformMode === 'function') {
          window.__TransforkToggleTransformMode();
          consumed = true;
        } else {
          window.__TransforkPendingRToggle = true;
        }
      } catch (_) {}
      if (consumed) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      }
    }

    // Ctrl+Shift+R triggers hot reload for TransforkNew and Transfork
    if (event.ctrlKey && event.shiftKey && key === 'r') {
      let consumed = false;
      try {
        if (window.TransforkNewLoader?.hotReload) {
          window.TransforkNewLoader.hotReload();
          consumed = true;
        } else {
          window.__TransforkNewPendingHotReload = true;
        }
      } catch (_) {}
      try {
        if (typeof window.TransforkHotReload === 'function') {
          window.TransforkHotReload();
          consumed = true;
        } else {
          window.__TransforkPendingHotReload = true;
        }
      } catch (_) {}
      if (consumed) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      }
    }
  }, true);
})();
