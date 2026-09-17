# V51 object-sweep paint continuity

Video review of f6a8d429 exposed a real blank interval during object replacement, despite earlier keyframe/DOM-count tests passing. The outgoing/current role used different React keys, remounting the visible outgoing image. Both images also used native lazy loading while the new object intentionally started outside the clipped stage.

The correction preserves picture/image DOM identity by artwork name and uses eager, synchronous painting for the two bounded transition layers. The existing selection handler still predecodes the next artwork before changing the selected chapter. It does not preload all four images or change the canonical artwork. Rapid selections remain last-selection-wins and at most two layers coexist.

The new regression checks that the original image DOM node remains connected as the outgoing picture, then samples decoded image availability and visible-stage intersection on animation frames throughout the handoff. The walkthrough video must also be inspected from the exact new commit: computed keyframes alone were insufficient to catch this defect.

This corrects a visible transition defect, not a claim that every real device now meets a particular frame-rate target. The headless WebKit timing harness has recorded stalls, and physical iPhone/Safari and longer performance validation remain separate release gates. Production main remains unchanged.
