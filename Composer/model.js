// model.js
(function () {

const model = {};

Composer.model = model;

let root = null;

model.getRoot = function(){
    return root;
};

model.clear = function(){
    root = null;
};

model.findCommand = function(blockIdOrPattern){
    if(!Composer.library) return null;

    return Composer.library.find(cmd =>
        cmd.block === blockIdOrPattern ||
        cmd.id === blockIdOrPattern ||
        cmd.pattern === blockIdOrPattern
    ) || null;
};

model.createBlock = function(blockIdOrPattern){
    const cmd = model.findCommand(blockIdOrPattern);

    if(!cmd) return null;

    return {
        type: "block",
        id: cmd.id,
        block: cmd.block,
        pattern: cmd.pattern,
        preview: cmd.preview,
        params: cmd.params.map(param => ({
            type: "slot",
            paramType: param.type,
            name: param.name,
            value: ""
        }))
    };
};

model.setRoot = function(blockIdOrPattern){
    root = model.createBlock(blockIdOrPattern);
    return root;
};

model.setParamValue = function(blockNode, index, value){
    if(!blockNode || !blockNode.params[index]) return false;

    blockNode.params[index].value = {
        type: "value",
        value: String(value)
    };

    return true;
};

model.setParamBlock = function(blockNode, index, blockIdOrPattern){
    if(!blockNode || !blockNode.params[index]) return null;

    const child = model.createBlock(blockIdOrPattern);

    if(!child) return null;

    blockNode.params[index].value = child;

    return child;
};

model.serialize = function(node){
    node = node || root;

    if(!node) return "";

    if(node.type === "value"){
        return node.value;
    }

    if(node.type !== "block"){
        return "";
    }

    const parts = node.pattern.split("[]");
    let text = "";

    for(let i = 0; i < parts.length; i++){
        text += parts[i];

        if(i < node.params.length){
            const param = node.params[i];
            text += "[" + serializeParam(param) + "]";
        }
    }

    return text.replace(/\s+/g, " ").trim();
};

function serializeParam(param){
    if(!param || !param.value){
        return " ";
    }

    if(typeof param.value === "string"){
        return param.value || " ";
    }

    if(param.value.type === "value"){
        return param.value.value || " ";
    }

    if(param.value.type === "block"){
        return model.serialize(param.value);
    }

    return " ";
}

model.toPreviewBlock = function(node){
    node = node || root;

    if(!node || node.type !== "block") return null;

    const cmd = model.findCommand(node.block);

    if(!cmd) return null;

    return {
        id: cmd.id,
        block: cmd.block,
        pattern: cmd.pattern,
        preview: cmd.preview,
        params: cmd.params
    };
};

})();
