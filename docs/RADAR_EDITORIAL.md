# Radar editorial publication contract

Radar combines immutable historical on-chain case studies with a scheduled, source-grounded web-news layer. The website browser itself never generates content: publication happens only in the guarded **Website Content Agent** workflow.

## Scheduled web publication

The agent runs four review windows per UTC day. Each window may publish at most one fresh story, with a daily cap of four and a roughly six-hour minimum interval.

The scheduled path uses Kimi Web Search Pro for discovery and relevant page chunks, Web Fetch for page-body verification, then Kimi only as an evidence editor. A story is allowed through only when it clears the importance threshold and cites at least two independent HTTPS source hosts from the collected evidence.

Publication is intentionally not guaranteed. A slot is skipped when the available material is stale, duplicate, weakly sourced, promotional, rumor-based or not materially relevant to Solana/CopyPump.

Fetched third-party page bodies are transient inputs and are not copied into the public repository. The published record contains short original summaries, facts/limits and source links.

## Web-record requirements

A new autonomous web record under `public/radar/observations` must:

1. use `sourceKind: "web"` and a localized source label;
2. omit Solana cluster and transaction signature fields;
3. provide EN/RU title, short summary, facts, interpretation and limits;
4. include the explicit “Why it matters for CopyPump” / “Почему это важно для CopyPump” explanation;
5. cite at least two different HTTPS source hostnames;
6. use only claims supported by the selected evidence;
7. avoid price predictions, trading recommendations, profit promises, inferred intent and unsupported attribution;
8. add one immutable initial revision that references the sources used.

The autonomous guard permits at most one new observation per run and rejects modifications to the substantive fields of already-published records.

## Historical on-chain observations

The original transaction case studies remain evidence-backed records. Their archived RPC responses and SHA-256 links are retained, and the scheduled agent continues read-only `getSignatureStatuses` verification.

A routine on-chain recheck may advance only `lastCheckedAt`. A mismatch does not rewrite the analysis; it creates an attention state.

For a manually reviewed substantive correction to an old observation, increment the version, append an immutable revision, set `updatedAt` to the real editorial revision time and explain what changed. Do not silently rewrite an earlier conclusion.

## Trust boundaries

- A search result or model output is not a fact by itself; claims must remain traceable to cited public sources.
- A public account is not an identified person. Do not invent ownership, motivation, cost basis or profitability.
- Third-party Mainnet observations and ecosystem news are not CopyPump trading activity or proof of product Mainnet readiness.
- Do not confuse a provider/RPC failure with absence of activity or news. Preserve the last verified edition and expose an error state.
- No fake scarcity, countdown, reward, price target or trading recommendation.
- Local saved/read markers remain browser-only and are covered by the privacy page.

## Manual editorial additions

For a manually reviewed record, keep a stable ID and permanent URL, provide explicit dates and sources, link source IDs in revision history, run the repository verification suite and review the result in a PR before merging.

Do not run `prepare-radar-edition01.py` to publish later editions; it exists only to reproduce the frozen first-edition audit snapshot.
