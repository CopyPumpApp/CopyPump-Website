# V52 saved-state hydration review

The full test log for candidate 14aaf3c reports 226 passed, six expected project-specific skips, one failed desktop saved-state hydration test and an Android retry of that same test. It does not report a missing-content or no-JS failure. React error 418 showed a client/server text mismatch when local read/saved state was restored while a lazy initial Radar route remained dehydrated.

On an initial prerendered Radar URL, the browser now resolves that small route module before committing the root. This matches the already-resolved server route and prevents the first parent effects from racing a deferred initial module. The full static article remains readable during download. Other initial pages retain lazy Radar loading. A download failure leaves the published HTML intact with a reload notice; it does not blank the page or silently report success. Recovery logging includes the route and component stack for diagnosis.

The old saved-state test remains unchanged. New tests repeat direct EN/RU index/article loads with an existing saved case and unread material revision, and delay the initial chunk while checking visible content and later Save interaction. No suppressHydrationWarning, ignored React recovery error or erased local data is used.

Candidate browser results must be checked before declaring this correction verified. This is a website hydration fix, not a physical-device performance or product-readiness claim.
