# Website architecture

This document describes the active public website structure on `main`.

## Runtime entry

`src/main.tsx` mounts `src/App.tsx`. The application routes to:

- the production marketing/product experience in `src/premium/`;
- public Radar pages in `src/radar/`;
- legal/contact and 404 pages in `src/pages/`.

The site is a React + TypeScript + Vite frontend. There is no application backend in this repository.

## Active public assets

- `public/media/v48/` contains the current product-stage artwork and responsive Earth/trading background used by the production UI.
- `public/media/v51/` contains the current route scene artwork.
- `public/radar/` contains published public Radar records and their evidence files.
- icons, manifest, crawler files and `.well-known/security.txt` live directly under `public/`.

The versioned media directory names are historical URL identifiers that remain in active production use. They should not be removed or renamed without updating runtime references and regression tests.

## Quality gates

`npm run check` performs TypeScript validation, public/UI audits and the production build.

`npm run test:e2e` runs the current Playwright regression suite across supported browser/device profiles. Some test filenames retain the release in which a regression was first discovered; those tests remain active protection for the current site.

## Maintenance boundary

Keep only code, assets, tests and documentation that support the current public site or its repeatable validation. One-off release candidates, obsolete design notes, generated-source originals and superseded implementation branches should not live in the production tree.
