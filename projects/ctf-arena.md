# CTF Arena

> A capture-the-flag platform that serves sandboxed security challenges,
> generates per-team flags, and scores submissions on a live, dynamically
> weighted scoreboard — the infrastructure behind a hacking competition.

**Domain:** Full-Stack · Security  ·  **Stack:** TypeScript, Node, PostgreSQL, Docker  ·  **Role:** Solo  ·  **Year:** 2026

---

## Threat model

A platform full of *deliberately vulnerable* challenges is an unusually juicy
target, and the competitors are, by definition, attackers. Arena is built so
that the scoring and platform layer resists the exact bugs its challenges teach:
every challenge is isolated, flags can't be shared, and the submission and
scoring paths are hardened against injection and broken authorization.

## What it does

- Hosts jeopardy-style challenges across **web, crypto, and reversing**.
- Spins up an **isolated Docker container per team, per challenge**, so a
  competitor with root in their sandbox can't touch the host or other teams.
- Derives **per-team flags** via `HMAC(team_secret, challenge_id)`, so a leaked
  flag is worthless to anyone else — and leaks are traceable.
- Scores submissions on a **dynamically weighted scoreboard** where a
  challenge's point value decays as more teams solve it.
- Lets admins author challenges through a dashboard backed by a normalized
  PostgreSQL schema.

## Design decisions

- **Per-team flags.** Flag sharing is the classic CTF cheat. HMAC-derived
  per-team flags make a posted flag non-transferable and attributable.
- **Container-per-challenge isolation.** Strong boundaries so intentionally
  broken software can't become a real foothold.
- **A schema designed before the queries.** Teams, users, challenges,
  submissions, and scoring events are modeled with real foreign keys and
  constraints. I drew the ER model first — relational modeling is a strength I
  built up in coursework.
- **Dynamic scoring.** Points decay with solve count, rewarding the teams who
  break the hardest, least-solved challenges first.

## Practicing what the challenges preach

Building the thing that *hosts* attacks forced real discipline: every query is
parameterized, scoring logic sits behind server-side authorization checks, and
I threat-modeled the submission endpoint assuming my own players were hostile —
because they were.

## What I'd do next

Add a replay-resistant WebSocket feed for the live scoreboard and
resource quotas per sandbox to stop a team from starving the host.

## What I learned

Security isn't a feature you add at the end — on this project it was the design
constraint from the first table in the schema to the last endpoint.
