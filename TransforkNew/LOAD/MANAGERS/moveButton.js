window.TransforkNew.LOAD.defineManager({
    id: "MOVEBUTTON",
    stations: [
        { file: "UI/ELEMENTS/BUTTONS/MOVEBUTTON/STATE/create.js" },
        { file: "UI/ELEMENTS/BUTTONS/MOVEBUTTON/STATE/reset.js" },
        { file: "UI/ELEMENTS/BUTTONS/MOVEBUTTON/STATE/index.js" },
        { file: "UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAW/createNode.js" },
        { file: "UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAW/applyPosition.js" },
        { file: "UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAW/attachToBox.js" },
        { file: "UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAW/index.js" },
        { manager: "MOVEBUTTON_DRAG" },
        { manager: "MOVEBUTTON_EVENTS" },
        { file: "UI/ELEMENTS/BUTTONS/moveButton.js" },
        { file: "UI/ELEMENTS/BUTTONS/MOVEBUTTON/draw.js" },
        { file: "UI/ELEMENTS/BUTTONS/MOVEBUTTON/mouseDown.js" },
        { file: "UI/ELEMENTS/BUTTONS/MOVEBUTTON/mouseMove.js" },
        { file: "UI/ELEMENTS/BUTTONS/MOVEBUTTON/mouseUp.js" }
    ]
});
