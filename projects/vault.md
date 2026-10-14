# Vault

> A zero-knowledge password manager. All encryption and decryption happen on
> the client; the sync server only ever stores ciphertext it cannot read.

**Domain:** Applied Cryptography  ·  **Stack:** Rust, WebAssembly, Argon2id, AES-256-GCM  ·  **Role:** Solo  ·  **Year:** 2025

---

## Threat model

Assume the server is fully compromised — attacker has the database, the disk,
and the running process. In a zero-knowledge design, that breach leaks only
ciphertext and public salts. Without each user's master password (which never
leaves their device), the attacker gets nothing usable. The master password is
treated as the single root of trust and is never transmitted, logged, or
derivable from anything the server holds.

## What it does

- Derives a 256-bit vault key from the user's master password using
  **Argon2id**, with parameters calibrated to the device.
- Encrypts every credential with **AES-256-GCM** (authenticated encryption)
  inside a **Rust core compiled to WebAssembly**, running in the browser.
- Syncs only opaque encrypted blobs to the server; the server authenticates
  users without ever learning the vault key.
- Generates strong passwords, autofills, and searches entirely against
  in-memory plaintext that is cleared on lock.

## Design decisions

- **Argon2id, tuned.** A memory-hard KDF makes GPU/ASIC brute-forcing of the
  master password economically painful while a real unlock stays sub-second.
- **Authenticated encryption everywhere.** GCM provides integrity as well as
  confidentiality — tampered ciphertext fails closed instead of silently
  decrypting to garbage.
- **Rust/WASM crypto core.** Memory-safe, constant-time where it matters, and
  identical across platforms — far safer than hand-rolled JavaScript crypto.
- **Server as a dumb blob store.** The sync protocol was designed so the server
  is deliberately incapable of reading vault contents, even if it wanted to.

## The hard part: key lifecycle

The cryptographic primitives were the easy choices. The real design problem was
the **derived key's lifecycle**: where it lives, how long, and who can reach it.
I treated the vault key as radioactive — minimize its lifetime, zeroize buffers
after use, and never let it cross the WASM boundary into JavaScript-visible
memory where it could be scraped.

## What I'd do next

Add a secret-sharing based account recovery scheme so a forgotten master
password isn't automatically fatal, without reintroducing a server-side
plaintext escrow. Also a formal audit of the sync protocol's authentication.

## What I learned

Cryptography bugs are almost always *architecture* bugs, not algorithm bugs.
Choosing AES-GCM is trivial; designing a system where the key is never exposed,
never logged, and never outlives its need is the actual work.
