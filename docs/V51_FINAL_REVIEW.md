# V51 final visual review corrections

The earlier integrated candidate 3bcebfdb passed the existing browser suite, but its screenshots exposed a visual problem: scrolled body text collided with the brand through the transparent header. A successful source/build check was not visual acceptance.

## Readable transparent header

The header itself remains transparent, borderless and without a visible button container. Only its small feathered pseudo-element gains a static 12px backdrop blur while scrolled; at the top this layer has zero opacity. The effect is confined to the header plus a 32px fade, never to the full scene, menu or page. Unsupported browsers receive a feathered tint fallback. Source audits explicitly isolate this exception rather than permitting arbitrary filters. This is not a claim of free GPU processing or measured physical-device smoothness.

## Menu-to-page sequencing

The earlier page-entry Web Animation could override hidden-page CSS while the menu was still closing. A dedicated hook now waits for the real menu-settled event instead of estimating the exit duration. Reveals that enter the viewport during closure also wait for that event. Normal menu dismissal does not re-arm completed page content. Finite entry animations and listeners are cancelled/released on route replacement, preference changes or completion.

## Additional regression coverage

- Reproduce scrolled text directly under the logo, test computed transparency, and capture the result.
- Check that a destination cannot paint through exiting navigation labels, then that it fully reveals after closure.
- Simulate failure to download the requested themed scene; preserve the previous decoded background and usable navigation.
- Verify asynchronously loaded Radar headings and later navigation with reduced motion.

The existing directional object-sweep, brand glyph, seven-background, Radar and accessibility tests remain. No mocked-success test or skipped failing test substitutes for visual review.

The local source archive was obtained through an allowlisted read-only repository workflow. Local TypeScript, source/data audits and production build passed. Local browser navigation is administrator-blocked and was not bypassed; browser rendering is tested in the authorized repository CI. Fresh exact-commit screenshots/videos are required before final acceptance. These are emulated profiles, not physical iPhone/Safari or an extended real-device soak.

Production main remains v49; the v50 branch is unchanged. The seven backgrounds are same-family compositions derived from existing approved art, not seven newly generated original environments. Editorial Radar still has a reviewed first edition, not an automatic live/daily feed. Do not merge to production without owner acceptance.
