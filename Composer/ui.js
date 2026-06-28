console.log("ui.js running");

Composer.ui.test = true;

document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p") {
        alert("Composer works!");
    }
});
