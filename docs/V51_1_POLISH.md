# CopyPump v51.1 / targeted owner corrections

Base: accepted visual candidate 13203ab5ed4eb02b5008a28df783bc1b1a22340e. The previously offered four-file ZIP was not built or deployed and contains older v51 source. Do NOT overwrite current files from that ZIP: it would revert the header occlusion/menu-entry fixes. This integration patches the exact accepted Git base instead.

- Owner-corrected product model: system discovery/selection of successful public wallets; users set strategy, limits and permissions, not the copied wallets. EN/RU hero and discovery copy updated; existing alpha/Mainnet and risk disclosures preserved. This is a copy correction supplied by the owner, not a new claim of public Mainnet availability or guaranteed returns.
- Contact page uses its canonical branded links exactly once. The duplicate legacy text list is removed from both language dictionaries; footer and overlay channel rows are suppressed on Contact only. Elsewhere those navigation links stay intact. Security advice is retained.
- Swipe/drag lives only on the artwork. Controls/slider/prose are outside it. Direction intent, minimum distance, cancellation and multi-touch handling preserve vertical pan/pinch zoom. Swipe commits on release; one deliberate gesture selects one adjacent chapter, with finite boundaries. Existing sweep animations, decoded-image handoff and stable image keys are unchanged. Keyboard and visible borderless previous/next controls remain available.
- Mobile section padding reduced from 68px to 40px per side; desktop 110px to 80px. Community follows the same tighter spacing; desktop experience min-height 660px to 580px. No changes to background assets, header rendering, typography animations, theme mapping, Radar data or trading/custody code.

Tests cover both languages, exact link counts, native pointer drags, Android CDP touch/vertical pan, short/vertical/cancelled/multitouch gestures, slider isolation, reduced motion and layout screenshots. iPhone/WebKit gesture validation via automation is not a physical iPhone/Safari test. Do not claim extended performance or real-device acceptance from CI alone.

Production and older v51 preview remain unchanged. This branch is only for review before publication.
