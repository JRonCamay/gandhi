// library.js

(function () {

Composer.library = [

/* ===========================================================
   MOTION
=========================================================== */

{
    id:"motion_movesteps",
    block:"motion_movesteps",
    pattern:"move [] steps",
    preview:"move () steps",
    params:[
        {name:"steps",type:"number"}
    ]
},

{
    id:"motion_turnright",
    block:"motion_turnright",
    pattern:"turn clockwise [] degrees",
    preview:"turn clockwise () degrees",
    params:[
        {name:"degrees",type:"number"}
    ]
},

{
    id:"motion_turnleft",
    block:"motion_turnleft",
    pattern:"turn counterclockwise [] degrees",
    preview:"turn counterclockwise () degrees",
    params:[
        {name:"degrees",type:"number"}
    ]
},

{
    id:"motion_goto",
    block:"motion_goto",
    pattern:"go to []",
    preview:"go to ()",
    params:[
        {name:"target",type:"menu"}
    ]
},

{
    id:"motion_gotoxy",
    block:"motion_gotoxy",
    pattern:"go to x: [] y: []",
    preview:"go to x: () y: ()",
    params:[
        {name:"x",type:"number"},
        {name:"y",type:"number"}
    ]
},

{
    id:"motion_glideto",
    block:"motion_glideto",
    pattern:"glide [] secs to []",
    preview:"glide () secs to ()",
    params:[
        {name:"seconds",type:"number"},
        {name:"target",type:"menu"}
    ]
},

{
    id:"motion_glidesecstoxy",
    block:"motion_glidesecstoxy",
    pattern:"glide [] secs to x: [] y: []",
    preview:"glide () secs to x: () y: ()",
    params:[
        {name:"seconds",type:"number"},
        {name:"x",type:"number"},
        {name:"y",type:"number"}
    ]
},

{
    id:"motion_pointindirection",
    block:"motion_pointindirection",
    pattern:"point in direction []",
    preview:"point in direction ()",
    params:[
        {name:"direction",type:"number"}
    ]
},

{
    id:"motion_pointtowards",
    block:"motion_pointtowards",
    pattern:"point towards []",
    preview:"point towards ()",
    params:[
        {name:"target",type:"menu"}
    ]
},

{
    id:"motion_changexby",
    block:"motion_changexby",
    pattern:"change x by []",
    preview:"change x by ()",
    params:[
        {name:"amount",type:"number"}
    ]
},

{
    id:"motion_setx",
    block:"motion_setx",
    pattern:"set x to []",
    preview:"set x to ()",
    params:[
        {name:"x",type:"number"}
    ]
},

{
    id:"motion_changeyby",
    block:"motion_changeyby",
    pattern:"change y by []",
    preview:"change y by ()",
    params:[
        {name:"amount",type:"number"}
    ]
},

{
    id:"motion_sety",
    block:"motion_sety",
    pattern:"set y to []",
    preview:"set y to ()",
    params:[
        {name:"y",type:"number"}
    ]
},

{
    id:"motion_ifonedgebounce",
    block:"motion_ifonedgebounce",
    pattern:"if on edge, bounce",
    preview:"if on edge, bounce",
    params:[]
},

{
    id:"motion_setrotationstyle",
    block:"motion_setrotationstyle",
    pattern:"set rotation style []",
    preview:"set rotation style ()",
    params:[
        {name:"style",type:"menu"}
    ]
},
/* ===========================================================
   LOOKS
=========================================================== */

{
    id:"looks_say",
    block:"looks_say",
    pattern:"say []",
    preview:"say ()",
    params:[
        {name:"message",type:"string"}
    ]
},

{
    id:"looks_sayforsecs",
    block:"looks_sayforsecs",
    pattern:"say [] for [] seconds",
    preview:"say () for () seconds",
    params:[
        {name:"message",type:"string"},
        {name:"seconds",type:"number"}
    ]
},

{
    id:"looks_think",
    block:"looks_think",
    pattern:"think []",
    preview:"think ()",
    params:[
        {name:"message",type:"string"}
    ]
},

{
    id:"looks_thinkforsecs",
    block:"looks_thinkforsecs",
    pattern:"think [] for [] seconds",
    preview:"think () for () seconds",
    params:[
        {name:"message",type:"string"},
        {name:"seconds",type:"number"}
    ]
},

{
    id:"looks_show",
    block:"looks_show",
    pattern:"show",
    preview:"show",
    params:[]
},

{
    id:"looks_hide",
    block:"looks_hide",
    pattern:"hide",
    preview:"hide",
    params:[]
},

{
    id:"looks_switchcostumeto",
    block:"looks_switchcostumeto",
    pattern:"switch costume to []",
    preview:"switch costume to ()",
    params:[
        {name:"costume",type:"menu"}
    ]
},

{
    id:"looks_nextcostume",
    block:"looks_nextcostume",
    pattern:"next costume",
    preview:"next costume",
    params:[]
},

{
    id:"looks_switchbackdropto",
    block:"looks_switchbackdropto",
    pattern:"switch backdrop to []",
    preview:"switch backdrop to ()",
    params:[
        {name:"backdrop",type:"menu"}
    ]
},

{
    id:"looks_nextbackdrop",
    block:"looks_nextbackdrop",
    pattern:"next backdrop",
    preview:"next backdrop",
    params:[]
},

{
    id:"looks_changesizeby",
    block:"looks_changesizeby",
    pattern:"change size by []",
    preview:"change size by ()",
    params:[
        {name:"amount",type:"number"}
    ]
},

{
    id:"looks_setsizeto",
    block:"looks_setsizeto",
    pattern:"set size to [] %",
    preview:"set size to () %",
    params:[
        {name:"size",type:"number"}
    ]
},

{
    id:"looks_changeeffectby",
    block:"looks_changeeffectby",
    pattern:"change [] effect by []",
    preview:"change () effect by ()",
    params:[
        {name:"effect",type:"menu"},
        {name:"amount",type:"number"}
    ]
},

{
    id:"looks_seteffectto",
    block:"looks_seteffectto",
    pattern:"set [] effect to []",
    preview:"set () effect to ()",
    params:[
        {name:"effect",type:"menu"},
        {name:"value",type:"number"}
    ]
},

{
    id:"looks_cleargraphiceffects",
    block:"looks_cleargraphiceffects",
    pattern:"clear graphic effects",
    preview:"clear graphic effects",
    params:[]
},
/* ===========================================================
   SOUND
=========================================================== */

{
    id:"sound_play",
    block:"sound_play",
    pattern:"start sound []",
    preview:"start sound ()",
    params:[
        {name:"sound",type:"menu"}
    ]
},

{
    id:"sound_playuntildone",
    block:"sound_playuntildone",
    pattern:"play sound [] until done",
    preview:"play sound () until done",
    params:[
        {name:"sound",type:"menu"}
    ]
},

{
    id:"sound_stopallsounds",
    block:"sound_stopallsounds",
    pattern:"stop all sounds",
    preview:"stop all sounds",
    params:[]
},

{
    id:"sound_changeeffectby",
    block:"sound_changeeffectby",
    pattern:"change [] effect by []",
    preview:"change () effect by ()",
    params:[
        {name:"effect",type:"menu"},
        {name:"amount",type:"number"}
    ]
},

{
    id:"sound_seteffectto",
    block:"sound_seteffectto",
    pattern:"set [] effect to []",
    preview:"set () effect to ()",
    params:[
        {name:"effect",type:"menu"},
        {name:"value",type:"number"}
    ]
},

{
    id:"sound_cleareffects",
    block:"sound_cleareffects",
    pattern:"clear sound effects",
    preview:"clear sound effects",
    params:[]
},

{
    id:"sound_changevolumeby",
    block:"sound_changevolumeby",
    pattern:"change volume by []",
    preview:"change volume by ()",
    params:[
        {name:"amount",type:"number"}
    ]
},

{
    id:"sound_setvolumeto",
    block:"sound_setvolumeto",
    pattern:"set volume to [] %",
    preview:"set volume to () %",
    params:[
        {name:"volume",type:"number"}
    ]
},

/* ===========================================================
   EVENTS
=========================================================== */

{
    id:"event_whenflagclicked",
    block:"event_whenflagclicked",
    pattern:"when green flag clicked",
    preview:"when green flag clicked",
    params:[]
},

{
    id:"event_whenkeypressed",
    block:"event_whenkeypressed",
    pattern:"when [] key pressed",
    preview:"when () key pressed",
    params:[
        {name:"key",type:"menu"}
    ]
},

{
    id:"event_whenthisspriteclicked",
    block:"event_whenthisspriteclicked",
    pattern:"when this sprite clicked",
    preview:"when this sprite clicked",
    params:[]
},

{
    id:"event_whenbackdropswitchesto",
    block:"event_whenbackdropswitchesto",
    pattern:"when backdrop switches to []",
    preview:"when backdrop switches to ()",
    params:[
        {name:"backdrop",type:"menu"}
    ]
},

{
    id:"event_whengreaterthan",
    block:"event_whengreaterthan",
    pattern:"when [] > []",
    preview:"when () > ()",
    params:[
        {name:"sensor",type:"menu"},
        {name:"value",type:"number"}
    ]
},

{
    id:"event_whenbroadcastreceived",
    block:"event_whenbroadcastreceived",
    pattern:"when i receive []",
    preview:"when i receive ()",
    params:[
        {name:"broadcast",type:"broadcast"}
    ]
},

{
    id:"event_broadcast",
    block:"event_broadcast",
    pattern:"broadcast []",
    preview:"broadcast ()",
    params:[
        {name:"broadcast",type:"broadcast"}
    ]
},

{
    id:"event_broadcastandwait",
    block:"event_broadcastandwait",
    pattern:"broadcast [] and wait",
    preview:"broadcast () and wait",
    params:[
        {name:"broadcast",type:"broadcast"}
    ]
},
/* ===========================================================
   CONTROL
=========================================================== */

{
    id:"control_wait",
    block:"control_wait",
    pattern:"wait [] seconds",
    preview:"wait () seconds",
    params:[
        {name:"seconds",type:"number"}
    ]
},

{
    id:"control_repeat",
    block:"control_repeat",
    pattern:"repeat []",
    preview:"repeat ()",
    params:[
        {name:"times",type:"number"}
    ]
},

{
    id:"control_forever",
    block:"control_forever",
    pattern:"forever",
    preview:"forever",
    params:[]
},

{
    id:"control_if",
    block:"control_if",
    pattern:"if [] then",
    preview:"if () then",
    params:[
        {name:"condition",type:"boolean"}
    ]
},

{
    id:"control_if_else",
    block:"control_if_else",
    pattern:"if [] then else",
    preview:"if () then else",
    params:[
        {name:"condition",type:"boolean"}
    ]
},

{
    id:"control_wait_until",
    block:"control_wait_until",
    pattern:"wait until []",
    preview:"wait until ()",
    params:[
        {name:"condition",type:"boolean"}
    ]
},

{
    id:"control_repeat_until",
    block:"control_repeat_until",
    pattern:"repeat until []",
    preview:"repeat until ()",
    params:[
        {name:"condition",type:"boolean"}
    ]
},

{
    id:"control_stop",
    block:"control_stop",
    pattern:"stop []",
    preview:"stop ()",
    params:[
        {name:"option",type:"menu"}
    ]
},

{
    id:"control_create_clone_of",
    block:"control_create_clone_of",
    pattern:"create clone of []",
    preview:"create clone of ()",
    params:[
        {name:"target",type:"menu"}
    ]
},

{
    id:"control_delete_this_clone",
    block:"control_delete_this_clone",
    pattern:"delete this clone",
    preview:"delete this clone",
    params:[]
},

{
    id:"control_start_as_clone",
    block:"control_start_as_clone",
    pattern:"when i start as a clone",
    preview:"when i start as a clone",
    params:[]
},

/* ===========================================================
   SENSING
=========================================================== */

{
    id:"sensing_touchingobject",
    block:"sensing_touchingobject",
    pattern:"touching []?",
    preview:"touching ()?",
    params:[
        {name:"object",type:"menu"}
    ]
},

{
    id:"sensing_touchingcolor",
    block:"sensing_touchingcolor",
    pattern:"touching color []?",
    preview:"touching color ()?",
    params:[
        {name:"color",type:"color"}
    ]
},

{
    id:"sensing_coloristouchingcolor",
    block:"sensing_coloristouchingcolor",
    pattern:"color [] is touching []?",
    preview:"color () is touching ()?",
    params:[
        {name:"color1",type:"color"},
        {name:"color2",type:"color"}
    ]
},

{
    id:"sensing_distanceto",
    block:"sensing_distanceto",
    pattern:"distance to []",
    preview:"distance to ()",
    params:[
        {name:"target",type:"menu"}
    ]
},

{
    id:"sensing_askandwait",
    block:"sensing_askandwait",
    pattern:"ask [] and wait",
    preview:"ask () and wait",
    params:[
        {name:"question",type:"string"}
    ]
},

{
    id:"sensing_answer",
    block:"sensing_answer",
    pattern:"answer",
    preview:"answer",
    params:[]
},

{
    id:"sensing_keypressed",
    block:"sensing_keypressed",
    pattern:"key [] pressed?",
    preview:"key () pressed?",
    params:[
        {name:"key",type:"menu"}
    ]
},

{
    id:"sensing_mousedown",
    block:"sensing_mousedown",
    pattern:"mouse down?",
    preview:"mouse down?",
    params:[]
},

{
    id:"sensing_mousex",
    block:"sensing_mousex",
    pattern:"mouse x",
    preview:"mouse x",
    params:[]
},

{
    id:"sensing_mousey",
    block:"sensing_mousey",
    pattern:"mouse y",
    preview:"mouse y",
    params:[]
},
    /* ===========================================================
   OPERATORS
=========================================================== */

{
    id:"operator_add",
    block:"operator_add",
    pattern:"[] + []",
    preview:"() + ()",
    params:[
        {name:"a",type:"reporter"},
        {name:"b",type:"reporter"}
    ]
},

{
    id:"operator_subtract",
    block:"operator_subtract",
    pattern:"[] - []",
    preview:"() - ()",
    params:[
        {name:"a",type:"reporter"},
        {name:"b",type:"reporter"}
    ]
},

{
    id:"operator_multiply",
    block:"operator_multiply",
    pattern:"[] * []",
    preview:"() * ()",
    params:[
        {name:"a",type:"reporter"},
        {name:"b",type:"reporter"}
    ]
},

{
    id:"operator_divide",
    block:"operator_divide",
    pattern:"[] / []",
    preview:"() / ()",
    params:[
        {name:"a",type:"reporter"},
        {name:"b",type:"reporter"}
    ]
},

{
    id:"operator_random",
    block:"operator_random",
    pattern:"pick random [] to []",
    preview:"pick random () to ()",
    params:[
        {name:"from",type:"reporter"},
        {name:"to",type:"reporter"}
    ]
},

{
    id:"operator_gt",
    block:"operator_gt",
    pattern:"[] > []",
    preview:"() > ()",
    params:[
        {name:"a",type:"reporter"},
        {name:"b",type:"reporter"}
    ]
},

{
    id:"operator_lt",
    block:"operator_lt",
    pattern:"[] < []",
    preview:"() < ()",
    params:[
        {name:"a",type:"reporter"},
        {name:"b",type:"reporter"}
    ]
},

{
    id:"operator_equals",
    block:"operator_equals",
    pattern:"[] = []",
    preview:"() = ()",
    params:[
        {name:"a",type:"reporter"},
        {name:"b",type:"reporter"}
    ]
},

{
    id:"operator_and",
    block:"operator_and",
    pattern:"[] and []",
    preview:"() and ()",
    params:[
        {name:"a",type:"boolean"},
        {name:"b",type:"boolean"}
    ]
},

{
    id:"operator_or",
    block:"operator_or",
    pattern:"[] or []",
    preview:"() or ()",
    params:[
        {name:"a",type:"boolean"},
        {name:"b",type:"boolean"}
    ]
},

{
    id:"operator_not",
    block:"operator_not",
    pattern:"not []",
    preview:"not ()",
    params:[
        {name:"condition",type:"boolean"}
    ]
},

{
    id:"operator_join",
    block:"operator_join",
    pattern:"join [] []",
    preview:"join () ()",
    params:[
        {name:"text1",type:"string"},
        {name:"text2",type:"string"}
    ]
},

{
    id:"operator_letter_of",
    block:"operator_letter_of",
    pattern:"letter [] of []",
    preview:"letter () of ()",
    params:[
        {name:"index",type:"number"},
        {name:"text",type:"string"}
    ]
},

{
    id:"operator_length",
    block:"operator_length",
    pattern:"length of []",
    preview:"length of ()",
    params:[
        {name:"text",type:"string"}
    ]
},

{
    id:"operator_contains",
    block:"operator_contains",
    pattern:"[] contains []",
    preview:"() contains ()",
    params:[
        {name:"text",type:"string"},
        {name:"search",type:"string"}
    ]
},

{
    id:"operator_mod",
    block:"operator_mod",
    pattern:"[] mod []",
    preview:"() mod ()",
    params:[
        {name:"a",type:"number"},
        {name:"b",type:"number"}
    ]
},

{
    id:"operator_round",
    block:"operator_round",
    pattern:"round []",
    preview:"round ()",
    params:[
        {name:"value",type:"number"}
    ]
},

{
    id:"operator_mathop",
    block:"operator_mathop",
    pattern:"[] of []",
    preview:"() of ()",
    params:[
        {name:"operation",type:"menu"},
        {name:"value",type:"number"}
    ]
},

/* ===========================================================
   VARIABLES
=========================================================== */

{
    id:"data_setvariableto",
    block:"data_setvariableto",
    pattern:"set [] to []",
    preview:"set () to ()",
    params:[
        {name:"variable",type:"variable"},
        {name:"value",type:"reporter"}
    ]
},

{
    id:"data_changevariableby",
    block:"data_changevariableby",
    pattern:"change [] by []",
    preview:"change () by ()",
    params:[
        {name:"variable",type:"variable"},
        {name:"value",type:"number"}
    ]
},

{
    id:"data_showvariable",
    block:"data_showvariable",
    pattern:"show variable []",
    preview:"show variable ()",
    params:[
        {name:"variable",type:"variable"}
    ]
},

{
    id:"data_hidevariable",
    block:"data_hidevariable",
    pattern:"hide variable []",
    preview:"hide variable ()",
    params:[
        {name:"variable",type:"variable"}
    ]
},

/* ===========================================================
   LISTS
=========================================================== */

{
    id:"data_addtolist",
    block:"data_addtolist",
    pattern:"add [] to []",
    preview:"add () to ()",
    params:[
        {name:"item",type:"reporter"},
        {name:"list",type:"list"}
    ]
},

{
    id:"data_deleteoflist",
    block:"data_deleteoflist",
    pattern:"delete [] of []",
    preview:"delete () of ()",
    params:[
        {name:"index",type:"reporter"},
        {name:"list",type:"list"}
    ]
},

{
    id:"data_insertatlist",
    block:"data_insertatlist",
    pattern:"insert [] at [] of []",
    preview:"insert () at () of ()",
    params:[
        {name:"item",type:"reporter"},
        {name:"index",type:"reporter"},
        {name:"list",type:"list"}
    ]
},

{
    id:"data_replaceitemoflist",
    block:"data_replaceitemoflist",
    pattern:"replace item [] of [] with []",
    preview:"replace item () of () with ()",
    params:[
        {name:"index",type:"reporter"},
        {name:"list",type:"list"},
        {name:"item",type:"reporter"}
    ]
}

/* Add My Blocks here in the future */

];

})();
