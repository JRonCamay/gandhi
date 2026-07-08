from pathlib import Path


def read(path):
    return Path(path).read_text(encoding='utf-8', errors='replace')


def write(path, text):
    Path(path).write_text(text, encoding='utf-8')

path = 'TransforkNew/KEY/KEY.js'
text = read(path)

# Add explicit maxStation and completion handling after station 6.
if 'maxStation: 6,' not in text:
    text = text.replace('        currStation: 0,\n        stations: {},', '        currStation: 0,\n        maxStation: 6,\n        stations: {},', 1)

old = '''                if (report.status === "done") {
                    this.submitEndSession();
                    continue;
                }
'''
new = '''                if (report.status === "done") {
                    const finishedStation = this.currStation;
                    this.submitEndSession();
                    if (finishedStation >= this.maxStation) {
                        this.currStation = 0;
                        return makeReport("done", {
                            line: this.line,
                            station: finishedStation,
                            reason: "line complete"
                        });
                    }
                    continue;
                }
'''
if old in text:
    text = text.replace(old, new, 1)

# Add a raw probe listener from the same KEY module, independent of the manager pipeline.
if '[TN KEY RAW] keydown observed' not in text:
    marker = '''    function dispatch(event) {
        try {
'''
    raw_fn = '''    function rawKeyProbe(event) {
        if (event?.key?.toLowerCase?.() !== "r") return;
        console.log("[TN KEY RAW] keydown observed", {
            enabled,
            activeLine,
            registryCount: registry.length,
            managerStation: keyManager.currStation
        });
    }

'''
    text = text.replace(marker, raw_fn + marker, 1)
    text = text.replace('                window.removeEventListener("keydown", dispatch, true);', '                window.removeEventListener("keydown", dispatch, true);\n                window.removeEventListener("keydown", rawKeyProbe, true);', 1)
    text = text.replace('    window.addEventListener("keydown", dispatch, true);', '    window.addEventListener("keydown", rawKeyProbe, true);\n    window.addEventListener("keydown", dispatch, true);', 1)

write(path, text)
print('patched KEY completion and raw key probe')
