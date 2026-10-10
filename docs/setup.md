# API, setup, and release guide

See the [README](../README.md) for simple install steps. The published Chrome and Firefox builds are preconfigured to use the shared HTTPS API:

```text
https://securitytalent-pronunciation-api.onrender.com/api/pronunciation
```

You do not need Node.js or your own Gemini API key to use those builds. Check the service at [API health](https://securitytalent-pronunciation-api.onrender.com/api/health); the response should contain `"status":"ok"`.

## Render Free plan behavior

The shared API currently runs as a Render Free web service. Render spins a Free service down after 15 minutes without inbound traffic. A request wakes it, and startup takes about one minute, so the first lookup after an idle period can be slow. Render describes Free instances as suitable for testing, hobby projects, and previews, and says not to use them for production applications. See [Render's official Free plan documentation](https://render.com/docs/free).

If the Mozilla Add-ons release needs consistent response times, move the API to an always-on paid service before promoting it as production-ready. The extension default can remain this Render URL for the current update; to change providers later, set a different URL in extension settings or rebuild both packages with the new endpoint.

The public backend now limits each client IP to 60 lookup requests per minute by default. Excess requests receive HTTP `429` and a `Retry-After` header. Configure `API_RATE_LIMIT_PER_MINUTE` in the service environment to adjust this limit. This in-memory protection resets after service restarts and is not a substitute for a shared limiter or authentication at larger scale.

## Run your own backend

For private use or development, install Node.js 18 or later and create a Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey). From the repository root, install backend dependencies and create a local settings file if needed:

```powershell
npm.cmd --prefix backend install
if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
notepad backend/.env
```

Set `GEMINI_API_KEY=...` in `backend/.env`, save it, then start the local service:

```powershell
npm.cmd start
```

Keep the terminal open while using it. Check <http://localhost:3000/api/health>; expect `"status":"ok"` and `"hasApiKey":true`. In extension settings, set Backend URL to `http://localhost:3000/api/pronunciation`. Keep the API key on the backend and out of extension files/Git. Google controls Gemini API availability, quotas, and pricing; see its [key guidance](https://ai.google.dev/gemini-api/docs/api-key) and [pricing](https://ai.google.dev/gemini-api/docs/pricing).

On macOS/Linux, use `npm` instead of `npm.cmd`.

## API reference

All lookup requests are POST requests. They accept JSON with a non-empty `text` value no longer than 500 characters.

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

Returns service status, whether a Gemini API key is configured, model name, and cache size. It never returns the key.

Opening `/api/pronunciation` directly in a browser sends GET and returns 404. This is expected because that route accepts POST only. Use `/api/health` for a browser-based availability check.

The extension setting is the full pronunciation endpoint. It derives the meaning and health URLs from that value. For another hosted API, enter its HTTPS `/api/pronunciation` URL in the extension settings.

## Build and install

From the repository root:

```powershell
npm.cmd run build
```

Build output goes into `dist/`: ZIP downloads, unpacked browser folders, and an unsigned Firefox XPI. Current output is checked into GitHub.

- **Chrome:** open `chrome://extensions`, turn on Developer mode, choose **Load unpacked**, and select `dist/chrome-unpacked`.
- **Firefox:** open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on...**, and select `dist/firefox-unpacked/manifest.json`. Firefox removes temporary add-ons after restart.
- **Local demo:** open `test_demo.html`. Chrome may require **Allow access to file URLs** in the extension's Details page.

The Firefox XPI is unsigned and for temporary testing; a permanent Firefox release must be signed by Mozilla. The Chrome ZIP is for unpacked installation or Chrome Web Store submission, not a signed Web Store release.

## Operate a public backend

The default API is hosted at the Render URL shown at the top of this guide. If you operate your own public API:

1. Deploy `backend/` with HTTPS and configure `GEMINI_API_KEY` as a private host environment variable.
2. Confirm `/api/health` is healthy.
3. Add appropriate authentication or rate limits and monitor Gemini quota/usage; an open endpoint can consume the operator's API quota.
4. Enter the new HTTPS `/api/pronunciation` URL in extension settings. To bake it into packages, update `DEFAULT_SETTINGS.backendUrl` in both `chrome/background.js` and `firefox/background.js`, then rebuild.
5. Review [PRIVACY.md](../PRIVACY.md) against the actual service, logs, retention, and contact details; publish it at a public URL.

The extension sends selected text only when a user triggers a lookup. Uncached text is sent to Gemini by the backend. Do not send confidential text to a service operator you do not trust.

## Troubleshooting

- **API health page reports an error:** check the Render service logs and confirm the service is live.
- **`GET /api/pronunciation` returns 404:** expected; use `GET /api/health` in a browser. Pronunciation is `POST /api/pronunciation`.
- **Local API offline:** run `npm.cmd start` and check `http://localhost:3000/api/health`.
- **Local API key missing:** check `GEMINI_API_KEY` in `backend/.env` and restart the backend.
- **Port 3000 busy:** stop the other service or change `PORT` and set the matching URL in extension settings.
- **Chrome still runs old code:** reload the extension and refresh the page.
- **Backend test cannot bind:** tests use port 3000; stop a local backend before running `npm.cmd test`.
