# Product Requirements — English-to-Bangla Pronunciation Firefox Extension

## Purpose

When a user holds Ctrl and selects English text in Firefox, show a Bengali-script phonetic pronunciation near the selected text. The feature transliterates pronunciation; it must not translate meaning.

Examples:

```text
Authentication       → অথেন্টিকেশন
Vulnerability         → ভালনারেবিলিটি
Prototype Pollution   → প্রোটোটাইপ পলিউশন
```

## Selection behavior

- Trigger only when Ctrl was held during mouse text selection.
- Ordinary text selection must not request a pronunciation.
- Do not rely only on `selectionchange`; track key and mouse state because Ctrl may be released before mouseup.
- Do not block or modify browser shortcuts. In particular, never call `preventDefault()` for Ctrl+C, Ctrl+A, Ctrl+F, Ctrl+V, Ctrl+Z, or Ctrl+X.
- Process a non-empty selection only. Trim surrounding whitespace and reject selections longer than 500 characters.
- Require at least one English letter before requesting a pronunciation.
- Debounce selection processing by 120 ms and prevent duplicate requests for the same active selection.

## Result presentation

- Show only the Bengali pronunciation in a small inline-looking badge associated with the selection; do not create a browser popup window.
- Use `Range.getBoundingClientRect()` to locate the selected text.
- Place the result below the selection when possible, otherwise above it. Keep the result within the viewport and visually connected to the selection.
- Isolate the result styling from page styles with Shadow DOM.
- Remove the result when the selection is cleared, a new ordinary selection is made, the user clicks elsewhere, or Escape is pressed.
- If a result is dismissed while a request is pending, a late response must not restore the badge.
- Do not add copy, listen, close, or context-menu controls.

## API and pronunciation rules

- The extension must not call Gemini directly. It sends requests through the configured backend.
- Backend endpoint: `POST /api/pronunciation`.
- Request body: `{ "text": "Authentication" }`.
- Successful response includes a Bengali-script `pronunciation` string.
- Empty text and text over 500 characters must be rejected without calling Gemini.
- Instruct Gemini to return only Bengali phonetic pronunciation: no translation, explanation, IPA, or English text.
- The Gemini API key belongs only on the backend, never in the extension package.
- The local-development default may use `http://localhost:3000/api/pronunciation`; any public release must configure a public HTTPS backend.

## Cache and request handling

- Check the built-in pronunciation dictionary before making a backend request.
- Cache successful results in the extension and backend to reduce repeat API requests.
- Do not send duplicate requests for the same active selection.
- A stale response must not replace or recreate a result for a newer/dismissed selection.
- Provide a clear-cache action in settings.

## Settings and health status

- Provide backend URL configuration, a backend health check, a quick pronunciation test, and a clear-cache action in the toolbar UI.
- Health status may report whether a Gemini key is configured, the model name, and backend cache size; it must not reveal the key itself.
- Report offline, missing-key, and request errors in a readable way.

## Privacy and deployment

- Tell users that selected text (up to 500 characters) is sent to the configured backend and may be sent to Gemini on a cache miss.
- Keep the backend API key secret in the backend host's environment configuration.
- Before public production use, add request abuse controls and monitor usage so an unauthenticated public endpoint cannot freely consume the operator's Gemini quota.
- Publish an accurate privacy policy describing the deployed service, data flow, retention, and operator contact.

## Acceptance criteria

1. Ctrl + selection of valid English text displays a Bengali phonetic result after the short debounce.
2. Ordinary selection does not issue a request and dismisses any previous result.
3. Clearing the selection or pressing Escape dismisses the result.
4. A late response cannot recreate a dismissed result.
5. Empty, non-English-only, and over-limit selections do not call the backend.
6. Browser shortcuts continue to work.
7. Cached dictionary/API results are reused.
8. Public release packages point to an HTTPS backend and do not contain API keys or local environment files.
