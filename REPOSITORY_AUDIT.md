# Repository Audit

Audit date: 2026-06-29
Repository: JRonCamay/gandhi

This audit is based on the repository tree and source files on the `main` branch after `AGENTS.md` was added. No source files were modified for this audit.

---

# 1. Repository Overview

Gandhi IDE is a lightweight Scratch/Blockly enhancement project written in plain JavaScript. The current repository is focused primarily on two areas: a Composer userscript for previewing Scratch-style blocks from typed text, and a Scratch unsandboxed extension that adds transform-related blocks.

The project appears intentionally small and dependency-free. It uses browser globals, immediately invoked function expressions, and direct DOM/canvas APIs instead of frameworks, build tools, or package managers.

## Major folders

* `Composer/` - Composer userscript modules, including loading, parsing, block library data, canvas rendering, Blockly integration, and UI.

## Root files

* `AGENTS.md` - Permanent AI coding-agent instructions for Gandhi IDE.
* `DEVELOPMENT.md` - Human and AI development guide.
* `JTransformPlus.js` - Scratch unsandboxed transform extension.

## Major JavaScript files

* `JTransformPlus.js`
* `Composer/loader.user.js`
* `Composer/parser.js`
* `Composer/library.js`
* `Composer/paths.js`
* `Composer/sockets.js`
* `Composer/renderer.js`
* `Composer/blockly.js`
* `Composer/generator.js`
* `Composer/ui.js`

Placeholder JavaScript files:

* `Composer/components.js`
* `Composer/utils.js`

---

# 2. Current Features

## Composer

Composer is the largest implemented system. It is loaded by `Composer/loader.user.js`, which creates a global `window.Composer` object and sequentially fetches/evaluates the Composer modules from GitHub raw URLs.

Current Composer behavior includes:

* A floating browser panel titled `Gandhi Composer`.
* Keyboard toggle with `Ctrl+Shift+X`.
* Escape key hiding the panel.
* A text input for typing block-like commands.
* A canvas preview area.
* A status footer.
* Dragging the panel by its header.
* Text-to-preview matching against `Composer.library` patterns.

The Composer currently previews recognized blocks visually. Actual block insertion/generation is stubbed in `Composer/generator.js`.

## Block Library

`Composer/library.js` defines a large array of Scratch-like block metadata. Entries include IDs, Blockly/Scratch block names, text patterns, preview labels, and parameter descriptors.

Covered categories include:

* Motion
* Looks
* Sound
* Events
* Control
* Sensing
* Operators
* Variables
* Lists

This is currently data-only and powers Composer preview matching/rendering.

## Canvas Block Preview Rendering

`Composer/renderer.js`, `Composer/paths.js`, and `Composer/sockets.js` work together to draw Scratch-like block previews on a canvas.

Implemented drawing support includes:

* Stack block shape
* Reporter shape
* Boolean shape
* Hat shape
* Cap shape
* Inline sockets for number, string, reporter, menu, boolean, and color parameters

## Blockly Integration

`Composer/blockly.js` contains a small wrapper around the global `Blockly` object. It can find the main workspace and create a block by type if Blockly is available.

This appears prepared for future real block insertion, but the current Composer generation path does not yet call it.

## Parser

`Composer/parser.js` parses simple line-based text commands into a small AST. Current recognized commands include:

* `move <number>`
* `wait <number>`
* `turn <number>`
* `say <text>`
* `hide`
* `show`

Unknown lines become `{ type: "unknown", text: line }` nodes. This parser is implemented but does not appear integrated into the live preview flow, which currently uses exact pattern matching in `generator.js`.

## Transform Extension

`JTransformPlus.js` registers an unsandboxed Scratch extension named `Transform`. It provides blocks for:

* Flip sprite horizontally
* Flip sprite vertically
* Rotate sprite by an angle
* Report sprite direction

Horizontal flip changes the target direction. Vertical flip accesses the renderer drawable and applies a negative Y scale. Rotate changes the target direction by a numeric argument.

## Theme System

No implemented theme system was found. Styling is currently hard-coded in `Composer/ui.js`, `Composer/renderer.js`, `Composer/paths.js`, and `Composer/sockets.js`.

## Extensions

