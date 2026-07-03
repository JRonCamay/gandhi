window.Chad = window.Chad || {};

(function () {
    "use strict";

    const map260703_m8q4zd = {};

    function register(entry) {
        if (!entry || !entry.key) return null;
        map260703_m8q4zd[entry.key] = {
            key: entry.key,
            name: entry.name || entry.key,
            file: entry.file || "",
            stamp: entry.stamp || 0,
            on: entry.on !== false
        };
        return map260703_m8q4zd[entry.key];
    }

    function isOn(key) {
        return !!(map260703_m8q4zd[key] && map260703_m8q4zd[key].on);
    }

    function set(key, value) {
        if (!map260703_m8q4zd[key]) register({ key: key, on: value });
        map260703_m8q4zd[key].on = !!value;
    }

    function list() {
        return Object.keys(map260703_m8q4zd).map(key => [key, map260703_m8q4zd[key].on]);
    }

    window.Chad.runtimeSwitchboard260703_m8q4zd = {
        register: register,
        isOn: isOn,
        set: set,
        list: list
    };
})();
