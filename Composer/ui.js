// ui.js
(function () {

const ui = Composer.ui;

let panel;
let header;
let editor;
let status;
let drag = false;
let dx = 0;
let dy = 0;

ui.init = function () {

if (panel) return;

panel = document.createElement("div");
panel.id = "composer-panel";

panel.innerHTML = `
<div id="composer-header">
   <span>🎼 Gandhi Composer v0.1</span>
   <button id="composer-close">✕</button>
</div>

<input
    id="composer-editor"
    type="text"
    spellcheck="false"
    autocomplete="off"
    placeholder="Type a command..."
>

<div id="composer-preview"></div>

<div id="composer-status">
Ready
</div>
`;

document.body.appendChild(panel);

header = panel.querySelector("#composer-header");
editor = panel.querySelector("#composer-editor");
status = panel.querySelector("#composer-status");

Object.assign(panel.style, {
position: "fixed",
left: "150px",
top: "120px",
width: "460px",
height: "360px",
background: "#1f1f1f",
border: "1px solid #444",
borderRadius: "8px",
boxShadow: "0 0 20px rgba(0,0,0,.4)",
color: "white",
zIndex: 99999999,
display: "none",
overflow: "hidden",
fontFamily: "Segoe UI,sans-serif"
});

Object.assign(header.style, {
height: "40px",
display: "flex",
alignItems: "center",
justifyContent: "space-between",
padding: "0 10px",
background: "#303030",
cursor: "move",
fontWeight: "bold",
userSelect: "none"
});

Object.assign(editor.style, {
width: "calc(100% - 20px)",
height: "220px",
margin: "10px",
resize: "none",
border: "1px solid #555",
background: "#111",
color: "#fff",
outline: "none",
padding: "8px",
fontFamily: "Consolas,monospace",
fontSize: "14px",
boxSizing: "border-box"
});

const toolbar = panel.querySelector("#composer-toolbar");

Object.assign(toolbar.style, {
padding: "0 10px"
});

toolbar.querySelectorAll("button").forEach(btn => {

btn.style.marginRight = "8px";
btn.style.padding = "6px 14px";
btn.style.cursor = "pointer";

});

Object.assign(status.style, {
position: "absolute",
left: "0",
right: "0",
bottom: "0",
padding: "8px 10px",
background: "#282828",
color: "#aaa",
fontSize: "12px"
});

panel.querySelector("#composer-close").onclick = ui.hide;

panel.querySelector("#composer-clear").onclick = () => {

editor.value = "";
ui.status("Cleared");

};

panel.querySelector("#composer-example").onclick = () => {

editor.value =
`move 20
wait 1
say Hello`;

ui.status("Example Loaded");

};

panel.querySelector("#composer-generate").onclick = () => {

ui.status("Generating...");

if (Composer.generator.generate) {

Composer.generator.generate(editor.value);

}

};

header.addEventListener("mousedown", e => {

drag = true;

dx = e.clientX - panel.offsetLeft;
dy = e.clientY - panel.offsetTop;

});

document.addEventListener("mousemove", e => {

if (!drag) return;

panel.style.left = (e.clientX - dx) + "px";
panel.style.top = (e.clientY - dy) + "px";

});

document.addEventListener("mouseup", () => {

drag = false;

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

ui.status = function (text) {

status.textContent = text;

};

ui.getText = function () {

return editor.value;

};

ui.setText = function (text) {

editor.value = text;

};

ui.init();

document.addEventListener("keydown", e => {

    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "c") {

        e.preventDefault();
        ui.toggle();

    }

    if (e.key === "Escape") {

        ui.hide();

    }

    if (e.ctrlKey && e.key === "Enter") {

        if (panel.style.display !== "none") {

            panel.querySelector("#composer-generate").click();

        }

    }

});
})();
