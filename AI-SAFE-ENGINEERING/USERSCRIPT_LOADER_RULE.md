# Userscript Loader Rule

## Mandatory Rule

All Tampermonkey userscript entry files must live only in:

```text
userscripts/
```

No agent may create another userscripts folder anywhere else.

Forbidden examples:

```text
TransforkNew/userscripts/
local/userscript/
local/userScripts/
Gandhi/userscripts/
Composer/userscripts/
<feature>/userscripts/
```

## Canonical TransforkNew Loader

Tampermonkey entry file:

```text
userscripts/TransforkNew_Loader.js
```

Runtime module loader:

```text
TransforkNew/Transfork_Loader.js
```

The Tampermonkey entry file must load the runtime module loader from GitHub raw:

```text
https://raw.githubusercontent.com/JRonCamay/gandhi/main/TransforkNew/Transfork_Loader.js
```

## Local Mirror

If a local userscript mirror is required, the only allowed mirror path is:

```text
D:\Projects\Chad\local\userscripts\
```

The mirrored file must match the canonical repository file.

## AI Agent Rule

Before creating or modifying any Tampermonkey loader, the agent must check:

```text
userscripts/
```

If the loader already exists there, update that file only.

Do not create a new loader folder.
Do not create a duplicate loader.
Do not move the loader unless explicitly requested.
Do not paste a full module loader directly into a different Tampermonkey file.

## Required Loader Pattern

Each Tampermonkey userscript should be thin.

It should only bootstrap the real loader or feature module from the repository.

For TransforkNew:

```text
userscripts/TransforkNew_Loader.js
    -> TransforkNew/Transfork_Loader.js
```

## Verification

After editing a loader, verify:

```text
userscripts/TransforkNew_Loader.js exists
TransforkNew/Transfork_Loader.js exists
No duplicate userscripts folder was created
Tampermonkey version matches the repository version
```
