# Setup, API, and release guide

This guide expands on the beginner setup in the [README](../README.md). It covers local API use, deployment settings, and browser release notes.

## Requirements

- Node.js 18 or later
- Chrome 91 or later, or Firefox 109 or later
- A Gemini API key for generated pronunciations and Bengali meanings

## Configure the Gemini API

1. Create a key in [Google AI Studio](https://aistudio.google.com/apikey).
2. From the repository root, install backend packages and create a local environment file if one does not exist:

   ```powershell
   npm.cmd --prefix backend install
   if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
   notepad backend/.env
   ```

3. Set `GEMINI_API_KEY=...` in `backend/.env`. Optionally set `PORT` or `GEMINI_MODEL`.
4. Start the backend:

   ```powershell
   npm.cmd start
   ```

5. Check <http://localhost:3000/api/health>. The response should contain `"status":"ok"` and `"hasApiKey":true`.

Keep the terminal running while using the extension. The API key must stay on the backend and must never be added to extension files or Git. Google controls Gemini API availability, quotas, and pricing; review its [API key guidance](https://ai.google.dev/gemini-api/docs/api-key) and [pricing](https://ai.google.dev/gemini-api/docs/pricing).

## API reference

All POST requests accept JSON with a non-empty `text` value no longer than 500 characters.

### `POST /api/pronunciation`

Request:

```json
{"text":"authentication"}
```

Successful response:

```json
{"pronunciation":"অথেন্টিকেশন","source":"cache"}
```

### `POST /api/meaning`

Uses the same request shape and returns a Bengali `meaning` field.

### `GET /api/health`

Returns service status, whether an API key is configured, the model name, and the number of cached entries. It never returns the key itself.

The extension's backend setting should be the full pronunciation URL, for example `http://localhost:3000/api/pronunciation`. It derives the meaning and health URLs from this value. After changing the backend port or domain, open the extension toolbar settings, enter the new full URL, and save it.

## Build and install

Build both browser packages from the project root:

```powershell
npm.cmd run build
```

Builds appear in `dist/`: browser ZIPs, unpacked directories, and an unsigned Firefox XPI. The current ZIP/XPI packages are checked into `dist/` so they can be downloaded from GitHub.

- **Chrome local install:** open `chrome://extensions`, enable Developer mode, click **Load unpacked**, and choose `dist/chrome-unpacked`.
- **Firefox temporary install:** open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on...**, and choose `dist/firefox-unpacked/manifest.json`. Firefox removes temporary add-ons after restart.
- **Local demo:** open `test_demo.html`. Chrome may require **Allow access to file URLs** in the extension's Details page.

The Firefox XPI is unsigned. A permanent Firefox release must be signed through Mozilla Add-ons. The Chrome ZIP is for unpacked installation or submission to the Chrome Web Store; it is not a signed Chrome Web Store release.

## Public deployment checklist

The repository does not host the backend. Before distributing an extension to public users:

1. Deploy `backend/` to a Node.js host with HTTPS.
2. Add `GEMINI_API_KEY` as a private environment variable on that host. Set the port as required by the host.
3. Verify the public `/api/health` endpoint.
4. Protect the service with appropriate rate limiting or authentication. An unprotected public endpoint can consume the operator's Gemini quota.
5. Change the default backend URL in both `chrome/background.js` and `firefox/background.js` to the public HTTPS pronunciation endpoint, then rebuild. Alternatively, ask each user to enter the endpoint in extension settings.
6. Replace the support contact placeholder in `PRIVACY.md`, verify the policy against the deployed service and hosting logs, and publish it at a public URL.
7. Submit the Chrome extension to the Chrome Web Store and the Firefox extension to Mozilla Add-ons for review and signing.

Do not describe the project as production-hosted until the backend and privacy policy are actually deployed. Uncached selected text is sent to Gemini; users should not submit confidential text to an operator they do not trust.

## Troubleshooting

- **Backend offline:** run `npm.cmd start` and check `/api/health`.
- **Key missing:** verify `GEMINI_API_KEY` in `backend/.env`, save it, and restart the backend.
- **Port 3000 busy:** stop the other service or change `PORT` and the extension's backend URL.
- **Chrome shows an old script:** reload the extension from the current folder and refresh the page.
- **Chrome cannot run on the local demo:** allow file URL access in the extension's Details page.
- **Backend test cannot bind:** tests use port 3000; stop any backend already using it, then run `npm.cmd test`.
