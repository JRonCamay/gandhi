
// ui.js

(function () {
  window.ComposerUI = {};
  
  console.log("ui loaded");
    const ui = Composer.ui;

    let panel;
    let header;
    let editor;
    let status;

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    ui.init = function () {

        if (panel) return;

        panel = document.createElement("div");
        panel.id = "composer-panel";

        panel.innerHTML = `
            <div id="composer-header">
                🎼 Gandhi Composer v0.1
                <span id="composer-close">✖</span>
            </div>

            <textarea id="composer-editor" spellcheck="false"
placeholder="Type commands...

move 20
wait 1
say Hello"></textarea>

            <div id="composer-buttons">
                <button id="composer-generate">Generate</button>
                <button id="composer-clear">Clear</button>
                <button id="composer-example">Example</button>
            </div>

            <div id="composer-status">
                Ready
            </div>
        `;

        document.body.appendChild(panel);

        header = panel.querySelector("#composer-header");
        editor = panel.querySelector("#composer-editor");
        status = panel.querySelector("#composer-status");

        // ---------- STYLE ----------

        Object.assign(panel.style, {
            position: "fixed",
            top: "120px",
            left: "120px",
            width: "420px",
            height: "320px",
            background: "#1f1f1f",
            border: "1px solid #555",
            borderRadius: "8px",
            color: "white",
            fontFamily: "sans-serif",
            zIndex: 999999,
            display: "none",
            boxShadow: "0 0 15px rgba(0,0,0,.5)"
        });

        Object.assign(header.style, {
            padding: "10px",
            cursor: "move",
            background: "#333",
            userSelect: "none",
            fontWeight: "bold"
        });

        Object.assign(editor.style, {
            width: "calc(100% - 20px)",
            height: "180px",
            margin: "10px",
            resize: "none",
            background: "#111",
            color: "#fff",
            border: "1px solid #444",
            outline: "none",
            padding: "8px",
            boxSizing: "border-box",
            fontFamily: "Consolas, monospace",
            fontSize: "14px"
        });

        panel.querySelectorAll("button").forEach(btn => {

            btn.style.margin = "6px";
            btn.style.padding = "6px 12px";
            btn.style.cursor = "pointer";

        });

        Object.assign(status.style, {
            padding: "8px",
            fontSize: "12px",
            color: "#aaa"
        });

        panel.querySelector("#composer-close").onclick = ui.hide;

        panel.querySelector("#composer-clear").onclick = () => {

            editor.value = "";
            ui.setStatus("Cleared");

        };

        panel.querySelector("#composer-example").onclick = () => {

            editor.value =
`move 20
wait 1
say Hello`;

            ui.setStatus("Example loaded");

        };

        panel.querySelector("#composer-generate").onclick = () => {

            ui.setStatus("Generate clicked");

            if (Composer.generator.generate) {

                Composer.generator.generate(editor.value);

            }

        };

        // ---------- DRAG ----------

        header.addEventListener("mousedown", e => {

            dragging = true;

            offsetX = e.clientX - panel.offsetLeft;
            offsetY = e.clientY - panel.offsetTop;

        });

        document.addEventListener("mousemove", e => {

            if (!dragging) return;

            panel.style.left = (e.clientX - offsetX) + "px";
            panel.style.top = (e.clientY - offsetY) + "px";

        });

        document.addEventListener("mouseup", () => {

            dragging = false;

        });

    };

    ui.show = function () {

        panel.style.display = "block";
        editor.focus();

    };

    ui.hide = function () {

        panel.style.display = "none";

    };

    ui.toggle = function () {

        if (panel.style.display === "none")
            ui.show();
        else
            ui.hide();

    };

    ui.getText = function () {

        return editor.value;

    };

    ui.setText = function (text) {

        editor.value = text;

    };

    ui.setStatus = function (text) {

        status.textContent = text;

    };

    ui.init();

    document.addEventListener("keydown", e => {

        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p") {

            e.preventDefault();
            ui.toggle();

        }

        if (e.key === "Escape") {

            ui.hide();

        }

    });

})();
