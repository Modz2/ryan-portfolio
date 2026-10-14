# CodeAudit

> A static analysis (SAST) tool that parses source into a syntax tree and
> traces tainted data from untrusted sources to dangerous sinks — finding
> injection bugs before they reach production.

**Domain:** AppSec · SAST  ·  **Stack:** Python, tree-sitter, SARIF, CLI  ·  **Role:** Solo  ·  **Year:** 2026

---

## Threat model

A huge share of real-world web vulnerabilities — SQL injection, command
injection, reflected XSS — are the same underlying bug: **untrusted input
reaching a sensitive operation without sanitization.** CodeAudit models that
data flow directly, rather than grepping for scary-looking function names, so it
catches the actual vulnerable paths and stays quiet about safe ones.

## What it does

1. Parses **Python and JavaScript** into concrete syntax trees with tree-sitter.
2. Identifies **sources** (HTTP params, CLI args, file/stdin reads),
   **sinks** (SQL execute, `eval`, `subprocess`, template/DOM writes), and
   **sanitizers** (parameterized queries, `shlex.quote`, escapers).
3. Performs **taint tracking** to determine whether tainted data actually
   reaches a sink along a path that never passes through a sanitizer.
4. Reports each finding with the full **source → sink path**, a severity, and a
   remediation note. Exits non-zero to gate CI, and exports **SARIF** for
   GitHub code scanning.

## Design decisions

- **Taint tracking, not pattern matching.** Flagging every `eval` produces noise
  that gets the tool disabled. Tracking reachability is what makes findings
  believable.
- **Real parsing over regex.** tree-sitter gives scope, assignment, and function
  structure, so the analysis reasons about code instead of text.
- **Sanitizer awareness.** A tainted path that flows through a recognized
  escaper is cleared — the tool rewards correct defensive code instead of
  punishing it.
- **CI-native.** SARIF output plus a readable terminal report means it runs the
  same locally and in a pipeline.

## The core tradeoff

SAST lives entirely on the **precision/recall curve**. My first version was
interprocedurally naive and missed taint flowing through helper functions
(low recall); an over-corrected version flagged test fixtures and safe code
(low precision). A security tool nobody trusts gets turned off, so I optimized
for *believable, well-explained* findings over exhaustive ones.

## What I'd do next

Full **interprocedural analysis** with a constructed call graph, so taint is
tracked across function boundaries, plus configurable custom source/sink rules
per project.

## What I learned

The value of a security tool is a function of how much engineers trust its
output. A precise, explainable finding that a developer acts on beats a
comprehensive report they ignore.
