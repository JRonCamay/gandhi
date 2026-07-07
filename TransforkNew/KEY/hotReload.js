(function () {
  'use strict';
  if (!window.KEY || typeof window.KEY.register !== 'function') return;
  const handler = function (event) {
    if (event.repeat) return false;
    const key = event.key?.toLowerCase?.();
    if (!key) return false;
    if (key === 'r' && event.ctrlKey && event.shiftKey) {
      // Prevent default and stop propagation via KEY dispatcher
      let consumed = false;
      try {
        if (window.TransforkNewLoader?.hotReload) {
          window.TransforkNewLoader.hotReload();
          consumed = true;
        }
      } catch (_) {}
      try {
        if (typeof window.TransforkHotReload === 'function') {
          window.TransforkHotReload();
          consumed = true;
        }
      } catch (_) {}
      return consumed;
    }
    return false;
  };
  window.KEY.register(handler);
})();