`JTransformPlus.js` is an implemented Scratch extension. Composer is implemented as a userscript loader rather than as a Scratch extension.

## Block Search

No implemented Block Search module was found in the current repository.

---

# 3. Architecture

The current architecture is simple and global-object based.

Composer starts in `Composer/loader.user.js`:

1. The userscript creates `window.Composer` with empty namespace objects.
2. The loader fetches each module from `https://raw.githubusercontent.com/JRonCamay/gandhi/main/Composer/`.
3. Each fetched file is executed with `eval`.
4. Modules attach behavior to `Composer.parser`, `Composer.library`, `Composer.paths`, `Composer.sockets`, `Composer.renderer`, `Composer.blockly`, `Composer.generator`, and `Composer.ui`.
5. `Composer/ui.js` initializes the floating panel and wires input events to `Composer.generator.preview`.
6. `Composer/generator.js` normalizes input and compares it against `Composer.library` patterns.
7. On exact pattern match, `Composer.renderer.preview` draws the matching block metadata.
8. `Composer/renderer.js` builds drawable components from block preview text and parameter metadata.
9. `Composer/renderer.js` delegates shape drawing to `Composer.paths` and socket drawing/measurement to `Composer.sockets`.

`JTransformPlus.js` is separate from Composer. It is a Scratch extension file that depends on the global `Scratch` API and accesses `Scratch.vm.runtime.renderer` internals for drawable manipulation.

Assumptions:

* Composer is intended to run on `https://www.cocrea.world/*` because the userscript metadata targets that domain.
* Composer is intended to eventually create real Blockly blocks, because `Composer/blockly.js` exists and `Composer/generator.generate` is stubbed.
* `components.js` and `utils.js` are placeholders for future modularization because they are empty and are not loaded by the current userscript.

---

# 4. File Responsibilities

## `JTransformPlus.js`

Purpose: Defines and registers the Scratch `Transform` extension.

Dependencies:

* Global `Scratch` object
* `Scratch.extensions.unsandboxed`
* `Scratch.vm.runtime.renderer`
* Scratch target APIs such as `setDirection`
* Renderer drawable internals such as `_allDrawables` and `updateScale`

Approximate complexity: Medium. The file is not large, but it touches Scratch renderer internals and uses defensive try/catch blocks around behavior.

Suggestions for future modularization:

* Separate renderer/drawable lookup from block opcode methods if more transform operations are added.
* Centralize transform error handling if the extension grows.
* Keep Scratch-internal access isolated because those APIs may be less stable.

## `Composer/loader.user.js`

Purpose: Userscript entry point. Creates `window.Composer`, defines module load order, fetches module files, evaluates them, and boots Composer.

Dependencies:

* Browser userscript environment
* `fetch`
* `eval`
* GitHub raw URLs
* Global `window`

Approximate complexity: Low to medium. The logic is short, but the dynamic loading strategy is important because module order is required.

Suggestions for future modularization:

* Keep loader responsibilities limited to bootstrapping.
* If more modules are added, document or validate load order.
* Consider loading placeholder modules only when they contain real behavior.

## `Composer/parser.js`

Purpose: Converts simple line-based text commands into AST nodes.

Dependencies:

* `Composer.parser`
* JavaScript regular expressions

Approximate complexity: Low. It is straightforward command parsing with repeated regex checks.

Suggestions for future modularization:

* If command coverage expands, move command patterns into data definitions.
* Consider aligning parser output with `Composer.library` entries so parsing and preview matching share one source of truth.

## `Composer/library.js`

Purpose: Defines the Composer block metadata library used for matching and rendering Scratch-like block previews.

Dependencies:

* `Composer.library`
* Naming compatibility with Scratch/Blockly block IDs
* Parameter type compatibility with `Composer.sockets` and `Composer.renderer`

Approximate complexity: Medium to high. Most complexity is data volume rather than control flow. At about 975 lines, it is the largest file in the repo.

Suggestions for future modularization:

* Split by category if the library keeps growing: motion, looks, sound, events, control, sensing, operators, data.
* Consider shared validation for required fields like `id`, `block`, `pattern`, `preview`, and `params`.
* Keep category names consistent with Scratch categories.

