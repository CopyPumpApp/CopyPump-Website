# V52 saved-state hydration review

The full test log for candidate 14aaf3c reports 226 passed, six expected project-specific skips, one failed desktop saved-state hydration test and an Android retry of that same test. React error 418 showed a client/server text mismatch when local read/saved state was restored while an initial Radar route remained dehydrated.

The first correction (90ba796) resolved the initial Radar module before hydrateRoot, but retained an unnecessary Suspense boundary around that already-resolved component. Targeted tests showed the remaining race deterministically: index filter counts and the article read-button text mismatched in all three browser profiles. Preloading alone was not sufficient and is not reported as a verified fix.

The current candidate renders the resolved initial Radar route directly, on both server and client, without that deferred boundary. Its providers and browser-local state restoration can therefore commit with the same initial tree. Only later client-side lazy navigation uses Suspense. The complete static article remains readable during the initial route chunk download; failures leave that content intact with a reload notice.

Original saved-state tests remain unchanged. Additional tests repeat direct EN/RU index/article loads with an existing saved case and unread material revision, and delay the initial chunk while checking visible content and later Save interaction. No suppressHydrationWarning, ignored React recovery error or erased local data is used. Errors include path and component stack for diagnosis.

Candidate browser results must be checked before declaring this correction verified. This is a website hydration fix, not a physical-device performance or product-readiness claim.

API references: https://react.dev/reference/react-dom/client/hydrateRoot and https://react.dev/reference/react/Suspense.
