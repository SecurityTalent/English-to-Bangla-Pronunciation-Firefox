<div align="center">
  <img src="icons/icon.svg" alt="English to Bangla Pronunciation icon" width="88" height="88" />
  <h1>English to Bangla Pronunciation</h1>
  <p>A Firefox and Chrome extension for Bengali-script pronunciations and meanings of selected English text.</p>
  <p>A project by <a href="https://securitytalent.net">Security Talent</a>.</p>
</div>

---

## Overview

Hold **Ctrl** while selecting English text to see its phonetic pronunciation in Bengali. Hold **Alt** while selecting to see its Bengali meaning. Holding both modifiers together does not trigger a lookup.

```text
Authentication
      ↓
অথেন্টিকেশন
```

## Features

| Feature | Details |
| --- | --- |
| Ctrl + select | Shows a Bengali-script phonetic pronunciation. |
| Alt + select | Shows a concise Bengali meaning, using a separate API and cache. |
| Inline result | Places a temporary badge near the selected text and adjusts its position to fit the viewport. |
| Quick dismissal | Removes the badge when the selection is cleared, a normal selection is made, or Escape is pressed. |
| Built-in dictionary | Returns common pronunciation entries without a Gemini request. |
| Caching | Reuses previous results to reduce repeat requests. |
| Browser shortcuts | Leaves Ctrl+C, Ctrl+A, Ctrl+F, Ctrl+V, Ctrl+Z, and Ctrl+X available to Firefox. |

## How it works

```text
Firefox content script → background script → pronunciation or meaning backend → Gemini API
```

The extension sends requests to the configured backend. The backend handles dictionary lookups, caching, and Gemini API calls. The Gemini API key stays on the backend and is never included in the extension package. Firefox and Chrome have separate manifests and browser-specific source folders; `chrome/` is a complete Chrome MV3 extension using the `chrome.*` APIs.

## Get started

### Requirements

- Firefox or Google Chrome for extension testing
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

Only start one backend process for a given port. If startup reports `EADDRINUSE`, a backend is already listening on that port; reuse it, or stop the existing process before starting another. To identify the process in PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object LocalAddress, LocalPort, OwningProcess
```

If another service needs port 3000, change `PORT` in `backend/.env` and update the extension backend URL to match.

### Load the extension in Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on...**.
3. Choose the project's `manifest.json`.
4. Open `test_demo.html`. Hold Ctrl while selecting for pronunciation, or Alt while selecting for Bengali meaning.
5. Release the mouse to see the result. Press Escape or clear the selection to dismiss it.

Temporary add-ons are removed when Firefox restarts. Use an AMO-signed build for a persistent installation.

### Load the extension in Chrome

1. Run `npm run build` from the project root.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Select **Load unpacked** and choose `dist/chrome-unpacked`.
4. Open `test_demo.html` and try Ctrl + select for pronunciation and Alt + select for Bengali meaning.

Chrome Web Store submissions use the Chrome ZIP package. Review the requested host access carefully during store submission.

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

### `POST /api/meaning`

Uses the same `{ "text": "..." }` request shape and input limit, and returns a concise Bengali translation in the `meaning` field. Pronunciation and meaning responses use independent caches.

## Production deployment

The default backend address, `http://localhost:3000`, is for local development only. A public extension needs a publicly reachable **HTTPS** backend.

For a Render Web Service, configure:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Environment variables | `GEMINI_API_KEY`, `GEMINI_MODEL` |

For a production release:

1. Connect the GitHub repository's `main` branch to the hosting provider and deploy the `backend` directory as a web service.
2. Configure `GEMINI_API_KEY` and `GEMINI_MODEL` as private service environment variables. Do not commit `.env` or the API key.
3. Check `https://<your-service-domain>/api/health`; confirm the service is online and `hasApiKey` is true.
4. Set `DEFAULT_SETTINGS.backendUrl` in `background.js` to `https://<your-service-domain>/api/pronunciation`. The extension derives `/api/meaning` and `/api/health` from this URL.
5. Increment the extension version in `manifest.json`, run `npm run build`, then load the ZIP in Firefox and verify both Ctrl pronunciation and Alt meaning lookups against the deployed HTTPS service.
6. Submit the ZIP to AMO and publish a privacy policy that describes the actual deployed service.

Do not describe the extension as production-ready until these steps are complete. This backend currently has no authentication or rate limiting; add request abuse controls and usage monitoring before making a public service available, or others may consume the operator's Gemini quota.

Render Free services sleep after inactivity and may take about a minute to wake. Render describes its free instances as suitable for hobby projects and testing, not production use. Review [Render's current limits](https://render.com/docs/free) and select production-suitable hosting for a public release.

## Privacy

When a user selects text while holding Ctrl or Alt, the extension sends that text (up to 500 characters) to the configured backend. On a cache miss, the backend sends it to Gemini. Pronunciations and meanings use separate browser extension storage entries; the backend also keeps temporary in-memory caches.

Before publication, verify the deployed service's actual data handling, replace the contact placeholder in [PRIVACY.md](PRIVACY.md), and publish the policy at a public URL. Disclose the text transfer and any provider retention in the AMO listing.

## Build and publish

Build release packages from the project root:

```powershell
npm run build
```

The script creates a Firefox ZIP, Firefox XPI, and Chrome ZIP under `dist/`. Upload the Firefox ZIP through the [AMO Developer Hub](https://addons.mozilla.org/developers/) and the Chrome ZIP through the Chrome Web Store developer dashboard. Review each store's validator results, permissions, listing, and privacy details before release.

AMO validation and review are not guaranteed. Build packages locally or attach them to a GitHub Release; generated packages are intentionally excluded from the source repository.

## Project structure

```text
backend/                 Express API, built-in dictionary, and smoke test
chrome/                  Complete Chrome extension source and Manifest V3 configuration
icons/                   Extension's scalable vector icon
specs/                   Specifications, plans, and task tracking
background.js            Settings, cache, and backend requests
content.js               Selection tracking and pronunciation badge
manifest.json            Firefox Manifest V3 configuration
options.html / options.js Settings, health check, and quick test UI
build_extension.js       Firefox and Chrome ZIP/XPI packaging script
PRIVACY.md               Privacy policy draft
Requerment.md            Product requirements
```

## Development workflow

This project follows a lightweight Spec-Driven Development workflow. Change records live under `specs/` and use `spec.md` for requirements, `plan.md` for the implementation approach, and `tasks.md` for progress and verification. Keep `Requerment.md` as the product-level requirements source.

## Troubleshooting

- **Backend offline:** run `npm install --prefix backend` once, then `npm start` from the project root for local development. Published builds need a reachable HTTPS backend, not `localhost`.
- **`EADDRINUSE` on port 3000:** another backend process is already running. Use that server or stop it before running `npm start` again. Configure a different `PORT` if needed.
- **Gemini API key required:** set `GEMINI_API_KEY` in the local `backend/.env` or the hosting provider's environment configuration, then restart the backend.
- **No result appears:** hold Ctrl for pronunciation or Alt for meaning while selecting English text of 500 characters or fewer. Common pronunciation dictionary entries can work without a Gemini key; generated meanings require a configured key.
- **A previous backend is still running:** stop it before running `npm test`, because the smoke test uses port 3000.
