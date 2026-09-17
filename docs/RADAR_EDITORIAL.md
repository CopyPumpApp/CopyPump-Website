# Radar editorial publication contract

Radar v50 is an editorial pilot, not a live monitor or an automated daily feed. The browser cannot produce new material by refreshing old timestamps. This repository has no Radar cron schedule, external provider subscription or autonomous publishing action.

## Add or continue an observation

1. Collect a bounded, read-only public source. Preserve the full response, request parameters, cluster, collection date and SHA-256. Use a new evidence filename for each distinct response; do not overwrite evidence cited in an earlier revision. Never collect private keys, signatures to submit, or private user data.
2. Create or update a JSON record under public/radar/observations. Keep the stable id and permanent URL. Supply EN/RU facts, interpretation, unknowns, explicit dates and sources. Link source IDs in the revision history. A statement about a fee, balance or success flag must agree with the cited raw response. State when an explorer is only an independent-inspection link.
3. For a substantive change or correction, increment version, append an immutable revision, set updatedAt to the real editorial revision time and update followUps. Explain what changed and why. Do not silently rewrite old conclusions. A routine recheck without new substance changes only lastCheckedAt; it must not trigger a material-update badge.
4. Run `node scripts/build-radar-index.mjs <edition> <explicit-ISO-publication-time>`, then `npm run check` and the browser tests. The builder updates summaries from detail records and preserves timestamps unless explicitly supplied. The raw-data audit preserves exact tests for the initial examples while allowing separately sourced later observations.
5. Update public/sitemap.xml for new observation URLs in both languages. Review claims, citations and presentation in a preview PR. Merge only after the required acceptance. A collection script alone does not approve a publication.

Do not run prepare-radar-edition01.py to publish subsequent editions: it reproduces the initial snapshot for auditing and deliberately uses the frozen first-edition dates. Use the index builder and new reviewed source files instead.

## Trust boundaries

- A public account is not an identified person. Do not invent ownership, motivation, wallet quality, cost basis or return estimates.
- These third-party Mainnet reads are not CopyPump trading activity or proof of product Mainnet readiness.
- Do not confuse an RPC failure with no network activity. Keep the last verified edition with its timestamp and a visible error state.
- Preserve corrections and the limits of each interpretation. No daily publishing promise, fake scarcity, countdown, reward or trading recommendation.
- Local saves/read markers are not synchronized across devices. The privacy page discloses their storage and deletion behavior.

Success of the editorial pilot is not established by shipping this interface. Useful future material and return visits still need to be observed; no analytics service is installed in this change.
