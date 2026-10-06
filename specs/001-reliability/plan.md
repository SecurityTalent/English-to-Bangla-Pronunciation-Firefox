# Implementation plan

1. Invalidate outstanding content-script requests whenever a result is removed.
2. Dismiss the previous badge after any ordinary mouse selection.
3. Dismiss stale results for invalid selections instead of leaving unrelated output visible.
4. Reduce the selection debounce to 120 ms and select a low-latency Gemini model.
5. Stop retrying alternate model names after a network failure.
6. Run source syntax checks, the existing backend smoke test, and package build; record outcomes in `tasks.md`.

## Design notes

The content script already assigns monotonically increasing request IDs. Advancing that ID on dismissal reuses the existing stale-response guard and keeps the backend protocol unchanged. Normal mouse selection is handled at `mouseup`, so dismissing there avoids interrupting the browser's selection gesture.
