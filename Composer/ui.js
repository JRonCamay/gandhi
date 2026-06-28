const input = document.createElement("input");
input.type = "text";
input.id = "composer-input";
input.placeholder = "Type a command...";

const preview = document.createElement("div");
preview.id = "composer-preview";

panel.append(input);
panel.append(preview);

Object.assign(input.style,{
    width:"100%",
    padding:"10px",
    fontSize:"16px",
    boxSizing:"border-box"
});

Object.assign(preview.style,{
    marginTop:"10px"
});
