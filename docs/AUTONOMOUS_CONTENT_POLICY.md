# Autonomous Website Content Policy

The CopyPump website visual system is frozen for autonomous content updates.

## Allowed autonomous changes

The content agent may change only:

- `src/content/project-status.generated.ts`
- `public/public-status.json`
- `public/radar/**` when the data is generated from reviewed public evidence
- dated factual copy wired to the generated project-status module

Every factual update must come from an explicitly public-safe, verified project record. Mainnet, profitability, audit, funding, partnership, user-count, volume and launch-readiness claims are fail-closed unless explicitly authorized by the public source.

## Forbidden autonomous changes

The agent must never autonomously change:

- `src/premium/premium.css`
- `src/premium/header-canopy.css`
- `src/styles/**`
- `public/media/**`
- fonts, icons or brand artwork
- scene themes, backdrops or artwork components
- DOM/layout structure
- navigation mechanics
- animation/motion behavior
- responsive behavior
- component geometry or visual hierarchy

Any diff touching those surfaces requires an explicit owner-directed design task.

## Release gate

A content update may reach `main` only when:

1. the source record is public-safe and verified;
2. the generated content contains the same safety constraints as the source;
3. the diff allowlist passes;
4. typecheck, clean-public audit, UI regression audit and production build pass;
5. browser smoke tests pass in CI.

A content agent must fail closed rather than infer missing facts.
