# CopyPump Website

Official public website for CopyPump — non-custodial, rules-first trading infrastructure on Solana.

## Local development

```bash
npm ci
npm run dev:web
```

## Validation

Before merging public-site changes, run:

```bash
npm run check
```

The check runs TypeScript validation, the public-surface regression audit, and a production Vite build. A GitHub Actions workflow is included so the same validation can run automatically once Actions/workflow execution is enabled for the repository/default branch.

## Public positioning

The website explains the CopyPump product, user-control model, decision flow, current public-safe progress, and official community channels. Developer diagnostics and unrelated ecosystem experiments should not be presented as primary marketing content.

## Official channels

- X: @CopyPumpAI
- GitHub: CopyPumpApp/CopyPump
- Discord: https://discord.gg/WS95eXrGB
- Contact: copypumphq@gmail.com

## Status

CopyPump remains under active development. Public website demonstrations are illustrative and do not create transactions or imply Mainnet trading availability.
