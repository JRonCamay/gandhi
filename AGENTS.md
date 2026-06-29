# Gandhi IDE AI Instructions

## Project

Gandhi IDE is a Scratch/Blockly enhancement project.

Goals:

* Improve the editing experience.
* Keep the project lightweight.
* Keep the project modular.
* Keep the project beginner friendly.
* Preserve compatibility with Scratch and Blockly whenever possible.

---

## Technology

* Plain JavaScript (ES6)
* HTML
* CSS

Never introduce:

* TypeScript
* React
* Vue
* Angular
* npm packages
* Build tools
* Webpack
* Vite
* Babel

unless explicitly requested.

---

## Project Philosophy

Always prefer:

* Simplicity over complexity.
* Readability over cleverness.
* Small reusable modules.
* Minimal dependencies.

---

## Golden Rules

These rules override all others.

1. Preserve existing functionality unless explicitly instructed otherwise.

2. Never remove working features.

3. Never rewrite unrelated systems.

4. Never modify files unrelated to the requested task.

5. Keep changes as small as possible.

6. Prefer extending existing code instead of replacing it.

7. If uncertain, ask for clarification instead of making assumptions.

---

## Coding Standards

* Use ES6 syntax.
* Prefer `const`.
* Use `let` only when reassignment is required.
* Never use `var`.
* Use descriptive function names.
* Avoid duplicate logic.
* Write readable code.
* Add comments only where the logic is not obvious.

---

## Repository Structure

Each major feature should live in its own module whenever practical.

Examples include:

* Composer
* Block Search
* Transform Box
* Theme System
* Extensions
* Utilities

Keep modules loosely coupled.

---

## AI Workflow

Before changing code:

1. Read the relevant files.
2. Understand the existing implementation.
3. Explain the implementation plan.
4. Wait for approval if the change is architectural.

After changing code:

1. Review the code.
2. Check for syntax errors.
3. Remove debug logging.
4. Remove unused variables.
5. Ensure existing functionality is preserved.

---

## Commit Style

Use Conventional Commits.

Examples:

```text
feat(composer): add autocomplete

fix(search): prevent duplicate insertion

refactor(transform): simplify resize logic

docs: update AGENTS.md
```

---

## Final Principle

When multiple solutions exist, always choose the one that is easiest to maintain and easiest for future contributors to understand.
