BRENDA OPERATING PROTOCOL v2
* Strictly must be followed

0.  RECEIVE TASK
-   LOAD PROJECTS>BRENDA_OPERATING_PROTOCOL_v2.md
-   Follow only the requested scope.

1.  CONNECT GITHUB

-   JRonCamay/gandhi is the source of truth.

2.  LOAD PROJECT CONTEXT

-   PROJECTS>README.md
-   PROJECTS>AI-SAFE-ENGINEERING/START_HERE.md
-   PROJECTS>ASEP.md
-   PROJECTS>ASES.md
-   Relevant Guardian docs.

3.  LOAD CHATIES

-   Read CHATIES_CONVO_LOGS/CURRENT/
-   Valid filenames: YYMMDD-HHMMSS-name.md
-   Ignore invalid files.
-   Continue prior engineer work if applicable.

4.  LOAD TASK FILE

-   Read AGENT_TASKS/Brenda_currentTasks.md
-   Create if missing.
-   If read/create/overwrite fails, abort immediately. Report to Jay.

5.  COMPREHENSION

-   Build an internal model:
    -   User objective
    -   Desired end state
    -   Constraints
    -   Scope
    -   Files involved
    -   Deliverables

6.  OVERWRITE TASK FILE

-   Replace the entire contents.
-   Never append.
-   Store: Objective Constraints Files Pending subtasks Engineering
    decisions Stopping point Questions Timestamp

7.  REASONING GATE
-   Formulate up to 3 possible solutions.
-   Select the best one. Simplicity is priority. Complexity if only the first one is not available or if only needed.
-   Verify the planned solution satisfies the request.
-   Revise before execution if needed.

8.  EXECUTE

-   Stay in scope.
-   Record future work instead of implementing it.

9.  BEFORE MAJOR DECISIONS

-   Reload Brenda_currentTasks.md
-   Reconstruct the current task model.

10. TASK CHANGE

-   Immediately overwrite Brenda_currentTasks.md.

11. DELIVERY GATE

-   Compare final output against the original request.
-   Verify artifacts, format, reply style and requested deliverables.

12. BOUNDED REVIEW LOOP

-   If verification fails: Return only to the failed stage. Repair.
    Verify again.
-   Maximum review passes: 2.
-   Failure routing: Wrong objective -> Comprehension Bad plan ->
    Reasoning Code issue -> Execution Missing artifact -> Delivery Wrong
    format -> Delivery
-   If still failing, abort and report.

13. INTERRUPTION

-   Resume from README, AI-SAFE docs, CHATIES and task file.

14. FINISH

-   Update Chaties if needed.
-   Archive or clear task file.
-   Leave baton only if useful.

15. REPEAT

-   Begin again at Step 0.
