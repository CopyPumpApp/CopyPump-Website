# CopyPump Website

Official public website for CopyPump — non-custodial, rules-first trading infrastructure on Solana.

## Local development

```bash
npm ci
npm run dev
```

`npm run preview` serves the production Vite build locally. This repository contains the public website only; backend/runtime work belongs in the product repository.

## Validation

Before merging public-site changes, run:

```bash
npm run check
npm run test:e2e
```

GitHub Actions runs the same production validation and browser regression suite for pull requests and `main`.

## Repository layout

```text
src/
  components/   Shared runtime and accessibility components
  i18n/         English/Russian copy and locale routing
  pages/        Legal and 404 routes
  premium/      Active production website UI
  radar/        Public Radar UI, schema and local-state handling
  styles/       Production CSS entrypoint
public/
  media/        Active production artwork
  radar/        Published public Radar data and evidence
scripts/        Build audits and Radar maintenance utilities
tests/e2e/      Current browser regression suite
docs/           Current architecture, QA and editorial guidance
```

The `public/media/v48` and `public/media/v51` directory names are retained because those files are still active production URLs. They are not archive folders.

## Change policy

- Work in a branch and merge through a pull request.
- Keep `main` deployable; avoid direct production repair commits except for an emergency rollback.
- Do not publish private project data, credentials, internal diagnostics, unreviewed claims, or unsupported launch/readiness claims.
- Public product claims must match the current verified project state.
- UI changes must preserve keyboard access, visible focus, mobile touch targets, and `prefers-reduced-motion` behavior.
- New images should be sized for their rendered use and compressed before commit.

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
