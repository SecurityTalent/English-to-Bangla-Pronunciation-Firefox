# English-to-Bangla-Pronunciation-Firefox

A Firefox extension that shows a Bengali phonetic pronunciation below English text selected while holding **Ctrl**. It transliterates pronunciation; it does not translate meaning.

**Suggested GitHub repository:** `english-to-bangla-pronunciation-firefox`

## Features

- Trigger pronunciation with Ctrl + text selection; ordinary selection remains unaffected.
- Show a temporary badge near the selected text, below it where possible and above it when the viewport has insufficient space.
- Dismiss the badge when the selection is cleared, another selection is made without Ctrl, or Escape is pressed.
- Preserve browser shortcuts. The extension does not call `preventDefault()` for Ctrl+C, Ctrl+A, Ctrl+F, Ctrl+V, Ctrl+Z, or Ctrl+X.
- Debounce selection processing by 120 ms and avoid duplicate requests.
- Cache results in the extension and backend; common dictionary entries work without Gemini.
- Isolate the badge styles with Shadow DOM.

## Architecture

```text
Firefox content script
        ↓ runtime message
Firefox background script
        ↓ POST /api/pronunciation
Node.js / Express backend
        ↓ on cache miss
Google Gemini API
```

The extension never calls Gemini directly. The backend owns the Gemini API key.

## Repository layout

```text
backend/                 Express API, dictionary, and backend smoke test
icons/                   Extension icons
specs/                   Spec-Driven Development specifications and task tracking
background.js            Cache, settings, and backend requests
content.js               Ctrl-selection detection and result badge
manifest.json            Firefox Manifest V3 configuration
options.html / options.js Settings, health check, and quick test UI
build_extension.js       ZIP/XPI packaging script
PRIVACY.md               Privacy policy draft; customize before publication
Requerment.md            Product requirements
README.md                Setup and publishing guide
```

## Requirements

- Node.js 18 or newer
- Firefox for local extension testing
- A Gemini API key for pronunciations not covered by the built-in dictionary

## Local setup

Run these commands from the repository root in PowerShell:

```powershell
npm --prefix backend install
Copy-Item backend/.env.example backend/.env
```

Edit `backend/.env` and set the key and model:

```env
GEMINI_API_KEY=your_real_key_here
PORT=3000
GEMINI_MODEL=gemini-3.5-flash-lite
```

Never commit `backend/.env` or publish the API key. `.gitignore` excludes environment files, dependencies, and generated ZIP/XPI packages.

Root scripts:

```powershell
npm start       # Start the local backend at http://localhost:3000
npm test        # Run the backend dictionary smoke checks
npm run build   # Build ZIP and XPI packages under dist/
```

The test script uses port 3000. Stop any already-running backend before running it.

## Load the extension for local testing

1. In Firefox, open `about:debugging#/runtime/this-firefox`.
2. Choose **Load Temporary Add-on...**.
3. Select the repository's `manifest.json`.
4. Open `test_demo.html` in Firefox, hold Ctrl, and select a word such as “Authentication”.
5. Release the mouse. The pronunciation badge should appear. Press Escape or clear the selection to dismiss it.

Temporary add-ons are removed when Firefox restarts. Use an AMO-signed version for permanent installation.

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

The backend rejects empty text and text longer than 500 characters. `GET /api/health` reports service status, model name, API-key configuration status, and in-memory cache size.

## Production deployment

The default backend URL is `http://localhost:3000/api/pronunciation`, which only works on the developer's own computer. An AMO-distributed extension needs a public HTTPS backend.

For a Render Web Service, connect the repository and configure:

- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment variables:** `GEMINI_API_KEY`, `GEMINI_MODEL`

After deployment, set the public HTTPS endpoint in the extension's backend URL setting. Before publishing a release, update `DEFAULT_SETTINGS.backendUrl` in `background.js` to that endpoint, increment `manifest.json`'s version, and build a new package.

Render Free services sleep after 15 minutes without traffic and may take about a minute to wake. Render says its Free instances are for hobby/testing use, not production applications. Choose production-suitable hosting for a public release and monitor usage and API spend. See [Render's free-plan limits](https://render.com/docs/free).

The backend API currently has no authentication or rate limiting. Do not expose it to public traffic until request abuse controls and usage monitoring are in place; otherwise other people could consume the operator's Gemini quota.

## Privacy and data flow

When Ctrl-selection is used, the selected text (up to 500 characters) is sent to the configured backend. On a cache miss, the backend sends it to Gemini. Pronunciation cache entries and the backend URL are stored in Firefox extension storage; the backend also keeps a temporary in-memory cache. The extension does not implement accounts, analytics, or advertising.

Before AMO submission, verify the deployed service's actual data handling, replace the contact placeholder in [PRIVACY.md](PRIVACY.md), and publish the policy at a public URL. Disclose the text transfer and any hosting/provider retention accurately in the AMO listing.

## Build and submit to AMO

Build the package from the repository root:

```powershell
npm run build
```

The script creates versioned `.zip` and `.xpi` files under `dist/`. Upload the ZIP to the [AMO Developer Hub](https://addons.mozilla.org/developers/): choose **Submit a New Add-on**, select **On this site** for a public listing, upload the ZIP, review validator results, then complete the listing details and privacy information. AMO validation and review results are not guaranteed; fix reported errors before submission. See Mozilla's [submission guide](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/).

The ZIP/XPI files are deliberately excluded from GitHub. Build them locally or attach a release package through GitHub Releases.

## Publish the source to GitHub

For this project the repository name is `english-to-bangla-pronunciation-firefox`. For an existing clone, publish updates with:

```powershell
git add .
git status --short
git commit -m "Describe the change"
git push
```

Review `git status --short` before committing. Do not add environment files, API keys, `node_modules`, or generated packages.

## Spec-Driven Development

Project work is tracked under `specs/`. Each change may contain a `spec.md` (problem and acceptance criteria), `plan.md` (design and implementation sequence), and `tasks.md` (progress and verification log). Keep `Requerment.md` as the product-level requirements source and update the relevant task tracker when behavior changes.

## Troubleshooting

- **Backend offline:** for local development, run `npm start` from the repository root. For a published extension, configure a reachable HTTPS backend instead of localhost.
- **API key needed:** add a valid `GEMINI_API_KEY` to the local `.env` or the host's environment variables, then restart/redeploy the backend.
- **Unexpected result:** check the selected text is English and no longer than 500 characters. Built-in dictionary entries can work without a configured Gemini key.
- **Browser shortcuts:** the extension does not cancel browser shortcuts. Ctrl+C, Ctrl+V, and Ctrl+A should work normally.
