# English to Bangla Pronunciation for Firefox

A Firefox extension that displays the Bengali phonetic pronunciation of English text selected while holding **Ctrl**. It provides pronunciation in Bengali script; it does not translate meaning.

## Features

- Trigger pronunciation with Ctrl + text selection.
- Display a temporary result next to the selection, positioning it above when there is not enough room below.
- Dismiss the result when the selection is cleared, a normal selection is made, or Escape is pressed.
- Preserve browser shortcuts such as Ctrl+C, Ctrl+A, Ctrl+F, Ctrl+V, Ctrl+Z, and Ctrl+X.
- Debounce selection handling by 120 ms and avoid duplicate requests.
- Reuse cached results and provide a built-in dictionary for common terms.
- Isolate result styling from the page with Shadow DOM.

## How it works

```text
Firefox content script
        ↓ runtime message
Firefox background script
        ↓ POST /api/pronunciation
Node.js / Express backend
        ↓ on cache miss
Google Gemini API
```

The extension does not call Gemini directly. The Gemini API key is configured on the backend and must never be placed in the extension package.

## Project structure

```text
backend/                 Express API, pronunciation dictionary, and smoke test
icons/                   Extension icons
specs/                   Spec-Driven Development records
background.js            Settings, cache, and backend requests
content.js               Selection tracking and pronunciation badge
manifest.json            Firefox Manifest V3 configuration
options.html / options.js Settings, health check, and quick test UI
build_extension.js       ZIP/XPI packaging script
PRIVACY.md               Privacy policy draft
Requerment.md            Product requirements
```

## Requirements

- Node.js 18 or newer
- Firefox for extension testing
- A Gemini API key for text that is not covered by the built-in dictionary

## Local setup

From the project root, install the backend dependencies and create a local environment file:

```powershell
npm --prefix backend install
Copy-Item backend/.env.example backend/.env
```

If `backend/.env` already exists, keep it and edit it instead of copying the template again. Set the API key and model in that file:

```env
GEMINI_API_KEY=your_real_key_here
PORT=3000
GEMINI_MODEL=gemini-3.5-flash-lite
```

Keep `backend/.env` private. The repository ignores environment files, dependencies, and generated ZIP/XPI packages.

Available root commands:

```powershell
npm start       # Start the backend at http://localhost:3000
npm test        # Run the backend dictionary smoke checks
npm run build   # Create versioned ZIP and XPI files under dist/
```

The backend smoke test uses port 3000. Stop any running backend before starting the test.

## Test the extension in Firefox

1. Open `about:debugging#/runtime/this-firefox` in Firefox.
2. Select **Load Temporary Add-on...**.
3. Choose the project's `manifest.json` file.
4. Open `test_demo.html`, hold Ctrl, and select an English word such as “Authentication”.
5. Release the mouse to see the pronunciation. Press Escape or clear the selection to dismiss it.

Temporary add-ons are removed when Firefox restarts. Use an AMO-signed version for a persistent installation.

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

The endpoint rejects empty text and input longer than 500 characters. `GET /api/health` reports service status, the configured model, whether an API key is configured, and the in-memory cache size. It never returns the key itself.

## Production deployment

The development default is `http://localhost:3000/api/pronunciation`; it only works on the computer running the backend. A public extension release requires a reachable HTTPS backend.

For a Render Web Service, connect the source repository and set:

- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment variables:** `GEMINI_API_KEY`, `GEMINI_MODEL`

After deployment, update `DEFAULT_SETTINGS.backendUrl` in `background.js` to the public HTTPS endpoint, increment the version in `manifest.json`, and build a new package. Test the deployed health and pronunciation endpoints before submitting the extension.

Do not use Render Free for a production release: free services sleep after inactivity and can take about a minute to wake. Render describes its Free instances as suitable for hobby projects and testing, not production applications. Review [Render's current free-plan limits](https://render.com/docs/free) or use production-suitable hosting.

The backend currently has no authentication or rate limiting. Add abuse controls and usage monitoring before exposing it publicly; otherwise, others may consume the backend operator's Gemini quota.

## Privacy

When the user selects text with Ctrl, the extension sends the selected text (up to 500 characters) to the configured backend. On a cache miss, the backend sends the text to Gemini. Pronunciations and the configured backend URL are cached in Firefox extension storage; the backend also keeps a temporary in-memory cache.

Before publication, verify the deployed service's data handling, replace the contact placeholder in [PRIVACY.md](PRIVACY.md), and publish the policy at a public URL. The AMO listing must accurately describe the text transfer and any retention by the hosting provider or API provider.

## Build and publish to AMO

Build the package from the project root:

```powershell
npm run build
```

The script creates versioned `.zip` and `.xpi` files in `dist/`. Upload the ZIP through the [AMO Developer Hub](https://addons.mozilla.org/developers/), choose **Submit a New Add-on** and **On this site**, then review the validator results and complete the listing and privacy information. Fix validation errors before submission. Mozilla's [submission guide](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/) has the current steps.

AMO validation and review are not guaranteed. The generated packages are excluded from GitHub; build them locally or attach them to a GitHub Release.

## Spec-Driven Development

Specifications, implementation plans, and task tracking are maintained under `specs/`. Keep `Requerment.md` as the product-level requirements source and update the relevant task list as implementation changes.

## Troubleshooting

- **Backend offline:** run `npm start` from the project root for local development. A published extension needs a reachable HTTPS backend rather than `localhost`.
- **API key required:** set a valid `GEMINI_API_KEY` in `backend/.env` locally or in the hosting provider's environment settings, then restart the backend.
- **No result:** select English text of 500 characters or fewer while holding Ctrl. Common built-in dictionary entries can work without the Gemini API key.
- **Browser shortcuts:** the extension does not cancel shortcuts; Ctrl+C, Ctrl+V, and Ctrl+A should work normally.
