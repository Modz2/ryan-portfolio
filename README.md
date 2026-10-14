# Ryan Roumiani — Portfolio

Personal portfolio site for **Ryan Roumiani**, a Computer Science student at
Simon Fraser University focused on security and systems. Built as a fast,
dependency-free static site and deployed on GitHub Pages.

🔗 **Live:** `https://<your-username>.github.io/<repo-name>/` — *(set once Pages is enabled, see below)*

---

## What's inside

A single-page portfolio plus a detailed case study for each project:

| # | Project | Domain | Stack |
|---|---------|--------|-------|
| 1 | [Sentinel IDS](projects/sentinel-ids.md) | ML · Network Security | Python, Scapy, scikit-learn |
| 2 | [Vault](projects/vault.md) | Applied Cryptography | Rust, WASM, Argon2id, AES-GCM |
| 3 | [CodeAudit](projects/codeaudit.md) | AppSec · SAST | Python, tree-sitter |
| 4 | [RaftKV](projects/raftkv.md) | Distributed Systems | Go, gRPC, Raft |
| 5 | [CTF Arena](projects/ctf-arena.md) | Full-Stack · Security | TypeScript, Node, PostgreSQL, Docker |
| 6 | [Aegis WAF](projects/aegis-waf.md) | Network Security | Go, Redis |

Each case study covers the **threat model**, the **design decisions**, and an
honest **reflection** on what was hard and what would change next time.

## Tech

- Plain HTML, CSS, and vanilla JavaScript — no framework, no build step.
- Dark/light theming with full `prefers-color-scheme` support and a manual toggle.
- Accessible: keyboard-navigable modals, focus trapping, skip link, reduced-motion support.
- Google Fonts: Archivo, IBM Plex Sans, IBM Plex Mono.

## Project structure

```
.
├── index.html              # the page
├── styles.css              # design tokens + layout
├── script.js               # project data, modals, theme, copy
├── assets/
│   └── favicon.svg
├── projects/               # per-project case studies (Markdown)
│   ├── sentinel-ids.md
│   ├── vault.md
│   ├── codeaudit.md
│   ├── raftkv.md
│   ├── ctf-arena.md
│   └── aegis-waf.md
└── .github/workflows/
    └── pages.yml           # GitHub Pages deploy
```

## Run locally

It's static — any file server works:

```bash
# Python
python3 -m http.server 8000
# then open http://localhost:8000

# or Node
npx serve .
```

## Deploy on GitHub Pages

1. Push this repo to GitHub (see below).
2. Go to **Settings → Pages → Build and deployment**.
3. Set **Source** to **GitHub Actions**.
4. The included workflow (`.github/workflows/pages.yml`) builds and deploys on
   every push to `main`. Your site goes live at
   `https://<your-username>.github.io/<repo-name>/`.

## Customize

A few things to make it fully yours (all in `index.html` unless noted):

- **GitHub link** — currently points to `github.com/Modz2`; confirm or change it.
- **LinkedIn** — search for `data-needs-url` and drop in your profile URL.
- **Projects** — edit the `PROJECTS` array in `script.js` and the matching file
  in `projects/`. Adding a project is just another array entry plus a Markdown file.

## License

[MIT](LICENSE) © 2026 Ryan Roumiani
