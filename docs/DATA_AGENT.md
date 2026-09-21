# CopyPump website data agent

The scheduled website agent is data-only. It reviews public project status, re-checks historical on-chain Radar evidence and runs a source-grounded web-news discovery pass four times per UTC day.

The primary site structure, navigation, artwork, scenes, animations, responsive behavior, core page copy and Radar layout are outside the autonomous write scope.

## Autonomous write scope

- `src/content/project-status.generated.ts`
- `public/public-status.json`
- `public/agent-status.json`
- `public/radar/index.json`
- existing `public/radar/observations/*.json` — verification timestamps only
- at most one new `public/radar/observations/*.json` web record per run
- legacy `public/radar/evidence/auto-transaction-*.json` remains allowlisted for the retired on-chain discovery path, but scheduled discovery no longer creates these files

A semantic Radar guard compares every autonomous diff with `HEAD`. Existing editorial claims cannot be silently rewritten. New web records must pass their own structural and source-integrity rules before a commit is allowed.

## Historical on-chain verification

The agent still performs read-only `getSignatureStatuses` checks for previously published Solana transaction observations. It compares finalized status, slot and error state with the archived evidence.

Web-news records are not treated as transaction records: they have no fake cluster or signature and are not passed to the Solana RPC verifier.

## Web intelligence

The scheduled discovery path is:

1. Kimi Web Search Pro searches several bounded, current Solana-related topics.
2. Results are deduplicated against previously published web stories and ranked using freshness, source authority, source type and content availability.
3. Kimi Web Fetch reads a small shortlist of known URLs so the editor can inspect the page body instead of relying only on headlines.
4. Kimi produces one bilingual candidate from the supplied evidence only.
5. Publication requires an importance score at or above the configured threshold plus at least two independent HTTPS source hosts.
6. The semantic guard validates the resulting public JSON before it can be committed.

The four review windows cover network/infrastructure, DeFi and trading infrastructure, security incidents, and payments/stablecoins/regulatory developments with a clear Solana connection.

The agent may publish at most one story per review window, with a daily cap of four and a minimum interval of roughly six hours between web stories. A review window may publish nothing when the evidence is weak, stale, duplicative or not important enough.

The public record stores source URLs and source labels. It does not republish fetched third-party page bodies in the repository.

## Editorial constraints

Autonomous web items must:

- explain what happened in normal language;
- state why the event matters to CopyPump's infrastructure/risk context;
- separate supported facts from interpretation and limits;
- avoid token-price predictions, trading recommendations, profit claims, inferred motives or wallet ownership;
- preserve exact source links;
- be bilingual in English and Russian.

Search results, fetched pages and model output are treated as untrusted inputs. A model response alone is never sufficient to bypass the source and semantic guards.

## How to verify that it is working

Machine-readable state is available at `/agent-status.json`. GitHub Actions records every run under **Website Content Agent**. Successful data-only commits use the author **CopyPump Content Agent** and the message `content: autonomous project and Radar data refresh`.

Content-agent commits pass the full website verification and then use the guarded Cloudflare production deployment path. Ordinary UI commits do not receive this autonomous production path.

Required secret for web discovery: `KIMI_API_KEY`. If it is missing, the discovery step fails closed, reports `KIMI_API_KEY_MISSING` in the agent status and does not fabricate a story.
