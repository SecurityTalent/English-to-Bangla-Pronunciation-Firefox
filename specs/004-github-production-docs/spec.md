# Specification: Prepare repository documentation for GitHub and production

## Status

Documentation updated; application still needs public-backend hardening before production.

## Requirements

- Document root-level installation, start, test, and build commands accurately.
- Never instruct contributors to publish the Gemini key or local `.env` file.
- Explain that the deployed extension requires a reachable HTTPS backend.
- Document actual data flow and store privacy-policy requirements for Chrome and Firefox.
- Describe Chrome Web Store and Mozilla Add-ons validation as required steps without guaranteeing results.
- Ignore generated ZIP/XPI packages in the source repository.

## Acceptance criteria

- README includes GitHub publish steps and recommends a repository slug.
- README names the current package version and explains production backend setup.
- Security and privacy limitations are stated accurately.
