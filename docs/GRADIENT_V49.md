# V49 gradient motion

The first candidate used animated background-position on clipped text. Short headless timing samples showed first-run WebKit stalls (up to 171ms in the second CI run), so a static screenshot/green CI did not settle performance acceptance.

The current implementation crossfades two pre-positioned gradients on perfectly aligned text layers. Only overlay opacity changes. The base text is the single accessible copy; the visual layer is aria-hidden. This preserves changing color across letters without continuously moving the gradient background. High-contrast mode hides the overlay. One visible heading is active; mobile makes one finite 2.4-second pass.

These are implementation changes, not a guarantee of compositor acceleration on every device. Timing evidence must be read with its headless/emulated/parallel-run limitations. Physical Safari acceptance and extended soak remain open release gates.
