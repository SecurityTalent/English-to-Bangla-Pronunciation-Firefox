<div align="center">
  <img src="icons/icon.svg" alt="English to Bangla Pronunciation icon" width="88" height="88" />
  <h1>English to Bangla Pronunciation</h1>
  <p>A Firefox extension for Bengali-script pronunciations of selected English text.</p>
  <p>A project by <a href="https://securitytalent.net">Security Talent</a>.</p>
</div>

---

## Overview

Hold **Ctrl** while selecting English text to see its phonetic pronunciation in Bengali near the selection. The extension transliterates pronunciation; it does not translate meaning.

```text
Authentication
      ↓
অথেন্টিকেশন
```

## Features

| Feature | Details |
| --- | --- |
| Ctrl + select | Requests a pronunciation only for Ctrl-assisted selections. |
| Inline result | Places a temporary badge near the selected text and adjusts its position to fit the viewport. |
| Quick dismissal | Removes the badge when the selection is cleared, a normal selection is made, or Escape is pressed. |
| Built-in dictionary | Returns common pronunciation entries without a Gemini request. |
| Caching | Reuses previous results to reduce repeat requests. |
| Browser shortcuts | Leaves Ctrl+C, Ctrl+A, Ctrl+F, Ctrl+V, Ctrl+Z, and Ctrl+X available to Firefox. |

## How it works

```text
Firefox content script → background script → pronunciation backend → Gemini API
```

The extension sends requests to the configured backend. The backend handles dictionary lookups, caching, and Gemini API calls. The Gemini API key stays on the backend and is never included in the extension package.

## Get started

### Requirements

- Firefox for extension testing
- Node.js 18 or later
- A Gemini API key for text not covered by the built-in dictionary

### Get a Gemini API key

1. Sign in to [Google AI Studio](https://aistudio.google.com/) with your Google account.
2. Open the [API Keys page](https://aistudio.google.com/app/apikey).
3. Select **Create API key** and follow the prompts to create or select a Google project.
4. Copy the key into `GEMINI_API_KEY` in `backend/.env` for local development. For a hosted backend, add it as a secret environment variable in the hosting provider's dashboard.

Google offers a free tier for eligible Gemini models and projects, subject to model availability, account eligibility, and usage/rate limits. Limits and pricing may change; check Google's [current Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) before use. Google states that free-tier content may be used to improve its products, so do not send sensitive text through a free-tier key. See Google's [API key guidance](https://ai.google.dev/gemini-api/docs/api-key) and applicable terms for current security and data-use details.

Never put the API key in `manifest.json`, extension JavaScript, or a public repository. Keep it on the backend only.

### Configure the backend

Run these commands from the project root in PowerShell:

```powershell
npm --prefix backend install
Copy-Item backend/.env.example backend/.env
```

If `backend/.env` already exists, keep it and update it instead of copying the template. Add your key:

```env
GEMINI_API_KEY=your_api_key
PORT=3000
GEMINI_MODEL=gemini-3.5-flash-lite
```

Keep `.env` private. Environment files, `node_modules`, and generated ZIP/XPI packages are excluded by `.gitignore`.

Start the local backend:

```powershell
npm start
```

The API is available at `http://localhost:3000`. Other root commands:

```powershell
npm test        # Backend dictionary smoke checks
npm run build   # Create versioned ZIP and XPI packages in dist/
```

The smoke test uses port 3000. Stop the backend before running `npm test`.

### Load the extension in Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on...**.
3. Choose the project's `manifest.json`.
4. Open `test_demo.html`, hold Ctrl, and select an English word such as “Authentication”.
5. Release the mouse to see the Bengali pronunciation. Press Escape or clear the selection to dismiss it.

Temporary add-ons are removed when Firefox restarts. Use an AMO-signed build for a persistent installation.

## Backend API

### `POST /api/pronunciation`

Request:

```json
{ "text": "Authentication" }
```

Successful response:

```json
{ "pronunciation": "অথেন্টিকেশন", "source": "cache" }
```

The endpoint accepts up to 500 characters and rejects empty input. `GET /api/health` reports the service status, configured model, whether an API key is present, and the in-memory cache size. It does not return the API key.

## Production deployment

The default backend address, `http://localhost:3000`, is for local development only. A public extension needs a publicly reachable **HTTPS** backend.

For a Render Web Service, configure:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Environment variables | `GEMINI_API_KEY`, `GEMINI_MODEL` |

After deployment, set `DEFAULT_SETTINGS.backendUrl` in `background.js` to the public HTTPS endpoint, increment the version in `manifest.json`, build a new package, and verify both the health and pronunciation endpoints.

**Production security:** the backend currently has no authentication or rate limiting. Add request abuse controls and usage monitoring before exposing it publicly; otherwise, other people may consume the operator's Gemini quota.

Render Free services sleep after inactivity and may take about a minute to wake. Render describes its free instances as suitable for hobby projects and testing, not production use. Review [Render's current limits](https://render.com/docs/free) and select production-suitable hosting for a public release.

## Privacy

When a user selects text while holding Ctrl, the extension sends that text (up to 500 characters) to the configured backend. On a cache miss, the backend sends it to Gemini. Pronunciations and the backend URL are stored in Firefox extension storage; the backend also keeps a temporary in-memory cache.

Before publication, verify the deployed service's actual data handling, replace the contact placeholder in [PRIVACY.md](PRIVACY.md), and publish the policy at a public URL. Disclose the text transfer and any provider retention in the AMO listing.

## Build and publish

Build release packages from the project root:

```powershell
npm run build
```

The script creates versioned `.zip` and `.xpi` files under `dist/`. Upload the ZIP through the [AMO Developer Hub](https://addons.mozilla.org/developers/), select **Submit a New Add-on** and **On this site**, then review the validator results and complete the listing and privacy details. Fix validation errors before submitting. See Mozilla's [submission guide](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/).

AMO validation and review are not guaranteed. Build packages locally or attach them to a GitHub Release; generated packages are intentionally excluded from the source repository.

## Project structure

```text
backend/                 Express API, built-in dictionary, and smoke test
icons/                   Extension's scalable vector icon
specs/                   Specifications, plans, and task tracking
background.js            Settings, cache, and backend requests
content.js               Selection tracking and pronunciation badge
manifest.json            Firefox Manifest V3 configuration
options.html / options.js Settings, health check, and quick test UI
build_extension.js       ZIP/XPI packaging script
PRIVACY.md               Privacy policy draft
Requerment.md            Product requirements
```

## Development workflow

This project follows a lightweight Spec-Driven Development workflow. Change records live under `specs/` and use `spec.md` for requirements, `plan.md` for the implementation approach, and `tasks.md` for progress and verification. Keep `Requerment.md` as the product-level requirements source.

## Troubleshooting

- **Backend offline:** run `npm start` from the project root for local development. Published builds need a reachable HTTPS backend, not `localhost`.
- **Gemini API key required:** set `GEMINI_API_KEY` in the local `backend/.env` or the hosting provider's environment configuration, then restart the backend.
- **No pronunciation appears:** hold Ctrl during selection and select English text of 500 characters or fewer. Common dictionary entries can work without a Gemini key.
- **A previous backend is still running:** stop it before running `npm test`, because the smoke test uses port 3000.
