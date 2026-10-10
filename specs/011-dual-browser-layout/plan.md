# Implementation plan

1. Restore the independent Firefox implementation under `firefox/`.
2. Keep Chrome's native MV3 implementation and assets under `chrome/`.
3. Make the build package each source directory independently, creating Chrome ZIP/unpacked and Firefox ZIP/XPI/unpacked outputs.
4. Update README, privacy, product requirements, and project tracking for the two-source layout.
5. Build both packages and verify manifests, syntax, and archive contents.
