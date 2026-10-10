# English to Bangla Pronunciation

Chrome and Firefox extensions that show Bengali-script pronunciations and meanings for selected English text. The browser implementations are kept in separate folders and packaged separately.

## Features

- Hold **Ctrl** while selecting English text to look up its Bengali-script pronunciation.
- Hold **Alt** while selecting English text to look up its Bengali meaning.
- Common pronunciations can come from the built-in dictionary; results are cached in the extension and backend.
- The toolbar settings show backend health, allow backend URL configuration, provide a pronunciation test, and clear the extension cache.

Both extensions request access to all websites so their content scripts can detect selected text. Selected text is sent to the configured backend only when a lookup is triggered with Ctrl or Alt; see [PRIVACY.md](PRIVACY.md) for the data flow.

## Quick start

1. [Get a Gemini API key](#get-a-gemini-api-key).
2. [Set up and start the backend](#set-up-the-backend).
3. Run `npm.cmd run build`.
4. Load `dist/chrome-unpacked` in Chrome or `dist/firefox-unpacked/manifest.json` in Firefox.

## Requirements

- Windows PowerShell commands below use `npm.cmd`. On macOS/Linux, use `npm` in the same commands.
- Node.js 18 or later for the backend.
- Chrome 91 or later, or Firefox 109 or later.
- A Gemini API key for meaning lookups and pronunciation text not covered by the built-in dictionary.

## Get a Gemini API key

1. Sign in to [Google AI Studio](https://aistudio.google.com/).
2. Open [API Keys](https://aistudio.google.com/apikey). A new account may already have a default project and key; otherwise choose **Create API key** and follow the prompts to select or create a Google Cloud project. If your existing project is missing, import it from AI Studio's **Dashboard → Projects** page first.
3. Copy the key and keep it private. Google's [Gemini API key guide](https://ai.google.dev/gemini-api/docs/api-key) explains project access, key types, restrictions, and current requirements.
4. Add the key to `GEMINI_API_KEY` in `backend/.env` as described below. Never paste it into `chrome/`, `firefox/`, or a public GitHub repository.

API availability, quotas, and charges depend on your Google project and current terms. Check Google's [current Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) and limits before use; don't assume a key is unrestricted or free.

## Project layout

```text
chrome/                  Complete Chrome MV3 source and manifest
firefox/                 Complete Firefox source and manifest
backend/                 Shared pronunciation and meaning API
specs/                   Product requirements and implementation tracking
dist/                    Generated browser packages (created by the build)
```

Do not copy files between `chrome/` and `firefox/`. Each directory has its own manifest, scripts, options page, and icon assets. Both use the shared backend.

## Set up the backend

From the repository root, install the backend dependencies:

```powershell
npm.cmd --prefix backend install
```

Create `backend/.env` from the example only if it does not already exist:

```powershell
if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
```

Edit `backend/.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key
PORT=3000
```

Keep the `PORT` and `GEMINI_MODEL` entries from `backend/.env.example` unless you need to change them.

Keep this file private. `.env` files are excluded from Git, and the key must never be added to either extension's source or package. The built-in dictionary can return its covered pronunciations without a Gemini key; generated pronunciation and meaning lookups need a configured key.

Start the backend from the repository root:

```powershell
npm.cmd start
```

The local API is available at `http://localhost:3000`. Open `http://localhost:3000/api/health` to confirm it is running. Keep the backend terminal open while using the extensions.

## Build both extensions

From the repository root:

```powershell
npm.cmd run build
```

The build creates these separate outputs under `dist/`:

| Browser | Load-unpacked directory | Store package |
| --- | --- | --- |
| Chrome | `dist/chrome-unpacked/` | `dist/bangla-phonetic-pronunciation-chrome-v1.0.2.zip` |
| Firefox | `dist/firefox-unpacked/` | `dist/bangla-phonetic-pronunciation-firefox-v1.0.2.zip` and `dist/bangla-phonetic-pronunciation-v1.0.2.xpi` |

Package versions come from each browser's manifest. Generated files under `dist/` are not committed.

## Install for local development

First build both versions and start the backend as described above.

### Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Select **Load unpacked** and choose `dist/chrome-unpacked`.
4. If testing the local `test_demo.html` file, open the extension's **Details** page and enable **Allow access to file URLs**.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on...**.
3. Choose `dist/firefox-unpacked/manifest.json`.

Temporary Firefox add-ons are removed when Firefox restarts. For either browser, open `test_demo.html`, hold Ctrl while selecting a word for pronunciation, or hold Alt while selecting it for meaning. Click the extension toolbar button to open settings and check the backend status.

## Configure the backend URL

Both extensions default to:

```text
http://localhost:3000/api/pronunciation
```

Open the extension's toolbar settings, enter the full pronunciation endpoint URL, and save it. The extension derives `/api/meaning` and `/api/health` from that URL. For a different local port, update the URL to match the backend's `PORT` setting.

The current clear-cache action clears extension storage, including a custom backend URL; set the URL again afterward if you use one.

## API reference

Both endpoints accept a JSON body with a non-empty `text` string of up to 500 characters.

```http
POST /api/pronunciation
Content-Type: application/json
```

```json
{ "text": "Authentication" }
```

Returns a `pronunciation` field containing Bengali phonetic spelling. `POST /api/meaning` uses the same request body and returns a Bengali `meaning` field. `GET /api/health` reports service status, whether a Gemini key is configured, the model name, and cache size; it never returns the key.

## Tests and troubleshooting

Run the backend smoke tests with:

```powershell
npm.cmd test
```

The smoke tests check common built-in pronunciation entries and start their own server on port 3000. Stop the regular backend first. If you see `EADDRINUSE`, another process is using that port; reuse it or stop it before starting another backend. To find the listener in PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object LocalAddress, LocalPort, OwningProcess
```

Other common issues:

- **Backend offline:** start it with `npm.cmd start` and check `/api/health`.
- **Missing Gemini key:** set `GEMINI_API_KEY` in `backend/.env`, then restart the backend. Built-in pronunciation entries still work without it; meanings require Gemini.
- **No result in Chrome on a local file:** allow file URL access on the extension's Details page, then reload the tab.
- **No result on a page:** use a non-empty English selection of 500 characters or fewer and hold Ctrl or Alt while selecting.
- **Dependencies missing:** run `npm.cmd --prefix backend install` from the repository root.

## Production deployment and store release

The repository does not include a deployed production backend. Before distributing a public build:

1. Deploy the backend to a publicly reachable HTTPS service.
2. Configure `GEMINI_API_KEY` and `GEMINI_MODEL` as private hosting environment variables.
3. Add authentication or rate limiting, abuse protection, and usage monitoring. The current backend does not include those protections; an open endpoint can consume the operator's Gemini quota.
4. Check the deployed `/api/health`, `/api/pronunciation`, and `/api/meaning` endpoints.
5. In both `chrome/background.js` and `firefox/background.js`, change `DEFAULT_SETTINGS.backendUrl` to `https://<your-host>/api/pronunciation` and rebuild. Alternatively, set the URL in each installed extension's settings.
6. Replace the contact placeholder in [PRIVACY.md](PRIVACY.md), verify the policy against the deployed service, and publish it at a public URL.
7. Submit the Chrome ZIP to the Chrome Web Store and the Firefox ZIP to Mozilla Add-ons. Complete each store's permission, listing, privacy, and validation steps; approval is not guaranteed.

The backend sends uncached text to Gemini for generation. Do not send confidential text unless you trust the configured backend operator and provider. Review the provider's current terms and data handling before public release.

## Project documentation

- [Privacy policy draft](PRIVACY.md)
- [Product requirements](Requerment.md)
- [Spec-driven development index](specs/README.md)
- [Separate browser sources and build plan](specs/011-dual-browser-layout/spec.md)
- [Setup and documentation update record](specs/012-user-documentation/spec.md)
