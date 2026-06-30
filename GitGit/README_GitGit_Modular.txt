# GitGit Modular Setup

Upload the `GitGit` folder to your repository:

`JRonCamay/gandhi/GitGit/`

Install only this file in Tampermonkey:

`GitGit_Loader.user.js`

The Tampermonkey loader points to:

`https://raw.githubusercontent.com/JRonCamay/gandhi/main/GitGit/bootloader.js`

Then `bootloader.js` loads:

1. `config.js`
2. `utils.js`
3. `github-api.js`
4. `formatter.js`
5. `preview.js`
6. `search-tools.js`
7. `big-editor.js`

For now, most working code remains inside `big-editor.js` to avoid breaking the tool.
The helper module files are ready so we can move functions gradually later.
