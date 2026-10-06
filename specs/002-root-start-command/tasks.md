# Tasks

- [x] Reproduce the reported cause by checking that the project root lacked `package.json`.
- [x] Add root scripts delegating to the backend and existing build script.
- [x] Verify `npm start` from the project root starts the backend.

## Verification log

- 2026-10-06: Root `npm start` successfully delegated to `backend/` and printed the listening endpoint on port 3000.
