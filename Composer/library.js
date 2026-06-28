// library.js

(function () {

Composer.library = [

{
    id: "motion_gotoxy",
    block: "motion_gotoxy",
    pattern: "go to x: [] y: []",
    preview: "go to x: () y: ()"
},

{
    id: "motion_movesteps",
    block: "motion_movesteps",
    pattern: "move [] steps",
    preview: "move () steps"
},

{
    id: "motion_turnright",
    block: "motion_turnright",
    pattern: "turn clockwise [] degrees",
    preview: "turn ↻ () degrees"
},

{
    id: "motion_turnleft",
    block: "motion_turnleft",
    pattern: "turn counterclockwise [] degrees",
    preview: "turn ↺ () degrees"
},

{
    id: "motion_goto",
    block: "motion_goto",
    pattern: "go to []",
    preview: "go to ()"
},

{
    id: "motion_glidesecstoxy",
    block: "motion_glidesecstoxy",
    pattern: "glide [] secs to x: [] y: []",
    preview: "glide () secs to x: () y: ()"
},

{
    id: "looks_say",
    block: "looks_say",
    pattern: "say []",
    preview: "say ()"
},

{
    id: "looks_think",
    block: "looks_think",
    pattern: "think []",
    preview: "think ()"
},

{
    id: "looks_show",
    block: "looks_show",
    pattern: "show",
    preview: "show"
},

{
    id: "looks_hide",
    block: "looks_hide",
    pattern: "hide",
    preview: "hide"
},

{
    id: "control_wait",
    block: "control_wait",
    pattern: "wait [] seconds",
    preview: "wait () seconds"
}

];

})();
