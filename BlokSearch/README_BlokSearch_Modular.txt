# BlokSearch Modular Setup

Upload the `BlokSearch` folder to:

`JRonCamay/gandhi/BlokSearch/`

Install only this file in Tampermonkey:

`BlokSearch_Loader.user.js`

Required GitHub structure:

BlokSearch/
- bootloader.js
- config.js
- utils.js
- smart-search-data.js
- history.js
- blockly-adapter.js
- ui.js
- bloksearch-main.js

For safety, the original working script is kept mostly intact inside `bloksearch-main.js`.
The other files are future-proof module placeholders so we can move functions gradually later.
