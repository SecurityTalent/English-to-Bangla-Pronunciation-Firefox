# Chrome Only Branch

## Problem

The Chrome branch still included the Firefox manifest, Firefox source files, Mozilla packaging, and Firefox-specific product text. Its Chrome options page also referenced an icon outside the Chrome source directory.

## Requirements

- Keep this branch's extension implementation and build output Chrome-only.
- Keep a self-contained Chrome extension under `chrome/`, including assets used by its UI.
- Build only a Chrome Web Store ZIP and Chrome unpacked directory.
- Remove Firefox extension source, XPI packaging, and Mozilla release instructions from this branch.
- Retain the backend required by the extension and document its local and production configuration.
- Keep the branch-level scope and verification tracked in this spec folder.

## Acceptance criteria

1. No Firefox manifest, Firefox implementation files, Firefox icon assets, or Firefox-specific packaging remain in the branch working tree.
2. The Chrome options UI references assets within `chrome/`.
3. `npm run build` produces only Chrome extension artifacts from `chrome/`.
4. The build ZIP contains all runtime files and assets at its root, with no Firefox/Mozilla artifacts.
5. README and development specs describe the Chrome-only branch and its backend dependency.