## `Composer/paths.js`

Purpose: Draws Scratch-like block outlines on a canvas context.

Dependencies:

* `Composer.paths`
* Canvas 2D context APIs
* Shape names used by `Composer.renderer` and `Composer.sockets`

Approximate complexity: Medium. It contains several drawing routines with manual path geometry.

Suggestions for future modularization:

* Keep shape drawing isolated here.
* If shape variants expand, group shared geometry constants and repeated rounded-corner logic.
* Remove or use the unused `roundRect` helper in a future cleanup task.

## `Composer/sockets.js`

Purpose: Measures and draws inline parameter sockets for block previews.

Dependencies:

* `Composer.sockets`
* `Composer.paths.draw`
* Canvas 2D text measurement and drawing APIs

Approximate complexity: Medium. Measurement and drawing are clear, but repeated socket methods share similar structure.

Suggestions for future modularization:

* Keep socket rendering separate from full block rendering.
* If more socket types are added, consider shared helper functions for common reporter-like sockets.
* Keep socket type names aligned with `Composer.library` parameter types.

## `Composer/renderer.js`

Purpose: Owns the preview canvas, converts block metadata into drawable components, measures components, and renders the preview.

Dependencies:

* `document.createElement`
* Canvas 2D APIs
* `Composer.paths`
* `Composer.sockets`
* Block metadata from `Composer.library`

Approximate complexity: Medium to high. It is a central runtime file with canvas lifecycle, measuring, drawing, resize handling, and future inline APIs.

Suggestions for future modularization:

* Keep canvas lifecycle and drawing logic separate if rendering grows.
* Consider moving component-building logic to `components.js`, which currently exists as an empty placeholder.
* Keep debug and resize behavior small and documented as the renderer grows.

## `Composer/blockly.js`

Purpose: Provides a small wrapper for accessing the main Blockly workspace and creating Blockly blocks by type.

Dependencies:

* Global `Blockly`
* `Blockly.getMainWorkspace()`
* Blockly block APIs: `newBlock`, `initSvg`, and `render`

Approximate complexity: Low.

Suggestions for future modularization:

* Keep this as the boundary between Composer and Blockly.
* Add future insertion/positioning behavior here rather than scattering direct Blockly calls across UI or generator modules.

## `Composer/generator.js`

Purpose: Matches typed input against Composer library patterns and asks the renderer to preview matching blocks. Contains a stub for future generation.

Dependencies:

* `Composer.generator`
* `Composer.library`
* `Composer.renderer.clear`
* `Composer.renderer.preview`

Approximate complexity: Low to medium. Matching is simple exact normalized string comparison, but this file is likely to become more important when real block generation is implemented.

Suggestions for future modularization:

* Remove debug logging in a future cleanup task when behavior stabilizes.
* Separate matching from rendering if generation logic grows.
* Decide whether this module should use `Composer.parser` or remain pattern-matching based.

## `Composer/ui.js`

Purpose: Creates and controls the Composer floating panel, handles dragging, keyboard shortcuts, text input, preview container setup, status text, and show/hide behavior.

Dependencies:

* `document` and DOM APIs
* `Composer.renderer`
* `Composer.generator.preview`
* Browser keyboard and mouse events

Approximate complexity: Medium to high. It combines DOM creation, inline styling, interaction handling, keyboard shortcuts, and renderer initialization.

Suggestions for future modularization:

* Move style constants or style creation out of the main init function if the UI grows.
* Keep interaction behavior separated from DOM construction where practical.
* Consider using `utils.js` for small shared DOM/style helpers if repeated UI code appears.

## `Composer/components.js`

Purpose: Currently empty.

Dependencies: None currently.

Approximate complexity: None.

Suggestions for future modularization:

* Good candidate for extracting renderer component-building or component measurement concepts.
* Keep unused until there is a concrete responsibility to avoid placeholder complexity.

## `Composer/utils.js`

Purpose: Currently empty.

Dependencies: None currently.

Approximate complexity: None.

Suggestions for future modularization:

* Use only for shared utilities that are genuinely reused by multiple modules.
* Avoid turning it into a catch-all file.

---

# 5. Technical Debt

## Duplicated logic

