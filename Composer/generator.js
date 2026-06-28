// generator.js
(function () {

const gen = Composer.generator;

function normalize(text){

    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g," ");

}

function normalizePattern(text){

    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g," ")
        .replace(/:\s+\[\]/g,": []");

}
function makePreview(text){

    return `
<div style="
background:#4C97FF;
color:white;
padding:8px 12px;
border-radius:6px;
display:inline-block;
font-weight:bold;
font-family:Segoe UI;
">
${text}
</div>
`;

}

gen.preview=function(input){

    input=normalize(input);

    Composer.ui.setPreview("");

    if(!input.length)
        return;

    for(const cmd of Composer.library){

       if(normalizePattern(input) === normalizePattern(cmd.pattern)){

            Composer.ui.setPreview(
                makePreview(cmd.preview)
            );

            return;

        }

    }

};
gen.generate = function () {

    // Block creation comes later.

};

})();
