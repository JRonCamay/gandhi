# Gandhi IDE Development Guide

This document is the permanent development guide for the Gandhi IDE project. It is written for human contributors and AI coding agents alike.

---

## Project Philosophy

Gandhi IDE is intended to be:

- **Simple** — easy to understand at a glance
- **Easy to maintain** — changes should be localized and predictable
- **Beginner-friendly** — approachable for developers new to the codebase
- **Modular** — features live in focused, independent files
- **Fast** — lightweight runtime with no build overhead
- **Written in plain JavaScript** — no TypeScript, no JSX, no abstractions that hide behavior
- **No build tools** — clone and run
- **No frameworks** — no React, Vue, Angular, or similar
- **No transpilers** — no Babel, Webpack, Vite, or Rollup

The repository itself should always be runnable without a build step.

---

## Coding Standards

Follow these rules when writing or modifying code:

- Use plain ES6 JavaScript.
- Keep code readable over clever.
- Preserve existing behavior unless explicitly changing it.
- Never introduce unnecessary dependencies.
- Avoid modifying unrelated code.
- Prefer small reusable functions.
- Use descriptive function names.
- Comment non-obvious logic.
- Minimize global variables.

---

## File Organization

Prefer this structure as the project grows:

```
userscripts/
    Composer.js
    BlockSearch.js
    TransformBox.js

composer/
    parser.js
    generator.js
    colors.js
    ui.js
```

**One feature per file** whenever practical. Keep related logic together, but avoid large monolithic files when a module split would improve clarity.

---

## AI Development Rules

This section applies specifically to AI coding agents working on Gandhi IDE.

### The AI must

- Preserve all existing functionality.
- Never rewrite the whole repository unnecessarily.
- Modify only files related to the requested feature.
- Follow existing code style.
- Keep backward compatibility whenever possible.
- Avoid introducing breaking changes.
- Keep implementations simple.

### Before finishing a task, the AI should

- Review its own changes.
- Look for syntax errors.
- Remove unused variables.
- Remove debug logging unless requested.
- Verify no duplicate functions were introduced.

---

## Git Commit Style

Use conventional commit prefixes:

```
feat(...)
fix(...)
refactor(...)
style(...)
docs(...)
perf(...)
```

### Examples

```
feat(composer): add autocomplete

fix(search): prevent duplicate insertion

refactor(transform): simplify resize logic

docs: update development guide
```

Keep commit messages short, descriptive, and scoped to the change.

---

## Gandhi IDE Principles

1. **Simplicity over complexity** — choose the straightforward solution.
2. **Readability over cleverness** — code is read more often than it is written.
3. **Preserve existing functionality** — do not break what already works.
4. **Modular design** — isolate features into focused modules.
5. **Features should be expandable without rewriting existing systems** — extend, do not replace.
6. **Keep UI responsive** — avoid blocking the main thread unnecessarily.
7. **Keep architecture understandable** — a new contributor should grasp the layout quickly.

---

## Repository Workflow

Follow this workflow for every feature or fix:

1. **Design the feature** — clarify scope and affected files before coding.
2. **Implement the feature** — make focused, minimal changes.
3. **Review code** — read the diff and check for regressions.
4. **Test manually** — verify behavior in the browser or target environment.
5. **Commit** — use the commit style defined above.
6. **Push to GitHub** — share changes with the remote repository.

---

## Future Modules

Track planned and in-progress systems:

- [ ] Composer
- [ ] Block Search
- [ ] Transform Box
- [ ] Extensions
- [ ] Theme System
- [ ] Plugin System
- [ ] Keyboard Shortcuts
- [ ] Command Palette
- [ ] Search Index
- [ ] Parser
- [ ] Generator
- [ ] Documentation

Update this checklist as modules are implemented or priorities change.

---

## Closing Note

Gandhi IDE is intended to grow as a long-term open-source project. Every contribution should emphasize **maintainability**, **simplicity**, and **extensibility** so the project remains approachable and useful for years to come.
