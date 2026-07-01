# ChadTheGreat Extension Setup

ChadTheGreat is now meant to run as a Chrome extension.

## Install in Developer Mode

1. Download or clone the repository locally.

```bash
git clone https://github.com/JRonCamay/gandhi.git
```

2. Open Chrome.

```text
chrome://extensions
```

3. Turn on Developer Mode.

4. Click Load unpacked.

5. Select this folder:

```text
gandhi/ChadTheGreat
```

Select the folder itself, not a single file.

## Important

Disable the old Tampermonkey Chad script while testing the extension.

If both are enabled, two Chad panels may appear.

## Development Workflow

Edit any file inside:

```text
gandhi/ChadTheGreat
```

Then:

```text
Refresh the ChatGPT page
```

If changes do not appear:

```text
chrome://extensions
→ ChadTheGreat
→ Reload
→ Refresh ChatGPT
```

## Files

```text
manifest.json       Chrome extension config
background.js       Extension background worker: tabs and Chaties group
content.js          Starts Chad on ChatGPT pages
bridge.js           Connects Chad UI to extension powers
data.js             Rules and default data
storage.js          Local chat storage
scanner.js          Task scanner
actions.js          UI actions
ui.js               Main Chad panel
agents.js           Chaties and agents
paint.js            Quick Sketch
```

## What should work

- Chad appears on ChatGPT pages without Tampermonkey.
- Clicking the extension icon opens or focuses ChatGPT.
- Current ChatGPT tab is placed into a tab group named Chaties.
- Agent tabs should reuse existing matching tabs.
- Agent tabs should be moved into the Chaties tab group.
- Quick Sketch still works inside the page.

## Current Limitation

The extension is still loaded from local files. After pulling changes from GitHub, refresh the page. If Chrome caches old extension code, reload the extension once.
