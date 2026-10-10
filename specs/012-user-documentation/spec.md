# User Setup and Project Documentation

## Problem

The project now ships separate Chrome and Firefox extensions, but the README did not provide enough detail to set up the shared backend, load each browser build, configure the API, run checks, or troubleshoot common local setup issues.

## Requirements

- Explain prerequisites and safely create/configure the backend environment file.
- Explain where to create/find the Gemini API key and how to keep it server-side.
- Document separate Chrome and Firefox source directories, minimum browser versions, and load-unpacked development steps.
- List exact build outputs and explain which package goes to each store.
- Document backend URL settings, API routes, local testing, and common startup errors.
- Explain selected-text data flow, API key handling, and the production HTTPS/abuse-protection requirements.
- Keep the privacy policy, product requirements, and SDD index consistent with current behavior.

## Acceptance criteria

1. A new contributor can install backend dependencies, create `.env`, start the backend, and check its health route using README instructions.
2. Chrome and Firefox can each be loaded from their own build output without mixing files.
3. README lists the actual build, test, and package commands and output paths.
4. Documentation identifies the API key as backend-only and states that public deployment needs HTTPS and abuse controls.
5. Privacy and product requirement documents describe both pronunciation and meaning flows.
