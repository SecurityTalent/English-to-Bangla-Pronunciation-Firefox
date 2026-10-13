<div align="center">

# English to Bangla Pronunciation

Look up the Bangla pronunciation or meaning of selected English text in Chrome and Firefox.

[![Firefox Add-ons](https://img.shields.io/badge/Firefox-Mozilla%20Add--ons-FF7139?logo=firefoxbrowser&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/bangla-phonetic-pronunciation/)
[![Download Chrome](https://img.shields.io/badge/Download-Chrome%20package-4285F4?logo=googlechrome&logoColor=white)](https://github.com/SecurityTalent/English-to-Bangla-Pronunciation-Firefox/raw/refs/heads/main/dist/bangla-phonetic-pronunciation-chrome-v1.0.8.zip)
[![Firefox package](https://img.shields.io/badge/Firefox-package-FF7139?logo=firefoxbrowser&logoColor=white)](https://github.com/SecurityTalent/English-to-Bangla-Pronunciation-Firefox/raw/refs/heads/main/dist/bangla-phonetic-pronunciation-firefox-v1.0.6.zip)

<br>
<img src="docs/preview.svg" alt="Extension pronunciation badge and settings" width="760">
</div>

## How to use

> [!IMPORTANT]
> **Pronunciation:** Hold **Ctrl** while selecting English text.
>
> **Bangla meaning:** Hold **Alt** while selecting English text.
>
> You can select up to 500 characters at a time. The result appears beside your selection.

The published builds use the shared HTTPS API at `securitytalent-pronunciation-api.onrender.com`. You do not need Node.js or your own Gemini API key to use the published extension; the API operator manages the key.

> [!WARNING]
> This version relies on Render's **Free** hosting and Gemini API's free or quota-limited tier. Render puts a free service to sleep after 15 minutes without inbound traffic; the next request can take about a minute to wake it up. Free hosting and APIs may impose quotas and rate limits, restart, become temporarily unavailable, or change their terms or prices. Lookups may be slow or unavailable, and continuous service is not guaranteed. Render says Free instances are not for production applications. When a lookup is not in the backend cache, the selected text is sent to Gemini. Content submitted through Gemini's free tier may be used by Google to improve its products. The API key is kept private on the server, but abuse of the public shared API could exhaust the operator's Gemini quota or cause the service to be limited. Do not send sensitive text. See [Render's Free plan](https://render.com/docs/free) and [Gemini API pricing and data use](https://ai.google.dev/gemini-api/docs/pricing).

The public API allows **60 lookups per minute per IP** by default. Requests over the limit receive `429`; wait for the `Retry-After` interval before trying again. The limit is stored in server memory and resets when the server restarts.

## Install

1. Download the ZIP for your browser using a button above and extract it.

**Chrome**

1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select the extracted Chrome folder containing `manifest.json`.
3. If an older copy is installed, reload it or remove it after loading the new folder.

**Firefox**

Firefox 140 or newer is required. Firefox displays its data-consent prompt because selected webpage text is sent to the backend when you request a lookup.

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...** and select `manifest.json` in the extracted Firefox folder.
3. Firefox removes temporary add-ons when it restarts. Load the add-on again after a restart.

For a permanent installation, get the [Firefox version from Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/bangla-phonetic-pronunciation/). The downloadable Firefox ZIP/XPI is for testing; permanent Firefox releases require Mozilla signing.

### Check API availability

Open the [API health check](https://securitytalent-pronunciation-api.onrender.com/api/health). A response containing `"status":"ok"` means the backend is responding. The extension toolbar settings also show the connection status. A healthy server does not guarantee that lookups will succeed if Gemini quota or provider services are unavailable.

## API

Default pronunciation URL:

```text
https://securitytalent-pronunciation-api.onrender.com/api/pronunciation
```

If you change the full pronunciation URL in extension settings, the meaning and health URLs are derived from it.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Reports API health, whether a Gemini key is configured, the model, and cache size. It does not reveal the key. |
| `POST` | `/api/pronunciation` | Returns pronunciation in Bangla script. |
| `POST` | `/api/meaning` | Returns a concise Bangla meaning. |

Lookup request JSON: `{"text":"authentication"}`. Text cannot be empty or longer than 500 characters. Opening `/api/pronunciation` directly in a browser sends a GET request and may return 404; use `/api/health` to check availability.

## Run your own backend (optional)

For development or a private API, install [Node.js 18+](https://nodejs.org/) and get a Gemini key from [Google AI Studio](https://aistudio.google.com/apikey). Run these commands from the project root:

```powershell
npm.cmd --prefix backend install
if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
notepad backend/.env
```

Set `GEMINI_API_KEY=` in `backend/.env` to your key and save the file. Then run:

```powershell
npm.cmd start
```

Keep the terminal open while using the API. Set the extension's Backend URL to `http://localhost:3000/api/pronunciation`. Keep the key only in the backend's `.env` file; never add it to extension source or GitHub. On macOS/Linux, use `npm` instead of `npm.cmd`.

## Deploy your own API

1. Deploy `backend/` to a host that supports HTTPS.
2. Set `GEMINI_API_KEY` as a private environment variable on the host; never commit it to the repository.
3. Check `/api/health` and monitor Gemini usage and quota.
4. For larger or public use, add authentication or a shared/edge rate limiter. The current in-memory per-IP limit resets on restart and is not sufficient abuse protection by itself.
5. Set the new HTTPS `/api/pronunciation` URL in extension settings, or change `DEFAULT_SETTINGS.backendUrl` in both browser background scripts and build the packages again.
6. Update and publish the [privacy policy](PRIVACY.md) to reflect the actual hosting, logs, and retention practices.

Do not rely on free hosting for critical or production services. Hosts may sleep or restart services, impose bandwidth or compute quotas, experience outages, change terms or prices, or suspend accounts and services. Gemini's free quota is limited and can change; heavy or abusive use of a shared public API can quickly exhaust the operator's quota. Content submitted through Gemini's free tier may be used by Google to improve its products, so review current data-use terms before sending users' sensitive text. For reliable service, review current provider terms and plan for paid or always-on hosting, usage monitoring, and spending limits.

## Build from source

```powershell
npm.cmd run build
```

The build outputs browser ZIPs, unpacked folders, and an unsigned Firefox XPI in `dist/`. To run backend tests, stop any service using port 3000 and run `npm.cmd test`.

## Troubleshooting

- **API is slow or unavailable:** Check the [health endpoint](https://securitytalent-pronunciation-api.onrender.com/api/health). The first lookup after a quiet period may be slow on Render Free.
- **Gemini key is missing:** Contact the operator of the published API. For your own backend, set the key in `backend/.env` and restart it.
- **No result appears:** Select English text while holding Ctrl or Alt; keep it within 500 characters. Retry later if the API reports an error or quota limit.
- **Chrome shows old code:** Reload the extension from the new folder and refresh the webpage.
- **Chrome local demo:** Enable **Allow access to file URLs** on the extension's Details page, then reload the demo tab.

## Privacy

When you request a lookup, the selected text (up to 500 characters) is sent to the configured backend. Text not found in the cache may also be sent to Gemini. Do not send confidential or sensitive text to a backend you do not trust. Read the [privacy policy](PRIVACY.md) for details.

## Project layout

- `chrome/` — Chrome extension source
- `firefox/` — Firefox extension source
- `backend/` — Node.js API
- `dist/` — built downloads and unpacked packages
- `docs/setup.md` — setup, API, and release guide
- `PRIVACY.md` — privacy policy
- `Requerment.md` — product requirements and acceptance criteria
