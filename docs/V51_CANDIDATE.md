# V51 corrected candidate

The final header/menu fixes have been applied to the preview branch at 1f9a4e973ba9f1a8473c9fc960ca3ebb146e97d3 with exact before/after source checksums. TypeScript, source/data/UI audits and production build passed. The temporary source/export and integration workflows and patch files have been removed.

This review commit submits the corrected candidate through the normal authorized repository connection for full CI. It does not change workflow approval settings, repository permissions, main, or the v50 branch.

The earlier v51 visual artifact showed readable headings, directional object motion, branded social controls and seven same-art themed backgrounds, but also a real scrolled-header overlap. The corrected candidate adds a bounded feathered header canopy and defers page/reveal entry until the menu has exited. Four new regressions cover the reported overlap, sequencing, scene load failure and reduced-motion late content.

No final visual or physical-device pass is claimed in this note. Check the resulting CI and its exact-commit screenshots/videos before acceptance. Production remains the previously accepted v49 until the owner accepts this preview.
