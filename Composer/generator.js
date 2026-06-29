// generator.js
(function () {

const gen = Composer.generator;

function normalize(text){
    return String(text || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g," ");
}

function normalizePattern(text){
    return normalize(text)
        .replace(/:\s+\[\]/g,": []")
        .replace(/\[\s*\]/g,"[]");
}

function getActiveText(input){
    const slot = getInnermostSlot(input, input.length);

    if(slot){
        return input.slice(slot.innerStart, slot.innerEnd);
    }

    return input;
}

function getInnermostSlot(text, cursor){
    const slots = [];

    for(let i=0;i<text.length;i++){
        if(text[i] !== "[") continue;

        const end = findClosingBracket(text, i);
        if(end === -1) continue;

        if(cursor >= i + 1 && cursor <= end){
            slots.push({
                start:i,
                end:end + 1,
                innerStart:i + 1,
                innerEnd:end
            });
        }
    }

    if(!slots.length) return null;

    return slots.sort((a,b)=>
        (a.end - a.start) - (b.end - b.start)
    )[0];
}

function findClosingBracket(text, start){
    let depth = 0;

    for(let i=start;i<text.length;i++){
        if(text[i] === "[") depth++;

        if(text[i] === "]"){
            depth--;
            if(depth === 0) return i;
        }
    }

    return -1;
}

function patternMatchesInput(input, pattern){
    return normalizePattern(input) === normalizePattern(pattern);
}

function patternStartsWithInput(input, pattern){
    const cleanInput = normalizePattern(input);
    const cleanPattern = normalizePattern(pattern);

    if(!cleanInput) return false;

    return cleanPattern.startsWith(cleanInput);
}

function patternContainsInput(input, pattern){
    const cleanInput = normalizePattern(input);
    const cleanPattern = normalizePattern(pattern);

    if(!cleanInput) return false;

    return cleanPattern.includes(cleanInput);
}

function scoreCandidate(input, cmd){
    const pattern = cmd.pattern || "";
    const cleanInput = normalizePattern(input);
    const cleanPattern = normalizePattern(pattern);

    if(cleanInput === cleanPattern) return 1000;
    if(cleanPattern.startsWith(cleanInput)) return 800;
    if(cleanPattern.includes(cleanInput)) return 500;

    return 0;
}

function getCandidates(input){
    const candidates = [];

    for(const cmd of Composer.library){
        const score = scoreCandidate(input, cmd);

        if(score > 0){
            candidates.push({
                cmd,
                score
            });
        }
    }

    return candidates
        .sort((a,b)=>{
            if(b.score !== a.score) return b.score - a.score;
            return a.cmd.pattern.length - b.cmd.pattern.length;
        })
        .map(item => item.cmd);
}

gen.preview = function(input){
    const rawInput = String(input || "");
    const activeText = getActiveText(rawInput);
    const normalizedActive = normalize(activeText);

    if(Composer.renderer && Composer.renderer.clear){
        Composer.renderer.clear();
    }

    if(!normalizedActive.length){
        return;
    }

    const candidates = getCandidates(normalizedActive);

    if(!candidates.length){
        return;
    }

    if(Composer.renderer && Composer.renderer.preview){
        Composer.renderer.preview(candidates[0]);
    }
};

gen.getPreviewCandidates = function(input){
    const rawInput = String(input || "");
    const activeText = getActiveText(rawInput);

    return getCandidates(activeText);
};

gen.generate = function(){
    // Block creation comes later.
};

})();
