# Chrome Native Source and Packaging

## Problem

The Chrome directory previously contained only a manifest while its implementation was copied from Firefox root files during packaging. That made the Chrome source incomplete and kept Firefox API compatibility code in Chrome's runtime.

## Requirements

- Keep a complete, directly loadable Chrome extension source under `chrome/`.
- Use Chrome Manifest V3 and Chrome's `chrome.*` extension APIs in Chrome code.
- Keep Firefox implementation and packaging working independently.
- Build the Chrome archive and unpacked install directory from `chrome/` only.
- Track Chrome implementation and release work in this specification folder.

## Acceptance criteria

1. `chrome/` contains its manifest, background service worker, content script and stylesheet, and options UI files.
2. Chrome source does not reference Firefox's `browser` namespace or a cross-browser API fallback.
3. `npm run build` packages the Chrome ZIP and unpacked folder from `chrome/`, while still producing Firefox ZIP/XPI packages.
4. Chrome manifest and JavaScript syntax checks pass, and the Chrome ZIP contains all required files at its root.
