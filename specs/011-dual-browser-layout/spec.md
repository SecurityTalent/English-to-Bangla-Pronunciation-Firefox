# Separate Chrome and Firefox Implementations

## Status

Implemented on `main`; both source directories and separate build outputs are available.

## Problem

The user wants both browser extensions, with each browser's code maintained and packaged separately. During implementation, a Chrome-only branch cleanup temporarily removed the Firefox source tree, so the Firefox source was restored in its own directory.

## Requirements

- Keep the complete Chrome implementation in `chrome/` and complete Firefox implementation in `firefox/`.
- Keep each browser's manifest, background code, content scripts, options UI, and icons within its own directory.
- Use Chrome APIs in Chrome code and Firefox-compatible APIs/settings in Firefox code.
- Build each extension from its own directory without cross-copying implementation files.
- Produce Chrome ZIP/unpacked output and Firefox ZIP/XPI/unpacked output separately.
- Keep the shared backend and product behavior common to both extensions.

## Acceptance criteria

1. Both source directories contain their complete required files and assets.
2. Chrome and Firefox manifests are valid and point only to files in their own directory.
3. Build output includes separate browser-specific ZIPs and unpacked directories; Firefox also has an XPI.
4. Each archive contains its own manifest, scripts, options UI, and icon assets at the archive root.
5. README and project tracking explain how to load and release each browser version.
