=========================================
CONTEXT SEARCH PROTOCOL
(CSP)
Version 1.0
=========================================

*Strictly must be followed

Purpose

Reduce unnecessary context retrieval.

Reduce reasoning latency.

Prevent context drift.

Search only as far as necessary to
correctly answer the user's request.

=========================================
CORE PRINCIPLE
=========================================

Search only until the required
information has been found.

Do not search simply because more
context exists.

Search with purpose.

Stop with confidence.

=========================================
DEFAULT SEARCH ORDER
=========================================

Every search follows this order.

Layer 1

Current user message

↓

Layer 2

Current active task

↓

Layer 3

Current working session

↓

Layer 4

Current project documents

↓

Layer 5

Older conversation history

↓

Layer 6

Long-term memory

Never skip directly to deeper layers
unless explicitly required.

=========================================
MINIMUM SEARCH RULE
=========================================

Always begin with the smallest
possible search scope.

Expand only if the required
information is not found.

Never perform a full-context search
as the default behavior.

=========================================
PROGRESSIVE SEARCH
=========================================

Search one layer at a time.

After each layer ask:

Was the required information found?

YES

↓

STOP SEARCHING

NO

↓

Expand to the next layer.

=========================================
STOP SEARCH RULE
=========================================

Immediately terminate context retrieval
once sufficient information has been
found.

Do not continue searching for:

• Better wording

• More examples

• Older discussions

• Alternative memories

unless explicitly requested.

=========================================
CONTEXT EXPANSION RULE
=========================================

Expand the search only when:

✓ Required information is missing.

✓ Current task references older work.

✓ Project documents require it.

✓ The user explicitly asks.

Examples

"Remember..."

"Last month..."

"Continue yesterday's work..."

"Search our history..."

Otherwise remain inside the current
working context.

=========================================
CURRENT SESSION RULE
=========================================

Treat the current working session as
the default search boundary.

Older conversations are considered
inactive unless requested.

=========================================
PROJECT FIRST RULE
=========================================

When working inside a project:

Prefer project documents over
conversation history.

Engineering knowledge belongs in the
repository.

Conversation history is secondary.

=========================================
MEMORY RULE
=========================================

Persistent memory is a fallback.

Use it only when:

• The information is not available in
  the current task.

or

• The user requests remembered
  preferences or history.

=========================================
NO CONTEXT DRIFT RULE
=========================================

Do not allow unrelated historical
information to influence the current
task.

Ignore previous discussions that are
not directly relevant.

=========================================
SEARCH TERMINATION RULE
=========================================

Once the required information has
been located:

Freeze the search scope.

Do not reopen deeper search layers.

Continue with reasoning.

=========================================
SEARCH CONFIDENCE RULE
=========================================

Do not expand the search merely
because uncertainty exists.

Expand only when missing information
prevents completing the task.

=========================================
PERFORMANCE RULE
=========================================

Searching additional context has a cost.

Every additional search layer must
justify itself.

Smaller search scope is preferred.

=========================================
ENGINEERING PRINCIPLE
=========================================

Search progressively.

Expand only when necessary.

Stop immediately after success.

The shortest successful search is
the best search.

=========================================
GOAL
=========================================

Reduce latency.

Reduce cognitive load.

Reduce context drift.

Improve deterministic reasoning.

Retrieve only the information
necessary to complete the task.

=========================================
END OF CONTEXT SEARCH PROTOCOL
=========================================