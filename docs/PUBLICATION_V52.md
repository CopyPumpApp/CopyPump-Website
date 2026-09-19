# CopyPump v52 — publication candidate checklist

Base production: v51.1 on `main`. This branch changes Home information density and presentation only. It does not change custody, wallet/signing behavior, trading access, Radar source evidence, repository visibility or ownership.

## 1. Editorial contract

Home has one job: explain enough of CopyPump to make the project understandable and credible before a visitor opens Product or Progress.

Required Home sequence:

1. Hero — value proposition and honest Technical Alpha label.
2. Why CopyPump — automatic discovery, qualification before capital, user-defined boundaries.
3. Product Experience — four-stage interactive illustration with swipe/keyboard controls and local capital-limit demo.
4. Your Control — concise overview only; detailed policy copy stays on Product.
5. Why the pipeline matters — discovery → qualification → constraints → execution → reconciliation.
6. Radar digest — up to three current editorial observations; details stay on Radar.
7. Project status — dated public stage plus the current engineering proof target.
8. Product map — what is public/documented/being verified/locked.
9. Community — discussion, contribution and partnership links.

Do not restore card-heavy visual containers, mock trading tables, fake live counters or repeated long-form Product copy.

## 2. Public claims gate

Every release must preserve the current conservative public status:

- Solana;
- Technical Alpha;
- current verification target: Solana Devnet;
- non-custodial design;
- user-controlled wallet signing / bounded authority as the intended model;
- public Mainnet trading intentionally locked;
- no guaranteed returns;
- UI/simulation/AI output is not proof of a completed on-chain lifecycle.

The dated status source remains `CopyPumpApp/CopyPump/docs/PROJECT_STATUS.md` until a newer reviewed public record replaces it.

Automatic wallet discovery may be described as product behavior/architecture, but Home must not imply that the entire production Mainnet lifecycle is publicly proven.

## 3. No-duplication rule

- Home: concise value, control, pipeline and status summaries.
- Product: detailed execution policy, authority model, FAQ.
- Progress: verification gates, dated engineering status, roadmap.
- Radar: source-backed public-ledger observations and editorial history.

Exact long Product paragraphs must not be copied onto Home.

## 4. UX and accessibility gate

Required before release:

- 320, 375, 390, 430, 768, desktop widths: no horizontal overflow.
- EN/RU: no clipped headlines or controls.
- Header remains readable while transparent.
- Menu works after deep scroll, rapid open/close, route/language changes.
- Artwork swipe remains limited to artwork; vertical scroll/pinch and capital slider remain independent.
- Keyboard controls and visible focus remain.
- Reduced Motion / Motion Off keeps all content readable and functional.
- All social/contact links appear once where intended and use accessible text alongside brand glyphs.

## 5. Visual gate

Owner review must inspect actual same-build screenshots/video for:

- Hero;
- Why CopyPump;
- all four Product Experience states;
- Your Control;
- pipeline;
- expanded Radar digest;
- status;
- Product map;
- Community;
- fullscreen menu;
- Product/Progress/Contact mobile pages.

The candidate fails visual acceptance if new content creates card clutter, large empty holes, overly long single-screen paragraphs, unreadable background competition or abrupt scene changes.

## 6. Functional/data gate

- Capital-limit example stays local; no wallet/RPC/order calls.
- Radar Home digest fetches the small index only, not detail/evidence payloads.
- Radar saves/read versions preserve existing privacy behavior.
- Source/data audits continue to verify the initial Radar claims.
- Broken scene downloads retain a usable previous scene.
- All internal routes return application content and navigation remains reversible.

## 7. SEO/share gate

Current implementation already manages:

- document title and description;
- robots meta;
- canonical URL;
- EN/RU/x-default alternate links;
- Open Graph title/description/image/URL;
- X/Twitter-card title/description/image;
- robots.txt and sitemap.xml.

Before moving from the Workers address to the final custom domain, update and verify every absolute hostname in:

- `public/robots.txt`;
- `public/sitemap.xml`;
- any release/deployment documentation.

Dynamic canonical/OG URLs use the current site origin and therefore should be rechecked on the custom domain rather than hard-coded early.

## 8. Performance gate

Do not call the site “lag-free” from CI emulation.

Required:
- production build succeeds;
- asset requests do not regress into loading every heavy object at once;
- no full-page animated blur/filter;
- completed reveals release temporary animation hints;
- short CI motion diagnostics remain advisory only;
- physical iPhone/Safari and in-app-browser review is required for final performance acceptance if available.

## 9. Legal/privacy/contact gate

- Privacy covers browser-local Radar saved/read state.
- Terms/Security/Contact remain reachable in EN/RU.
- Contact exposes one canonical X, Discord, GitHub and email link.
- No misleading audit, funding, profitability or Mainnet-readiness statement.

## 10. Release procedure

1. Build isolated preview from this branch.
2. Run TypeScript + public/UI/Radar audits + production build.
3. Run full browser suite.
4. Review exact-build screenshots/video.
5. Owner accepts the preview.
6. Merge with the accepted head SHA pinned.
7. Wait for Cloudflare production success.
8. Compare production assets/content against the accepted candidate.
9. Run read-only public smoke in desktop Chromium, iPhone/WebKit and Android profile.
10. Preserve the previous production commit for rollback.

A green CI result is necessary but not sufficient for owner visual acceptance.
