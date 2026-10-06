# Tasks

- [x] Review `Requerment.md`, extension messaging, backend API, and existing smoke test.
- [x] Add SDD tracking conventions and a reliability spec.
- [x] Invalidate pending responses when dismissing a badge.
- [x] Dismiss old output after normal selection and invalid text selection.
- [x] Reduce Ctrl-selection debounce from 300 ms to 120 ms.
- [x] Set Gemini 3.5 Flash-Lite as the configured low-latency model.
- [x] Stop model fallback attempts after network failures.
- [x] Re-run JavaScript syntax checks from the project root.
- [x] Run existing backend smoke test (`npm test` from `backend/`).
- [x] Build the Firefox package and inspect the resulting archive.

## Verification log

- 2026-10-06: `npm test` from `backend/` passed all three built-in dictionary cases.
- 2026-10-06: Root JavaScript syntax checks passed for background, content, options, backend, and build scripts.
- 2026-10-06: Firefox ZIP/XPI build succeeded; XPI archive contains manifest, scripts, styles, and icons.
- 2026-10-06: Manifest JSON parsed and MV3 background/content script entries were present.
- 2026-10-06: Faster 120 ms trigger and Gemini 3.5 Flash-Lite configured in the backend and local environment.
- 2026-10-06: Root `npm test` passed all three dictionary checks; JavaScript syntax checks passed.
- 2026-10-06: Version 1.0.1 ZIP/XPI build succeeded without overwriting the previous 1.0.0 package.
