# Setup and release guide

## Requirements

- Node.js 18 or later
- Chrome 91 or later, or Firefox 109 or later
- A Gemini API key for generated pronunciations and Bengali meanings

## Start the backend

From the repository root, install dependencies and create the local environment file:

```powershell
npm.cmd --prefix backend install
if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
```

If `backend/.env` already exists, keep it and edit it rather than replacing it. Set `GEMINI_API_KEY` in that file, then start the API:

```powershell
npm.cmd start
```

Check that it is running at <http://localhost:3000/api/health>. Keep the terminal open while using the extension. The built-in dictionary can return its covered pronunciations without a Gemini key; generated pronunciations and meanings need one.

Keep `backend/.env` private. Never put the key in extension source or commit it to GitHub. API availability, quotas, and charges depend on your Google project; check [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) and [key guidance](https://ai.google.dev/gemini-api/docs/api-key).

## Build and load the extensions

Build both browser versions from the repository root:

```powershell
npm.cmd run build
```

For Chrome, open `chrome://extensions`, enable **Developer mode**, and select **Load unpacked** → `dist/chrome-unpacked`.

For Firefox, open `about:debugging#/runtime/this-firefox`, select **Load Temporary Add-on...**, and choose `dist/firefox-unpacked/manifest.json`. Temporary add-ons are removed when Firefox restarts.

To try it, open `test_demo.html`, then hold Ctrl while selecting a word for pronunciation or Alt for meaning. Chrome may require **Allow access to file URLs** on the extension Details page to run on this local demo. Use the toolbar button to open settings and check the backend status.

Build outputs are written to `dist/` and are not committed. Package names and versions are generated from the browser manifests.

## Backend URL and API

The default endpoint is `http://localhost:3000/api/pronunciation`. In the extension toolbar settings, enter the full pronunciation endpoint and save it. The extension derives `/api/meaning` and `/api/health` from that URL. If you change the backend port, update the URL too. Clearing the extension cache also clears a custom backend URL.

`POST /api/pronunciation` and `POST /api/meaning` accept JSON with a non-empty `text` value of up to 500 characters:

```json
{ "text": "Authentication" }
```

The first returns a Bengali `pronunciation`; the second returns a Bengali `meaning`. `GET /api/health` reports service status, key configuration, model name, and cache size, but never the key.

## Troubleshooting

- **Backend offline:** run `npm.cmd start` and check `/api/health`.
- **Meaning lookup fails:** check `GEMINI_API_KEY` in `backend/.env`, then restart the backend.
- **No result on a page:** select English text of 500 characters or fewer while holding Ctrl or Alt.
- **No result for the local demo in Chrome:** allow file URL access in the extension Details page and reload the tab.
- **Port 3000 is busy:** stop the process using it or change `PORT` in `backend/.env` and update the extension endpoint.

Run backend smoke tests with `npm.cmd test`. They use port 3000, so stop the regular backend first.

## Public release checklist

The repository does not include a hosted backend. Before distributing a public build:

1. Deploy the backend to a public HTTPS service and configure its Gemini key privately.
2. Add authentication or rate limits and monitor usage; an open endpoint can use the operator's Gemini quota.
3. Set the deployed endpoint in the extension settings or update `DEFAULT_SETTINGS.backendUrl` in both browser background scripts and rebuild.
4. Replace the contact placeholder in `PRIVACY.md`, verify the policy against the deployed service, and publish it.
5. Submit the Chrome ZIP to the Chrome Web Store and the Firefox XPI to Mozilla Add-ons, following each store's current requirements.

Uncached text is sent from the backend to Gemini for generation. Do not send confidential text unless you trust the backend operator and provider.
