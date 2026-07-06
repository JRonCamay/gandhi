# TransforkNew

Temporary clean rewrite of Transfork.

Root rule:
- Only `Transfork_Main.js`, `Transfork_Loader.js`, and `README.md` live in this folder.
- All other code lives inside capital-letter subfolders.

Architecture rule:
- One object = one folder.
- One method = one file.
- One file = one job.
- UI creates and updates UI only.
- Transform execution belongs to engine/tool sequence modules, not UI files.

Migration plan:
- Build and test here.
- After feature parity, delete old `Transfork/`.
- Rename `TransforkNew/` to `Transfork/`.
