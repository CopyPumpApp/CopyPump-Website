# CopyPump Website

Official public website for CopyPump — non-custodial, rules-first trading infrastructure on Solana.

## Local development

```bash
npm ci
npm run dev
```

`npm run preview` serves the production Vite build locally. This website repository has no application backend; backend/runtime work belongs in the product repository.

## Validation

Before merging public-site changes, run:

```bash
npm run check
```

The check runs TypeScript validation, the public-surface regression audit, and a production Vite build. GitHub Actions runs the same validation for pull requests and `main`.

## Change policy

- Work in a branch and merge through a pull request.
- Keep `main` deployable; avoid direct production repair commits except for an emergency rollback.
- Do not publish private project data, credentials, internal diagnostics, unreviewed claims, or unsupported launch/readiness claims.
- Public product claims must match the current verified project state.
- UI changes must preserve keyboard access, visible focus, mobile touch targets, and `prefers-reduced-motion` behavior.
- New images should be sized for their rendered use, compressed before commit, and should not create multi-megabyte initial page payloads without a documented reason.

## Deployment

Cloudflare builds from the repository. A successful website build proves only that the public frontend compiled and deployed; it is not evidence that trading, Mainnet access, wallet execution, or profitability is ready.

The current `workers.dev` host is temporary. When the official domain is verified, canonical URLs, sitemap URLs and crawler configuration should be switched together to the official production origin.

## Public positioning

The website explains the CopyPump product, user-control model, decision flow, current public-safe progress, and official community channels. Developer diagnostics and unrelated ecosystem experiments should not be presented as primary marketing content.

## Official channels

- X: @CopyPumpAI
- GitHub: CopyPumpApp/CopyPump
- Discord: https://discord.gg/WS95eXrGB
- Contact: copypumphq@gmail.com

## Status

CopyPump remains under active development. Public website demonstrations are illustrative and do not create transactions or imply Mainnet trading availability.
