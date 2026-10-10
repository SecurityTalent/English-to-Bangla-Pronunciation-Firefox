# Implementation plan

1. Record the Chrome-only branch requirements and scope.
2. Remove the Firefox extension manifest, scripts, icon, and XPI packaging from this branch.
3. Make the Chrome source and referenced UI assets self-contained under `chrome/`.
4. Simplify the build to create only Chrome ZIP and unpacked artifacts.
5. Update project, backend, and privacy documentation to describe Chrome.
6. Build the package and inspect source references and archive contents; record results in tasks.
