# English to Bangla Pronunciation for Chrome

Chrome Manifest V3 extension that shows Bengali-script pronunciations and meanings for selected English text.

## Features

- Hold **Ctrl** while selecting text for Bengali-script pronunciation.
- Hold **Alt** while selecting text for a Bengali meaning.
- Uses a local dictionary and browser cache before requesting the backend.
- Uses Chrome's native `chrome.*` extension APIs and an MV3 service worker.

## Chrome extension source

The complete, directly loadable extension source is in `chrome/`:

```text
chrome/
  manifest.json
  background.js
  content.js
  content.css
  icons/icon.svg
  options.html
  options.js
```

The manifest requires Chrome 91 or later.

## Load unpacked

1. Run `npm run build` from the repository root.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Select **Load unpacked** and choose `dist/chrome-unpacked`.
4. Open `test_demo.html`. Hold Ctrl to test pronunciation or Alt to test meaning.

## Backend setup

The extension defaults to `http://localhost:3000/api/pronunciation` for local development. Install and start the backend:

```powershell
npm --prefix backend install
Copy-Item backend/.env.example backend/.env
npm start
```

Set `GEMINI_API_KEY` in `backend/.env` for generated pronunciations and meanings outside the built-in dictionary. Keep the key private; it belongs on the backend and is never included in the extension.

For a public release, deploy the backend at an HTTPS address, configure the extension's backend URL in its options, and configure abuse protection, usage monitoring, and a public privacy policy before store submission. The repository does not include a deployed production backend.

## Build

```powershell
npm run build
```

This creates the Chrome Web Store ZIP and unpacked build in `dist/`. The source of both is `chrome/`.

## Development tracking

The Chrome-only branch implementation is specified in `specs/009-chrome-native/` and `specs/010-chrome-only-branch/`. `Requerment.md` contains product-level selection and display requirements.
