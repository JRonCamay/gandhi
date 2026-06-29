# Architecture Overview

## Project Structure

Gandhi IDE is a lightweight Scratch/Blockly enhancement project written in plain JavaScript, HTML, and CSS patterns without a build system or external packages.

The repository currently has two main implementation areas: the Composer userscript modules and the standalone Transform Scratch extension.

## Main Modules

* `Composer/` - Contains the Composer feature modules for loading, parsing, matching, rendering, and displaying Scratch-like block previews.
* `Composer/loader.user.js` - Boots Composer as a userscript and loads the Composer modules from GitHub raw files in order.
* `Composer/parser.js` - Parses simple text commands into small AST-style objects.
* `Composer/library.js` - Stores Scratch-like block metadata used for text matching and preview rendering.
* `Composer/paths.js` - Draws Scratch-style block outline shapes on a canvas.
* `Composer/sockets.js` - Measures and draws inline block input sockets such as numbers, strings, menus, booleans, and colors.
* `Composer/renderer.js` - Owns the preview canvas and renders matched block metadata into visual block previews.
* `Composer/blockly.js` - Provides a small wrapper around the global Blockly workspace and block creation APIs.
* `Composer/generator.js` - Matches typed Composer input against library patterns and triggers preview rendering.
* `Composer/ui.js` - Builds and controls the floating Composer panel, input box, preview area, dragging, and keyboard shortcuts.
* `Composer/components.js` - Empty placeholder for future Composer component logic.
* `Composer/utils.js` - Empty placeholder for future shared Composer utilities.
* `JTransformPlus.js` - Registers an unsandboxed Scratch extension with sprite flip, rotate, and direction reporter blocks.
* `AGENTS.md` - Defines permanent instructions for AI coding agents working on the repository.
* `DEVELOPMENT.md` - Documents project philosophy, coding standards, workflow, and future module goals.
* `REPOSITORY_AUDIT.md` - Contains a broader repository audit and technical overview.

## File/Folder Tree

```text
.
├── AGENTS.md
├── ARCHITECTURE.md
├── DEVELOPMENT.md
├── JTransformPlus.js
├── REPOSITORY_AUDIT.md
└── Composer/
    ├── blockly.js
    ├── components.js
    ├── generator.js
    ├── library.js
    ├── loader.user.js
    ├── parser.js
    ├── paths.js
    ├── renderer.js
    ├── sockets.js
    ├── ui.js
    └── utils.js
```

## Current Development Status

The Composer can load as a userscript, show a floating panel, match typed input to known block patterns, and render canvas previews, but real Blockly block insertion is not yet implemented.

The Transform extension is implemented separately and provides basic sprite transform blocks for Scratch-compatible unsandboxed extension environments.

Block Search, Theme System, and broader extension/plugin systems are documented as project goals but are not currently implemented as dedicated modules.
