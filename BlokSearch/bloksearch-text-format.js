/*
BlokSearch/bloksearch-text-format.js
ShadowRoot-scoped text formatting styles for BlokSearch previews.
*/
window.BlokSearchTextFormat = {
    start() {
        this.injectStyle();
    },

    injectStyle() {
        const cssText = `
            :host {
                all: initial;
            }

            #gandi-search,
            #gandi-search * {
                box-sizing: border-box;
            }

            #gandi-search span[style*="Consolas"],
            #gandi-search span[style*="Monaco"],
            #gandi-search span[style*="Courier New"] {
                font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;
                font-weight: 400 !important;
                background: #ffffff !important;
                color: #575e75 !important;
                padding: 1px 7px !important;
                border-radius: 999px !important;
                font-size: 11px !important;
                line-height: 15px !important;
                min-width: 12px !important;
                text-align: center !important;
                box-shadow: inset 0 -1px 0 rgba(0,0,0,0.18) !important;
                vertical-align: middle !important;
                margin: 0 2px !important;
            }
        `;

        if (window.BlokSearch?.ui?.injectStyle) {
            window.BlokSearch.ui.injectStyle(
                "bloksearch-text-format-style",
                cssText
            );
        }
    }
};

window.BlokSearchTextFormat.start();