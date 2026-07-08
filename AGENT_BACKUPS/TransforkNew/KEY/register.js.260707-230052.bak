(function () {
  'use strict';
  // Ensure KEY namespace exists; provide no-op register if missing
  if (!window.KEY) {
    window.KEY = {
      handlers: [],
      register: function (fn) {
        if (typeof fn === 'function') {
          this.handlers.push(fn);
        }
      }
    };
  }
})();
