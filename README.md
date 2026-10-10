<div align="center">

# English to Bangla Pronunciation

Select English text to see its Bengali pronunciation or meaning in Chrome or Firefox.

[![Download Chrome](https://img.shields.io/badge/Download-Chrome%20package-4285F4?logo=googlechrome&logoColor=white)](https://github.com/SecurityTalent/English-to-Bangla-Pronunciation-Firefox/raw/refs/heads/main/dist/bangla-phonetic-pronunciation-chrome-v1.0.5.zip)
[![Download Firefox](https://img.shields.io/badge/Download-Firefox%20package-FF7139?logo=firefoxbrowser&logoColor=white)](https://github.com/SecurityTalent/English-to-Bangla-Pronunciation-Firefox/raw/refs/heads/main/dist/bangla-phonetic-pronunciation-firefox-v1.0.3.zip)

<br>

<img src="docs/preview.svg" alt="Extension pronunciation badge and settings preview" width="760">

</div>

## Use the extension

> [!IMPORTANT]
> **Pronunciation:** Hold **Ctrl** while selecting English text.
>
> **Bengali meaning:** Hold **Alt** while selecting English text.
>
> Select up to 500 characters. The result appears beside your selection.

The published extensions use the shared HTTPS API at `securitytalent-pronunciation-api.onrender.com`. You do not need to install Node.js or create a Gemini API key to use them. The API operator manages the key.

> [!NOTE]
> The shared API runs on Render's Free web service. After 15 minutes without traffic, Render spins it down; the first request after that can take about a minute to wake up. The pronunciation or meaning lookup may therefore appear slow after a quiet period. Render says Free instances are intended for testing, hobby projects, and previews, not production applications. See [Render's Free plan details](https://render.com/docs/free).

## Install and get started

1. Download the package for your browser using one of the buttons above.
2. Extract the downloaded ZIP file.

**Chrome**

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select the extracted Chrome package folder containing `manifest.json`.
4. If an older copy is installed, reload or remove it before loading the new folder.

**Firefox**

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...** and select `manifest.json` inside the extracted Firefox package folder.
3. Firefox removes temporary add-ons when it restarts, so load it again after restarting.

The Firefox ZIP is for temporary installation and testing. A permanent Firefox release must be signed by Mozilla.

### Check that the API is online

Open the [API health check](https://securitytalent-pronunciation-api.onrender.com/api/health). A JSON response containing `"status":"ok"` means the backend is online. The extension toolbar settings also show the connection status.

## API setup

The extension's default backend URL is:

```text
https://securitytalent-pronunciation-api.onrender.com/api/pronunciation
```

The extension uses this URL for pronunciation and derives the meaning and health-check URLs from it. To change the backend, click the extension toolbar icon, enter the full pronunciation URL, and save it.

The backend provides these endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check whether the API is online and whether a Gemini key is configured. |
| `POST` | `/api/pronunciation` | Get a Bengali-script pronunciation. |
| `POST` | `/api/meaning` | Get a Bengali meaning. |

Pronunciation and meaning endpoints require JSON with English text up to 500 characters:

```json
{"text":"authentication"}
```

Opening `/api/pronunciation` directly in a browser sends a GET request and returns 404. That is expected; lookup requests must use POST. The API health URL is the one to open for a browser check.

## Run your own backend (optional)

You only need this section to develop the project or use a private/local API. Install [Node.js 18 or newer](https://nodejs.org/) and create a Gemini key in [Google AI Studio](https://aistudio.google.com/apikey). From the project folder, run:

```powershell
npm.cmd --prefix backend install
if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
notepad backend/.env
```

In Notepad, set `GEMINI_API_KEY=` to your private key, save the file, and close Notepad. Then start the local API:

```powershell
npm.cmd start
```

Keep the terminal open while using the local API. In extension settings, change **Backend URL** to `http://localhost:3000/api/pronunciation`. The Gemini key belongs only in `backend/.env`; never add it to extension source or GitHub. On macOS/Linux, use `npm` instead of `npm.cmd`.

## Deploy your own API

The default API is operated at the Render address above; this repository itself does not host the backend. To run a separate public service:

1. Deploy the `backend/` Node.js service with HTTPS.
2. Add `GEMINI_API_KEY` as a private environment variable on the host. Never commit it.
3. Verify the deployed `/api/health` endpoint.
4. Protect a public API with suitable rate limits or authentication and monitor Gemini usage.
5. Set your HTTPS `/api/pronunciation` URL in extension settings, or update `DEFAULT_SETTINGS.backendUrl` in both browser background scripts and rebuild.
6. Review and publish [PRIVACY.md](PRIVACY.md) for the actual service and its data handling.

## Build from source

From the project folder, run:

```powershell
npm.cmd run build
```

Builds appear in `dist/`: browser ZIPs, unpacked folders, and an unsigned Firefox XPI. The current packages are checked into GitHub so the download buttons above work. To run backend tests, stop any service already using port 3000 and run `npm.cmd test`.

## Troubleshooting

- **API offline:** check the [hosted API health endpoint](https://securitytalent-pronunciation-api.onrender.com/api/health). If using a local API, keep its terminal open and check `http://localhost:3000/api/health`.
- **Gemini key missing:** this is configured by the API operator. If you run your own backend, set `GEMINI_API_KEY` in `backend/.env` and restart it.
- **Chrome shows an old content script:** reload the extension from the newly extracted folder, then refresh the website tab.
- **No result appears:** select English text while holding Ctrl or Alt; the selection must be 500 characters or fewer.
- **Chrome on the local demo page:** open the extension's Details page, enable **Allow access to file URLs**, and reload the demo tab.

## Privacy

Selected text is sent to the configured backend only when you request a lookup. The backend may send uncached text to Google Gemini. Read [PRIVACY.md](PRIVACY.md) before use. Do not send confidential text to a backend you do not trust.

## Project layout

- `chrome/` — Chrome extension source
- `firefox/` — Firefox extension source
- `backend/` — shared Node.js API
- `dist/` — built downloads and unpacked browser packages
- `docs/setup.md` — additional setup and release details
- `PRIVACY.md` — privacy policy