* `Composer/parser.js` defines command recognition separately from `Composer/library.js`, while `Composer/generator.js` uses library pattern matching instead of parser output. This creates multiple ways to represent user commands.
* Socket drawing methods in `Composer/sockets.js` repeat similar measure/draw/label structure.
* Text and sizing constants are repeated across renderer, sockets, and UI.

## Overly large files

* `Composer/library.js` is the largest file at roughly 975 lines. Its size is mostly block metadata, but it may become difficult to scan as more categories are added.
* `Composer/renderer.js` and `Composer/ui.js` are central files with multiple responsibilities and could become harder to maintain as features grow.

## Inconsistent naming and style

* Some modules use spaced formatting and many blank lines, while others are more compact.
* Function assignment style varies between `Name.method = function(){}` and named helper functions.
* `JTransformPlus.js` uses class-based Scratch extension style, while Composer uses global namespace modules. This is understandable because they target different runtime APIs.

## Missing comments

* Most files have section comments, but several non-obvious design decisions are not explained, including the reason for exact pattern matching and the intended relationship between parser, generator, and library.
* `JTransformPlus.js` does not document the risk of accessing Scratch renderer internals.

## Debug logging

* `Composer/generator.js`, `Composer/ui.js`, and `Composer/loader.user.js` contain console logging. Some of it may be useful during development, but it would be noisy for normal use.

## Maintainability risks

* The userscript loader uses `eval` on fetched GitHub raw files. This keeps the project build-free but means runtime loading depends on network availability and module order.
* Composer modules rely on a shared global `Composer` object and ordered initialization. Missing or reordered modules could cause runtime errors.
* `Composer/ui.js` uses inline DOM and style construction, which is simple now but may be harder to maintain as the interface expands.
* Canvas rendering is manually implemented. This is lightweight, but future block shapes and nested blocks will increase geometry complexity.
* `JTransformPlus.js` depends on Scratch renderer internals such as `_allDrawables`, which may be fragile across Scratch/Blockly runtime changes.

---

# 6. Opportunities

Future improvements that could be considered later:

* Connect Composer generation to real Blockly block insertion.
* Decide whether `Composer/parser.js` should power Composer matching, generation, or both.
* Split `Composer/library.js` by category once the block library grows further.
* Use `Composer/components.js` for component-building logic currently inside `renderer.js`.
* Use `Composer/utils.js` for truly shared helpers if repeated code appears.
* Add a small documented module load-order section for Composer.
* Add a basic manual testing checklist for Composer and Transform.
* Add clearer comments around Scratch renderer internals in `JTransformPlus.js`.
* Add a theme configuration layer if a Theme System becomes a real feature.
* Add Block Search as a separate module when implementation begins.
* Reduce normal-use console logging after active debugging ends.
* Add simple validation for block library entries to catch missing fields or unsupported parameter types.

No fixes are proposed in this audit as requested.

---

# 7. Overall Health

## Architecture: 7/10

The architecture is simple and understandable. Composer modules have recognizable boundaries: loader, parser, library, paths, sockets, renderer, Blockly adapter, generator, and UI. The main architectural risk is reliance on globals, ordered script loading, and `eval`. For the current project size and no-build philosophy, this is workable.

## Readability: 7/10

Most files are readable and use descriptive names. Section comments help navigation in rendering files. Readability is reduced by inconsistent formatting, large vertical spacing in some files, active debug logs, and the size of `Composer/library.js`.

## Maintainability: 6/10

The project is maintainable at its current size, especially because it avoids dependencies and keeps features small. Maintainability will become harder if Composer generation, nested blocks, themes, and search are added without splitting responsibilities further.

## Modularity: 7/10

Composer is already split into several modules with clear broad responsibilities. Some responsibilities are still concentrated in `renderer.js`, `ui.js`, and `library.js`, and placeholder modules are not yet used. The Transform extension is standalone and separate from Composer, which is a good boundary.

## Summary

Gandhi IDE is in an early but healthy stage. The strongest parts are its small scope, direct plain-JavaScript implementation, and clear Composer module names. The main risks are future growth around rendering, UI, and generation logic. The repository is well aligned with its stated philosophy of staying lightweight, beginner friendly, and dependency-free.
