# Specification: Modern Firefox extension icon

## Status

Implementing

## Requirements

- Use a modern, high-contrast mark that communicates English-to-Bengali pronunciation.
- Keep the toolbar, add-on manager, settings panel, and README icon consistent.
- Use a scalable Firefox-supported vector asset instead of stale, mismatched PNG sizes.

## Acceptance criteria

- The manifest and settings UI reference the same SVG icon.
- No references to the removed PNG icons remain.
- The icon is packaged in the generated Firefox archive.
