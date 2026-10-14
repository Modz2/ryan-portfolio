# Aegis WAF

> A web application firewall and reverse proxy that inspects every HTTP request
> in-line, blocks OWASP Top 10 attack patterns, rate-limits abusers, and logs
> every decision.

**Domain:** Network Security  ·  **Stack:** Go, net/http, Redis  ·  **Role:** Solo  ·  **Year:** 2025

---

## Threat model

Applications ship with bugs. A WAF is **defense in depth**: it sits in front of
the origin and blocks malicious requests — SQLi probes, path traversal, XSS
payloads, scanner fingerprints — before the vulnerable app ever parses them.
It doesn't replace fixing the bug; it buys time to patch and raises the cost of
an attack.

## What it does

- Acts as a **reverse proxy** in Go, forwarding clean traffic to the origin
  with negligible added latency.
- Runs each request through a **middleware pipeline**:
  1. A **rule engine** matches the request line, headers, and body against a
     tuned set of attack signatures.
  2. A **token-bucket rate limiter** backed by Redis throttles abusive clients
     and IP ranges.
  3. A **structured logger** records every allow/block decision for analysis.

## Design decisions

- **Streaming inspection with a size cap.** Bodies are inspected as they stream,
  so a huge upload can't exhaust memory or slip past the scanner.
- **Rules as data.** Signatures live in a config format, not in code — a new
  rule ships without a rebuild, and each rule carries a confidence score to
  separate *block* from *log-only*.
- **Distributed rate limiting.** Token buckets live in Redis so limits hold
  across multiple proxy instances rather than per-process.
- **Fail-open vs fail-closed, chosen on purpose.** If Redis is unavailable,
  Aegis degrades to local limiting rather than dropping all traffic — an
  availability/security tradeoff made deliberately, not by accident.

## The hard parts: evasion and performance

Regex-based WAFs are notorious for both false positives and bypasses, and I hit
both.

- **Evasion:** normalizing requests — URL-decoding, resolving `../` path
  segments, lowercasing — *before* matching closed off a whole class of
  double-encoding bypasses.
- **Performance:** naive backtracking regex on every request destroyed
  throughput. I rewrote patterns to run in linear time and benchmarked the
  middleware under load. A WAF that adds 200ms gets removed on day one.

## What I'd do next

Add an anomaly-scoring mode (à la OWASP CRS) so borderline requests accumulate
risk across rules instead of each rule deciding alone, and a shadow/learning
mode to tune rules against real traffic before enforcing.

## What I learned

Inline security infrastructure is a performance project as much as a security
one. Correctness that you can't afford to run in production isn't protection.
