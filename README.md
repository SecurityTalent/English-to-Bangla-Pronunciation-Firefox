<p align="center">
  <img src="chrome/icons/icon.svg" width="96" alt="English to Bangla Pronunciation logo">
</p>

<h1 align="center">English to Bangla Pronunciation</h1>

<p align="center">Select an English word to see its Bengali pronunciation or meaning.</p>

<p align="center">
  <img src="docs/preview.svg" alt="Preview of the pronunciation result and extension settings">
</p>

## How it works

- Hold **Ctrl** and select English text for its Bengali pronunciation.
- Hold **Alt** and select English text for its Bengali meaning.
- Use the toolbar settings to check the backend, change its URL, or test a word.

Works with **Chrome** and **Firefox**. The browser extensions use a shared Node.js backend. A Gemini API key is needed for meaning lookups and pronunciations missing from the built-in dictionary.

## Get started

1. Install [Node.js 18 or later](https://nodejs.org/) and get a [Gemini API key](https://aistudio.google.com/apikey).
2. In the project folder, install backend dependencies and create your private settings file:

   ```powershell
   npm.cmd --prefix backend install
   if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
   ```

3. Add your key to `GEMINI_API_KEY` in `backend/.env`, then start the backend:

   ```powershell
   npm.cmd start
   ```

4. In another terminal, build both extensions:

   ```powershell
   npm.cmd run build
   ```

5. Install the extension in your browser:

   **Chrome**

   1. Open `chrome://extensions`.
   2. Turn on **Developer mode**.
   3. Click **Load unpacked** and select `dist/chrome-unpacked`.

   **Firefox**

   1. Open `about:debugging#/runtime/this-firefox`.
   2. Click **Load Temporary Add-on...**.
   3. Select `dist/firefox-unpacked/manifest.json`.

   Temporary Firefox add-ons are removed when Firefox restarts. The generated `.xpi` is unsigned; a regular Firefox release needs a Mozilla-signed add-on for permanent installation. See the [Setup guide](docs/setup.md) for more details.

For troubleshooting, API information, and release steps, see the [Setup guide](docs/setup.md). On macOS or Linux, use `npm` instead of `npm.cmd`.

## Privacy

Selected text is sent to the configured backend only when you trigger a lookup. The backend may send uncached text to Gemini. Read the [privacy policy](PRIVACY.md) before use. Never commit your API key.

## Project files

- [`chrome/`](chrome/) and [`firefox/`](firefox/) — browser extension source
- [`backend/`](backend/) — shared API
- [`docs/preview.html`](docs/preview.html) — openable interactive-style preview
- [`PRIVACY.md`](PRIVACY.md) — data flow and privacy policy draft
