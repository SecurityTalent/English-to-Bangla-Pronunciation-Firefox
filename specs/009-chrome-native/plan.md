# Implementation plan

1. Record the Chrome source completeness and browser-specific API requirements.
2. Make `chrome/` self-contained with its own Chrome MV3 manifest, service worker, content script, and options UI.
3. Replace compatibility fallbacks in Chrome scripts with direct `chrome.*` APIs and declare the supported Chrome version.
4. Build Chrome artifacts from `chrome/` while preserving the Firefox release build.
5. Check syntax, manifest, archive contents, and update the task record.
