# Release gate / v52

## Candidate
- Build the explicit accepted PR head. Keep production v51.1 during review.
- Run complete source/data/browser checks, verify initial EN/RU HTML, hydration and saved Radar versions.
- Review 390px, 1440px, the user's 1920x854 recording format and 2560px. No generic card redesign.
- Test swipe/vertical scroll, capital slider isolation, interrupted menu, external links and background failure.
- Separate physical-device/long-session tests from emulated browser captures.
- Confirm official contacts and link previews; no invented domain, partner or live service.

## Accepted release
- Merge only after acceptance. Record candidate and prior production.
- Cloudflare should expose WORKERS_CI_BRANCH=main; manual production builds require explicit COPYPUMP_BUILD_TARGET=production.
- Verify production has indexable HTML, correct canonical, release marker and sitemap. Preview noindex is intentional.
- Check 22 public routes and localized 404s. Executable assets and content must match accepted code. Preview/production metadata and headers intentionally differ; do not claim blanket byte equality of HTML.
- Test prior tabs and chunk reload recovery; never clear saved observations silently.
- Roll back the deployment to the recorded known-good version after a critical regression. Preserve source/history.

## Announcement drafts — not yet sent
EN: CopyPump's website now gives a clearer view of the product: automatic wallet discovery, user-defined limits, public verification tools and source-backed Radar observations. Technical alpha. Devnet verification continues; public Mainnet trading is not open.
RU: Обновили сайт CopyPump: больше о работе системы, автоматическом поиске кошельков, пользовательских ограничениях, публичных инструментах проверки и разборах Radar с источниками. Проект в технической альфе. Проверки Devnet продолжаются; публичная торговля в Mainnet не запущена.

Use real accepted-build imagery and the canonical public address. No recurring publishing or notification schedule is implied.
