# CopyPump v52 — publication content pass

This preview addresses the owner feedback that the accepted v51.1 became visually clean but too sparse. The goal is **more meaning per viewport**, not a return to boxes, dashboards or decorative technical fields.

## Home editorial structure

The accepted Hero, interactive four-stage product experience, dated status and community scene are preserved. Four open-layout scenes are added, while the existing Radar teaser is expanded into a compact three-item digest:

1. **Why CopyPump** — automatic discovery, qualification before capital, and user-defined boundaries.
2. **Your control** — a short Home-only explanation of Capital, Execution risk, Exposure and Emergency stop. Detailed Product policy paragraphs stay exclusively on /project.
3. **Why the pipeline matters** — Discover → Qualify → Constrain → Execute → Reconcile, explaining why a wallet move alone is insufficient.
4. **Product map** — separates what is publicly available/documented from Devnet verification and intentionally locked Mainnet access.

The new content deliberately avoids claims beyond the public project status dated 2026-09-14. It does not claim profitability, production readiness, external audit completion or Mainnet availability.

## Visual contract

New sections are transparent/open compositions. There are no enclosing cards, dividers or background panels. Existing shared scene, header, object sweeps, swipe controls and Radar behavior are unchanged. On mobile the inherited section rhythm remains 40px per side; new content uses typography and grid density rather than larger blank spacers.

## Release gate

This is a preview branch. Before publication it must pass existing CI, new content/density regressions, EN/RU visual review, iPhone/WebKit and Android browser profiles, and owner visual acceptance. Production main remains v51.1 until that acceptance.


## Publication narrative

The final Home reading order is:

Hero → Why CopyPump → Product Experience → Your Control → Why the Pipeline Matters → Radar Digest → Current Verification Status → Product Map → Community.

This order is intentional. It first answers why the product exists, then demonstrates how it reasons, explains what remains under user control, distinguishes the approach from blind repetition, gives a current reason to return, and only then exposes detailed project state.

Radar Home rendering uses the existing small index. It does not fetch observation detail/evidence payloads until a visitor opens a Radar article.

## No-duplication contract

Home is allowed to summarize a subject, but not to reproduce the long-form explanation owned by another route. Regression tests require the detailed Product control paragraphs to remain absent from Home. Progress remains the canonical location for detailed verification gates and roadmap; Radar remains the canonical location for source-backed observation details.
