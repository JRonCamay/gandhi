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

gen.preview = function(input){

    input = normalize(input);

    console.log("INPUT:", input);

    if(
        Composer.renderer &&
        Composer.renderer.clear
    ){
        Composer.renderer.clear();
    }

    if(!input.length)
        return;

    for(const cmd of Composer.library){

        const ok =
            normalizePattern(input) ===
            normalizePattern(cmd.pattern);

        console.log(
            cmd.pattern,
            ok
        );

        if(ok){

            console.log(
                "MATCH",
                cmd
            );

            if(
                Composer.renderer &&
                Composer.renderer.preview
            ){
                Composer.renderer.preview(cmd);
            }

            return;

        }

    }

    console.log("NO MATCH");

};

gen.generate = function(){

    // Block creation comes later.

};

})();
