# V51 header compatibility — actual build output

Candidate 5d1cc0fd failed two browser assertions: desktop and Android Chromium computed no backdrop blur for the scrolled header, while WebKit passed. The remaining 179 tests passed; two intentional project-matrix cases were skipped. The failing assertion was retained, not relaxed.

A minimal reproduction with the repository's locked Vite 8.2.2 toolchain and es2020 target established that `backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)` was minified to the prefixed declaration alone. Reversing the declaration order preserved BOTH prefixed and standard declarations. This is a source/build compatibility correction, not a change to the accepted transparency or visual design.

The fix places the vendor-prefixed fallback first and the standard declaration last. A new post-build assertion inspects the actual shipped stylesheet and requires both forms in the scrolled-header rule. Source checks alone had missed the loss during minification. Existing real browser assertions and screenshots remain mandatory.

No whole-page filter, permanent dark header, animation-timing change, source-data change or production deployment is introduced. Main and the v50 branch stay unchanged. Re-run the exact corrected candidate and review the final screenshots before calling it verified.
