# CopyPump website data agent

The scheduled website agent is data-only.

It may update verified public project-status fields and re-check the already-published Radar transaction signatures. The primary site structure, navigation, artwork, scenes, animations, responsive behavior, core copy and Radar UI are outside its autonomous write scope.

## Autonomous write scope

- `src/content/project-status.generated.ts`
- `public/public-status.json`
- `public/agent-status.json`
- `public/radar/index.json` — `lastCheckedAt` only
- existing `public/radar/observations/*.json` — `lastCheckedAt` only

A semantic Radar guard compares every autonomous diff with `HEAD`. Titles, summaries, facts, interpretations, revisions, signatures, evidence files, UI code and styles cannot be changed by the scheduled agent.

## Radar behavior

The agent performs read-only `getSignatureStatuses` checks against the appropriate public Solana RPC. It compares finalized status, slot and error state with the archived evidence. When all published cases still match, it advances their verification timestamp. A mismatch does not rewrite the analysis; it produces an `attention` state.

## How to verify that it is working

The public Radar interface does not expose operator-only agent telemetry. The machine-readable state is available at `/agent-status.json`, and GitHub Actions records each run under **Website Content Agent**. Successful data-only commits use the author **CopyPump Content Agent** and the message `content: autonomous project and Radar data refresh`.

Content-agent commits automatically pass the full website verification and then trigger the guarded Cloudflare production deployment. Ordinary UI commits do not receive this autonomous production path.
