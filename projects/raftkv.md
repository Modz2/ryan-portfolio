# RaftKV

> A replicated, fault-tolerant key-value store built on a from-scratch
> implementation of the Raft consensus algorithm. It stays correct and
> available as long as a majority of nodes survive.

**Domain:** Distributed Systems  ·  **Stack:** Go, gRPC, Raft, BoltDB  ·  **Role:** Solo  ·  **Year:** 2025

---

## The adversary here is failure

No malicious attacker this time — just the condition every distributed system
must survive: **partial failure.** Nodes crash, messages drop, and networks
partition. RaftKV keeps its key-value store **linearizable** and never serves
stale or divergent data, as long as a majority of the cluster is reachable.

## What it does

- Runs a cluster of nodes that **elect a leader**, **replicate an operation
  log** by majority quorum, and **apply committed entries** to a persistent
  state machine.
- Exposes a linearizable `get` / `put` / `delete` API over gRPC.
- Survives node crashes and rejoins: a restarted node catches up from the
  leader and resumes participating.
- Implements leader election, log replication, persistence, and log
  compaction (snapshotting) directly from the Raft paper.

## Design decisions

- **Raft from the paper, not a library.** The entire point was to *understand*
  consensus — term invariants, the commit rules, and why the election
  restriction is essential to safety.
- **Persist before you acknowledge.** Current term, vote, and appended log
  entries are flushed to disk before a node responds, so a crash-restart can
  never violate Raft's safety guarantees.
- **Snapshotting.** The replicated log can't grow unbounded; compaction keeps
  restart and follower catch-up fast.
- **A deterministic, adversarial test harness.** A simulated network injects
  partitions, message drops, and reordering so I could reproduce split-brain
  and lost-leader scenarios deterministically.

## The bug that taught me the most

A subtle error in advancing the commit index could briefly expose an
*uncommitted* entry after a leader change — exactly the class of bug Raft's
rules are designed to prevent, which meant I'd implemented one of those rules
slightly wrong. The adversarial network simulator is what finally surfaced it
reliably. Every "should" in the specification turned out to be load-bearing.

## What I'd do next

Add **membership changes** (joint consensus) so the cluster can be reconfigured
live, and a client-side session layer for exactly-once semantics under retries.

## What I learned

Consensus is simple to describe and unforgiving to implement. This project
permanently changed how I read specifications — slowly, and assuming every
clause exists for a reason I haven't discovered yet.
