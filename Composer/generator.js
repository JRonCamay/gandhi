// generator.js
(function () {

const gen = Composer.generator;

function normalize(text){

    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g," ");

}

function patternToRegex(pattern){

    pattern = normalize(pattern);

    // Escape regex characters except [] and :
    pattern = pattern.replace(/[.*+?^${}()|\\]/g, "\\$&");

    // Replace [] with a regex placeholder
    pattern = pattern.replace(/\[\]/g, "___PARAM___");

    // Allow one or more spaces between words
    pattern = pattern.replace(/ /g, "\\s+");

    // Replace placeholder back
    pattern = pattern.replace(/___PARAM___/g, "\\s+\\[\\]");

    return new RegExp("^" + pattern + "$", "i");

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

        const regex=patternToRegex(cmd.pattern);

        if(regex.test(input)){

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
