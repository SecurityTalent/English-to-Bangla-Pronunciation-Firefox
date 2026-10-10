# Specification: Prepare browser extensions for store publishing

## Status

Guidance provided; public deployment remains required

## Requirements before public release

- The extension's configured backend URL must be a publicly reachable HTTPS endpoint, not `localhost`.
- The service must keep the Gemini API key server-side and be available to users.
- The listing must explain what selected text is sent to the backend/model and provide a privacy policy.
- Submit the Chrome ZIP to the Chrome Web Store and the Firefox ZIP to Mozilla Add-ons.
- Each packaged extension must pass its store's validation and reviewer checks.
