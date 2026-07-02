/*
BlokSearch/qa-orchestrator-stress.js
Manual QA stress test. Not loaded by bootloader.
Run from DevTools after BlokSearch modules are loaded:
BlokSearchQA.runOrchestratorStress()
*/
window.BlokSearchQA = window.BlokSearchQA || {};

window.BlokSearchQA.runOrchestratorStress = async function runOrchestratorStress() {
    const BLOCK_COUNT = 5000;
    const CACHE_LIMIT = 200;
    const INTERVAL_MS = 10;
    const DURATION_MS = 5000;
    const FRAME_BUDGET_MS = 20;

    const report = {
        startedAt: performance.now(),
        searchesSent: 0,
        resultsReceived: 0,
        droppedFrames: 0,
        maxFrameLag: 0,
        maxCacheSize: 0,
        cacheOverflow: false,
        errors: []
    };

    const dummyBlocks = Array.from({ length: BLOCK_COUNT }, (_, index) => ({
        type: `qa_dummy_block_${index}`,
        label: `dummy block ${index} move steps repeat forever broadcast variable ${index}`,
        category: index % 2 ? "motion" : "control",
        color: index % 2 ? "#4c97ff" : "#ffab19",
        hasOutput: index % 5 === 0,
        outputCheck: index % 7 === 0 ? ["Boolean"] : null
    }));

    const cache = new window.BlokSearch.BlockCache(CACHE_LIMIT);
    const controller = new window.BlokSearch.MainThreadController({ debounceDelay: 0 });
    const orchestrator = new window.BlokSearch.AppOrchestrator({
        workerController: controller,
        cache
    });

    const frameProbe = {
        running: true,
        last: performance.now(),
        tick(now) {
            const delta = now - this.last;
            this.last = now;

            if (delta > FRAME_BUDGET_MS) {
                report.droppedFrames++;
                report.maxFrameLag = Math.max(report.maxFrameLag, delta);
                console.warn(`[BlokSearch QA] frame lag ${delta.toFixed(2)}ms`);
            }

            if (this.running) requestAnimationFrame(this.tick.bind(this));
        }
    };

    requestAnimationFrame(frameProbe.tick.bind(frameProbe));

    try {
        await controller.start();
        await controller.setIndex(dummyBlocks);
        orchestrator.initialize(dummyBlocks);

        controller.onResult = results => {
            report.resultsReceived++;

            for (let i = 0; i < results.length; i++) {
                const entry = results[i];
                cache.set(entry.type, entry.label);
            }

            report.maxCacheSize = Math.max(report.maxCacheSize, cache.map.size);

            if (cache.map.size > CACHE_LIMIT) {
                report.cacheOverflow = true;
                console.error(`[BlokSearch QA] cache overflow: ${cache.map.size}`);
            }
        };

        const queries = [
            "move", "repeat", "forever", "broadcast", "variable",
            "dummy", "control", "motion", "block", "steps"
        ];

        const timer = setInterval(() => {
            const query = queries[report.searchesSent % queries.length];
            report.searchesSent++;
            orchestrator.search(query, { limit: 100 });
        }, INTERVAL_MS);

        await new Promise(resolve => setTimeout(resolve, DURATION_MS));
        clearInterval(timer);

        await new Promise(resolve => setTimeout(resolve, 250));
    } catch (error) {
        report.errors.push(error && error.message ? error.message : String(error));
        console.error("[BlokSearch QA] stress test error", error);
    } finally {
        frameProbe.running = false;
        orchestrator.dispose();
        controller.dispose();
    }

    report.finishedAt = performance.now();
    report.duration = report.finishedAt - report.startedAt;

    console.table(report);

    if (report.cacheOverflow) {
        console.error("[BlokSearch QA] FAILED: BlockCache exceeded 200 items.");
    } else {
        console.log("[BlokSearch QA] PASS: BlockCache stayed within 200 items.");
    }

    if (report.droppedFrames > 0) {
        console.warn(`[BlokSearch QA] WARNING: ${report.droppedFrames} frame drops detected.`);
    } else {
        console.log("[BlokSearch QA] PASS: No frame drops detected.");
    }

    return report;
};