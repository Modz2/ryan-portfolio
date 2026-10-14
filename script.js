/* ============================================================
   Ryan Roumiani — portfolio behaviour
   Renders project cards + detail modals, skills, theme toggle,
   copy button. No dependencies.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- project data ---------------- */
  const PROJECTS = [
    {
      id: "sentinel-ids",
      name: "Sentinel IDS",
      domain: "ml",
      tag: "ML · Security",
      year: "2026",
      role: "Solo",
      blurb:
        "A network intrusion detection system that sniffs live traffic, derives flow features, and flags anomalies with a trained classifier — not just signatures.",
      stack: ["Python", "Scapy", "scikit-learn", "pandas"],
      tagline:
        "Catch the attack the signature database has never seen before.",
      threat:
        "Signature-based IDS fails against novel or obfuscated attacks. Sentinel models normal traffic statistically so it can flag deviations a rule set would miss, while keeping false positives low enough to actually run.",
      sections: [
        {
          h: "What it does",
          p: "Sentinel captures packets off the wire, reassembles them into bidirectional flows, and extracts a feature vector per flow (duration, byte and packet ratios, flag counts, inter-arrival timing). A gradient-boosted classifier trained on the CIC-IDS2017 dataset scores each flow in near real time and raises alerts for DoS, port scans, brute-force, and botnet patterns.",
        },
        {
          h: "Design decisions",
          list: [
            "<strong>Flow-level, not packet-level.</strong> Per-packet classification drowns in volume and loses context; flow aggregation captures the shape of a connection.",
            "<strong>Feature parity with training.</strong> The live extractor computes exactly the CIC-IDS2017 feature set, so the model sees in production what it saw in training — the usual silent killer of deployed ML.",
            "<strong>Class imbalance handled on purpose.</strong> Attacks are rare; I used stratified sampling and tuned for recall on the minority classes rather than raw accuracy, which is meaningless here.",
            "<strong>Explainable alerts.</strong> Each alert ships the top SHAP feature contributions, so an analyst sees <em>why</em> a flow was flagged, not just a score.",
          ],
        },
        {
          h: "Results & reflection",
          p: "On a held-out split it reached ~0.98 macro-F1, but the honest story is the false-positive tuning: the first model flagged every large file transfer as exfiltration. Building a proper validation harness with time-based splits (so the model can't peek at the future) dropped benign-traffic noise dramatically. If I rebuilt it, I'd add online learning to adapt to a network's baseline instead of retraining in batch.",
        },
      ],
    },
    {
      id: "vault",
      name: "Vault",
      domain: "security",
      tag: "Cryptography",
      year: "2025",
      role: "Solo",
      blurb:
        "A zero-knowledge password manager. Everything is encrypted and decrypted on the client — the server stores ciphertext it can never read.",
      stack: ["Rust", "WebAssembly", "Argon2id", "AES-GCM"],
      tagline: "The server holds your secrets and can't read a single one.",
      threat:
        "Assume the server is fully compromised. A zero-knowledge design means a breach leaks only ciphertext and salts — never a master password, never a plaintext credential. The attacker gains nothing without each user's master secret, which never leaves their device.",
      sections: [
        {
          h: "What it does",
          p: "Vault derives an encryption key from the user's master password with Argon2id, then encrypts each credential with AES-256-GCM entirely in the browser via a Rust core compiled to WebAssembly. The sync server only ever sees opaque blobs. Autofill, generation, and search all happen against decrypted data that lives only in memory, cleared on lock.",
        },
        {
          h: "Design decisions",
          list: [
            "<strong>Argon2id, tuned to the device.</strong> Memory-hard KDF with calibrated parameters so a GPU brute-force of the master password is economically painful, while a real login stays sub-second.",
            "<strong>Authenticated encryption everywhere.</strong> AES-GCM gives confidentiality <em>and</em> integrity — tampered ciphertext fails to decrypt instead of silently corrupting.",
            "<strong>Rust/WASM core.</strong> The crypto lives in memory-safe Rust, not hand-rolled JavaScript, and runs identically across platforms. No secret-dependent branching.",
            "<strong>Encrypt-then-sync.</strong> The protocol was designed so the server is a dumb blob store; it authenticates users without ever learning the vault key.",
          ],
        },
        {
          h: "Reflection",
          p: "The hardest part wasn't the cryptography — it was the key lifecycle. Where does the derived key live, for how long, and who can touch it? I learned to treat the master key as radioactive: minimize its lifetime, zeroize buffers after use, and never let it cross the WASM boundary into JS-visible memory. This project taught me that crypto bugs are almost always architecture bugs, not algorithm bugs.",
        },
      ],
    },
    {
      id: "codeaudit",
      name: "CodeAudit",
      domain: "security",
      tag: "AppSec · SAST",
      year: "2026",
      role: "Solo",
      blurb:
        "A static analysis tool that parses source into an AST and traces tainted data from user input to dangerous sinks — finding injection bugs before they ship.",
      stack: ["Python", "tree-sitter", "AST", "CLI"],
      tagline: "Follow the untrusted data until it does something dangerous.",
      threat:
        "Most web vulnerabilities — SQLi, command injection, XSS — are the same bug: untrusted input reaching a sensitive sink without sanitization. CodeAudit models that flow directly instead of grepping for scary function names.",
      sections: [
        {
          h: "What it does",
          p: "CodeAudit parses Python and JavaScript into concrete syntax trees with tree-sitter, identifies <strong>sources</strong> (request params, CLI args, file reads), <strong>sinks</strong> (SQL execute, <code>eval</code>, <code>subprocess</code>, DOM writes), and performs intraprocedural taint tracking between them. It reports each finding with the exact source-to-sink path, a severity, and a remediation note, and exits non-zero so it can gate a CI pipeline.",
        },
        {
          h: "Design decisions",
          list: [
            "<strong>Taint tracking, not pattern matching.</strong> A linter that greps for <code>eval</code> screams at every safe use. Tracking whether tainted data actually reaches the sink cuts false positives hard.",
            "<strong>tree-sitter over regex.</strong> Real parsing means the tool understands scope, assignment, and function boundaries instead of guessing from text.",
            "<strong>Sanitizer awareness.</strong> A path that passes through a recognized escaper (parameterized query, <code>shlex.quote</code>) is cleared, so the tool rewards correct code.",
            "<strong>CI-native output.</strong> SARIF export plus a human-readable terminal report, so it drops into GitHub code scanning or runs locally.",
          ],
        },
        {
          h: "Reflection",
          p: "The precision/recall tradeoff is the whole game in SAST. My first version was interprocedurally naive and missed taint that flowed through helper functions; my second was so aggressive it flagged test fixtures. The lesson: a security tool nobody trusts gets disabled, so a believable, well-explained finding is worth more than a noisy exhaustive one. Next step is proper interprocedural analysis with a call graph.",
        },
      ],
    },
    {
      id: "raftkv",
      name: "RaftKV",
      domain: "systems",
      tag: "Distributed Systems",
      year: "2025",
      role: "Solo",
      blurb:
        "A replicated, fault-tolerant key-value store built on a from-scratch implementation of the Raft consensus algorithm — survives node failures without losing data.",
      stack: ["Go", "gRPC", "Raft", "BoltDB"],
      tagline: "Keep answering correctly even when a third of the cluster dies.",
      threat:
        "Not an adversary this time, but the adversary every distributed system faces: partial failure. Nodes crash, messages drop, networks partition. RaftKV stays linearizable and never serves stale or divergent data as long as a majority survives.",
      sections: [
        {
          h: "What it does",
          p: "RaftKV runs a cluster of nodes that elect a leader, replicate an operation log by majority quorum, and apply committed entries to a persistent state machine. Clients get a linearizable key-value API; a node can crash and rejoin, and the cluster keeps serving as long as a majority is up. I implemented leader election, log replication, persistence, and snapshotting directly from the Raft paper.",
        },
        {
          h: "Design decisions",
          list: [
            "<strong>Raft from the paper, not a library.</strong> The point was to actually understand consensus — the term invariants, the commit rules, why the election-restriction matters for safety.",
            "<strong>Persistence before acknowledgement.</strong> Term, vote, and log entries hit disk before a node replies, so a crash-restart never violates the safety guarantees.",
            "<strong>Snapshotting.</strong> The log can't grow forever; compaction keeps restart and catch-up fast.",
            "<strong>Deterministic test harness.</strong> A simulated network injects partitions, drops, and reordering so I could reproduce the nasty split-brain and lost-leader scenarios on demand.",
          ],
        },
        {
          h: "Reflection",
          p: "Consensus is deceptively simple to describe and brutal to get right. My hardest bug was a subtle commit-index advance that could expose an uncommitted entry after an election — exactly the class of bug Raft's rules exist to prevent, which I'd implemented slightly wrong. Writing an adversarial network simulator was what finally surfaced it. This project changed how I read specifications: every 'should' in the paper is load-bearing.",
        },
      ],
    },
    {
      id: "ctf-arena",
      name: "CTF Arena",
      domain: "security",
      tag: "Full-Stack · Security",
      year: "2026",
      role: "Solo",
      blurb:
        "A capture-the-flag platform that serves sandboxed security challenges, generates per-team flags, and scores submissions live — the infrastructure behind a hacking competition.",
      stack: ["TypeScript", "Node", "PostgreSQL", "Docker"],
      tagline: "Run a hacking competition without getting hacked yourself.",
      threat:
        "The ironic risk: a platform full of deliberately vulnerable challenges is a juicy target. Arena isolates every challenge in its own container, generates unique flags per team to defeat sharing, and hardens the scoring core against the exact injection and auth bugs the challenges teach.",
      sections: [
        {
          h: "What it does",
          p: "Arena hosts jeopardy-style CTF challenges across web, crypto, and reversing categories. Each challenge runs in an isolated Docker container spun up per team; flags are HMAC-derived per team so a leaked flag can't be shared; submissions are rate-limited and scored on a live, dynamically-weighted scoreboard that devalues challenges as more teams solve them. Admins author challenges through a dashboard backed by a normalized PostgreSQL schema.",
        },
        {
          h: "Design decisions",
          list: [
            "<strong>Per-team flags via HMAC.</strong> <code>flag = HMAC(team_secret, challenge_id)</code> means a flag posted in a group chat is worthless to anyone else — and lets me trace leaks.",
            "<strong>Container-per-challenge isolation.</strong> Competitors get root in their sandbox and still can't touch the host or each other.",
            "<strong>A schema I actually normalized.</strong> Teams, users, challenges, submissions, and scoring events are modeled with real foreign keys and constraints — I designed the ER model before writing a line of query.",
            "<strong>Dynamic scoring.</strong> Points decay with solve count, rewarding teams who crack the hard, unsolved challenges first.",
          ],
        },
        {
          h: "Reflection",
          p: "Building the thing that hosts attacks forced me to practice what the challenges preach. I parameterized every query, put the scoring logic behind server-side authorization checks, and threat-modeled the submission endpoint as if my own players were the attackers — because they were. The database design drew directly on relational modeling work from my coursework, and it's the part I'm most confident in.",
        },
      ],
    },
    {
      id: "aegis-waf",
      name: "Aegis WAF",
      domain: "systems",
      tag: "Network Security",
      year: "2025",
      role: "Solo",
      blurb:
        "A web application firewall and reverse proxy that inspects every HTTP request in-line, blocks OWASP Top 10 attack patterns, rate-limits abusers, and logs it all.",
      stack: ["Go", "net/http", "Redis", "regex"],
      tagline: "A bouncer for HTTP that reads every request before it reaches your app.",
      threat:
        "Applications ship with bugs. A WAF is defense-in-depth: it sits in front of the origin and blocks malicious requests — SQLi probes, path traversal, XSS payloads, scanner fingerprints — before the vulnerable app ever parses them, buying time to patch.",
      sections: [
        {
          h: "What it does",
          p: "Aegis is a reverse proxy written in Go. Every request passes through a middleware pipeline: a rule engine matches request lines, headers, and bodies against a tuned set of attack signatures; a token-bucket limiter backed by Redis throttles abusive clients and IP ranges; and a structured logger records decisions for later analysis. Clean traffic is forwarded to the origin with negligible added latency.",
        },
        {
          h: "Design decisions",
          list: [
            "<strong>Streaming inspection.</strong> Request bodies are inspected as they stream, with a size cap, so a giant upload can't exhaust memory or sneak past the scanner.",
            "<strong>Rules as data.</strong> Signatures live in a config format, not in code, so a new rule ships without a rebuild — and each rule carries a confidence score to separate 'block' from 'log'.",
            "<strong>Distributed rate limiting.</strong> The token buckets live in Redis so the limit holds across multiple proxy instances, not per-process.",
            "<strong>Fail-open vs fail-closed, chosen deliberately.</strong> If Redis is down, Aegis degrades to local limiting rather than dropping all traffic — availability and security traded off on purpose, not by accident.",
          ],
        },
        {
          h: "Reflection",
          p: "Regex-based WAFs are famous for both false positives and bypasses, and I ran into both. Normalizing requests (URL-decoding, resolving path segments, lowercasing) <em>before</em> matching closed off a whole class of evasion like double-encoding. The real lesson was performance: naive backtracking regex on every request tanked throughput, so I learned to write linear-time patterns and benchmark the middleware under load. A WAF that adds 200ms gets ripped out on day one.",
        },
      ],
    },
  ];

  /* ---------------- skills ---------------- */
  const SKILLS = [
    { h: "Languages", items: ["Python", "Go", "Rust", "C", "JavaScript", "TypeScript", "SQL", "Bash"] },
    { h: "Security", items: ["Threat modeling", "OWASP Top 10", "Applied cryptography", "Network security", "SAST", "Burp Suite", "Wireshark"] },
    { h: "Systems & Data", items: ["Distributed systems", "Consensus", "PostgreSQL", "Redis", "Relational modeling", "gRPC"] },
    { h: "Tooling", items: ["Linux", "Docker", "Git", "CI/CD", "scikit-learn", "tree-sitter"] },
    { h: "Human", items: ["Teaching", "Team coordination", "Calm under pressure", "Clear writing"] },
  ];

  /* ---------------- render: project cards ---------------- */
  const grid = document.getElementById("projectGrid");
  PROJECTS.forEach((p, i) => {
    const li = document.createElement("li");
    const card = document.createElement("button");
    card.type = "button";
    card.className = "project";
    card.setAttribute("aria-haspopup", "dialog");
    card.dataset.id = p.id;
    card.innerHTML = `
      <div class="project__top">
        <span class="project__index">${String(i + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")}</span>
        <span class="project__tag" data-domain="${p.domain}">${p.tag}</span>
      </div>
      <h3 class="project__name">${p.name}</h3>
      <p class="project__blurb">${p.blurb}</p>
      <div class="project__stack">${p.stack.map((s) => `<span>${s}</span>`).join("")}</div>
      <span class="project__more">Read case study →</span>`;
    card.addEventListener("click", () => openModal(p.id));
    li.appendChild(card);
    grid.appendChild(li);
  });

  /* ---------------- render: skills ---------------- */
  const skillsGrid = document.getElementById("skills-grid");
  SKILLS.forEach((g) => {
    const div = document.createElement("div");
    div.className = "skill-group";
    div.innerHTML = `<h3>${g.h}</h3><ul>${g.items.map((s) => `<li>${s}</li>`).join("")}</ul>`;
    skillsGrid.appendChild(div);
  });

  /* ---------------- modal ---------------- */
  const modal = document.getElementById("projectModal");
  const modalContent = document.getElementById("modalContent");
  let lastFocused = null;

  function sectionHTML(s) {
    let body = "";
    if (s.p) body += `<p>${s.p}</p>`;
    if (s.list) body += `<ul>${s.list.map((li) => `<li>${li}</li>`).join("")}</ul>`;
    return `<h4>${s.h}</h4>${body}`;
  }

  function openModal(id) {
    const p = PROJECTS.find((x) => x.id === id);
    if (!p) return;
    lastFocused = document.activeElement;
    modalContent.innerHTML = `
      <p class="modal__eyebrow">${p.tag} · ${p.year}</p>
      <h3 id="modalTitle">${p.name}</h3>
      <p class="modal__tagline">${p.tagline}</p>
      <div class="modal__meta">
        <span>Role: ${p.role}</span><span>Year: ${p.year}</span>
        ${p.stack.map((s) => `<span>${s}</span>`).join("")}
      </div>
      <div class="threat"><h4>Threat model</h4><p>${p.threat}</p></div>
      ${p.sections.map(sectionHTML).join("")}
      <div class="modal__links">
        <a class="btn btn--ghost" href="projects/${p.id}.md" target="_blank" rel="noopener">Full write-up ↗</a>
        <a class="btn btn--ghost" href="https://github.com/Modz2" target="_blank" rel="noopener">Source ↗</a>
      </div>`;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal__close").focus();
    document.addEventListener("keydown", onKey);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKey);
    if (lastFocused) lastFocused.focus();
  }

  function onKey(e) {
    if (e.key === "Escape") closeModal();
    if (e.key === "Tab") {
      const f = modal.querySelectorAll('a[href], button');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  modal.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));

  /* ---------------- theme toggle ---------------- */
  const toggle = document.getElementById("themeToggle");
  const STORAGE_KEY = "rr-theme";
  function applyTheme(t) {
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) applyTheme(saved);
  } catch (e) {}
  toggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const effective = current || (prefersDark ? "dark" : "light");
    const next = effective === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
  });

  /* ---------------- copy button ---------------- */
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      const done = () => { btn.textContent = "Copied"; btn.classList.add("is-done"); setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("is-done"); }, 1600); };
      try {
        await navigator.clipboard.writeText(text);
        done();
      } catch (e) {
        const r = document.createRange();
        r.selectNode(document.getElementById("emailValue"));
        const sel = window.getSelection();
        sel.removeAllRanges(); sel.addRange(r);
        done();
      }
    });
  });

  /* ---------------- year + LinkedIn guard ---------------- */
  document.getElementById("year").textContent = new Date().getFullYear();
  document.querySelectorAll('[data-needs-url="linkedin"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      if (a.getAttribute("href") === "#") {
        e.preventDefault();
        alert("Add your LinkedIn URL in index.html (search for data-needs-url).");
      }
    });
  });
})();
