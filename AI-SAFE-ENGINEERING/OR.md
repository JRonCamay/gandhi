# Ownership Rule (OR)
Version 1.0

Guardian of Authority

# Purpose

OR ensures that only active owners execute.

It prevents renderers, listeners, patches, engines, timers, observers, and state writers from fighting.

It allows newer patches or context-specific engines to take over safely.

# OR and MAR

OR is the ownership policy.

MAR is the implementation.

MAR means:

Master Authority Registry

# Master Authority Creation Rule

Every project must create exactly one global MAR object when the project starts.

No engineer or AI agent may invent a new MAR system for the same project.

Use the standard MAR name and standard MAR functions only.

Project MAR name format:

ProjectNameMAR

Examples:

TransforkMAR

ComposerMAR

MiniConsoleMAR

# Required MAR API

Every MAR must provide:

register(entry)

isOn(key)

set(key, value)

enable(key)

disable(key)

get(key)

list()

# Standard MAR Implementation

Use this as the base for every project.

```javascript
window.ProjectNameMAR = window.ProjectNameMAR || (function () {
    const registry = Object.create(null);

    function register(entry) {
        if (!entry || !entry.key) {
            throw new Error("MAR.register requires entry.key");
        }

        const current = registry[entry.key];

        if (!current) {
            registry[entry.key] = {
                key: entry.key,
                creator: entry.creator || "unknown",
                purpose: entry.purpose || "",
                timestamp: entry.timestamp || 0,
                parent: entry.parent || "",
                on: entry.on !== false
            };

            return registry[entry.key];
        }

        if ((entry.timestamp || 0) >= (current.timestamp || 0)) {
            registry[entry.key] = {
                key: entry.key,
                creator: entry.creator || current.creator,
                purpose: entry.purpose || current.purpose,
                timestamp: entry.timestamp || current.timestamp,
                parent: entry.parent || current.parent,
                on: entry.on !== false
            };
        }

        return registry[entry.key];
    }

    function isOn(key) {
        return !!registry[key]?.on;
    }

    function set(key, value) {
        if (registry[key]) {
            registry[key].on = !!value;
        }
    }

    function enable(key) {
        set(key, true);
    }

    function disable(key) {
        set(key, false);
    }

    function get(key) {
        return registry[key] || null;
    }

    function list() {
        return Object.assign({}, registry);
    }

    return {
        register,
        isOn,
        set,
        enable,
        disable,
        get,
        list
    };
})();
```

Replace ProjectNameMAR with the actual project MAR name.

Example:

TransforkMAR

# Registration

At application startup, every runtime-capable component registers with MAR.

Every owner registers:

key

creator

purpose

timestamp

parent

on

Example:

```javascript
TransforkMAR.register({
    key: "transfork.snapEngine260703_fg2mns",
    creator: "Shaggy",
    purpose: "Active snap engine",
    timestamp: 2607030412,
    parent: "Transfork/snap/index.js",
    on: true
});
```

# Runtime Check

Every runtime entry point checks MAR before acting.

Example:

```javascript
function snapEngine260703_fg2mns() {
    if (!TransforkMAR.isOn("transfork.snapEngine260703_fg2mns")) return;

    // real logic here
}
```

If the key is OFF, the function exits immediately.

# Permanent Patch Replacement

```javascript
TransforkMAR.disable("transfork.legacySnap260701_ab12cd");
TransforkMAR.enable("transfork.snapEngine260703_fg2mns");
```

# Context Switching

```javascript
// Tab A
TransforkMAR.enable("transfork.engineA260703_jk92la");
TransforkMAR.disable("transfork.engineB260703_mn81qx");

// Tab B
TransforkMAR.disable("transfork.engineA260703_jk92la");
TransforkMAR.enable("transfork.engineB260703_mn81qx");
```

# Applies To

Engines

Renderers

Event listeners

Keyboard shortcuts

MutationObservers

Timers

Runtime bridges

Controllers

Panel controllers

DOM patchers

State writers

Patch modules

# Rules

One project has one MAR.

MAR is created at startup.

Every runtime owner registers.

Every runtime entry point checks MAR.

Only ON owners execute.

OFF owners exit quietly.

Do not invent a custom MAR per module.

Keep ownership simple.

# Summary

OR defines the ownership law.

MAR enforces the ownership law.

Boolean authority is the runtime switch.

One project.

One MAR.

No runtime fighting.

## Engineering Checkpoints

Frequently opened engineering files should begin with an Engineering Checkpoint reminding engineers to read the project guides before implementation.

Examples

README.md

OMNI_GUARDIAN.md

DECLARATION_RECORD.md

MAR

Bootloader

Callback registry

Main entry point
