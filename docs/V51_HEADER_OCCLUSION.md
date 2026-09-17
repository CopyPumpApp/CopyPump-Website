# V51 header / visual occlusion correction

The final QA image from b861a2bb still showed body copy crossing the brand, despite the computed backdrop-filter test passing. Therefore that test did not prove visual correctness. The prior "blur fixed" wording is superseded by this correction.

The new header keeps a fully transparent surface at the top. When scrolled, a feathered, clipped rendering of the current background scene covers the area under the controls and fades out over 32px. It reuses the current theme's image URL and the same viewport crop. This intentionally renders the decoded artwork twice, once for the scene and once for the small header region. It does not add a new artwork source, but it is not claimed to be free of rendering/memory cost.

A React portal renders the canopy inside the persistent header, below its controls. Scene and previous-theme state come from the same owner as the full backdrop. A small MutationObserver mirrors section mood changes; no scroll-frame loop is added. The earlier pseudo-element blur implementation is disabled while this canopy is mounted. No black rectangular fill, border, forced scroll container or hidden body text is used in the application.

The regression now captures the header twice with exactly the same composition: once with body text behind it, once with that body text hidden by the test. The image buffers must match. The test also asserts transparency at the top, matching scene image, bounded canopy height and accessible navigation. The DOM style test remains supplementary rather than the visual acceptance criterion.

This change does not modify Radar evidence, product content, artwork originals, main or v50. Repository CI and actual same-build screenshots must pass before the preview is called ready. Physical iPhone/Safari performance and owner acceptance remain separate release gates.
