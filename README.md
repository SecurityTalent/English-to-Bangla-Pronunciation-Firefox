# English to Bangla Pronunciation

Browser extensions for Bengali-script pronunciations and meanings of selected English text. Chrome and Firefox implementations live in separate directories and are built independently.

## Features

- Hold **Ctrl** while selecting text for Bengali-script pronunciation.
- Hold **Alt** while selecting text for a Bengali meaning.
- Uses a local dictionary and browser cache before requesting the backend.
- Chrome uses its MV3 service worker and `chrome.*` APIs. Firefox uses its own manifest and Firefox-compatible background implementation.

## Separate browser source

```text
chrome/                  Complete Chrome extension source (Chrome 91+)
firefox/                 Complete Firefox extension source
backend/                 Shared pronunciation and meaning API
specs/                   Product and implementation tracking
```

The browser source trees have separate manifests, scripts, options pages, and icons. Install or package each from its own build output; do not mix files between them.

## Load unpacked for development

Build both versions first:

```powershell
npm.cmd run build
```

- **Chrome:** open `chrome://extensions`, enable **Developer mode**, select **Load unpacked**, then choose `dist/chrome-unpacked`.
- **Firefox:** open `about:debugging#/runtime/this-firefox`, select **Load Temporary Add-on...**, then choose `dist/firefox-unpacked/manifest.json`.
- Open `test_demo.html`; hold Ctrl to test pronunciation or Alt to test meaning.

## Backend setup

The extension defaults to `http://localhost:3000/api/pronunciation` for local development. Install and start the shared backend:

```powershell
npm --prefix backend install
Copy-Item backend/.env.example backend/.env
npm start
```

Set `GEMINI_API_KEY` in `backend/.env` for generated pronunciations and meanings outside the built-in dictionary. Keep the key private; it belongs on the backend and is never included in either extension.

For public releases, deploy the backend at an HTTPS address, configure the backend URL in each extension, and set up abuse protection, usage monitoring, and a public privacy policy before store submission. The repository does not include a deployed production backend.

## Build and release

```powershell
npm.cmd run build
```

This creates separate Chrome and Firefox ZIPs and unpacked directories under `dist/`, plus a Firefox XPI. Upload the Chrome ZIP to the Chrome Web Store and the Firefox ZIP to Mozilla Add-ons after reviewing each store's permissions, validation, listing, and privacy requirements.

## Project tracking

Browser-specific source separation and build behavior are tracked in `specs/011-dual-browser-layout/`; Chrome API implementation details are in `specs/009-chrome-native/`.
