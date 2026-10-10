# Product Requirements — English-to-Bangla Pronunciation Extensions

## Purpose

When a user holds Ctrl and selects English text in Chrome or Firefox, show a Bengali-script phonetic pronunciation near the selected text. When the user holds Alt and selects English text, show its Bengali meaning. These are separate actions and must never be confused.

Examples:

```text
Authentication       → অথেন্টিকেশন
Vulnerability         → ভালনারেবিলিটি
Prototype Pollution   → প্রোটোটাইপ পলিউশন
```

## Selection behavior

- Trigger only when Ctrl was held during mouse text selection.
- Trigger a Bengali meaning lookup only when Alt was held during mouse text selection.
- If Ctrl and Alt are held together, do not trigger a lookup.
- Ordinary text selection must not request a pronunciation.
- Do not rely only on `selectionchange`; track key and mouse state because Ctrl may be released before mouseup.
- Do not block or modify browser shortcuts. In particular, never call `preventDefault()` for Ctrl+C, Ctrl+A, Ctrl+F, Ctrl+V, Ctrl+Z, or Ctrl+X.
- Process a non-empty selection only. Trim surrounding whitespace and reject selections longer than 500 characters.
- Require at least one English letter before requesting a pronunciation.
- Debounce selection processing by 120 ms and prevent duplicate requests for the same active selection.

## Result presentation

- Show the Bengali pronunciation or meaning in a small badge associated with the selection; do not create a browser popup window.
- Use `Range.getBoundingClientRect()` to locate the selected text.
- Place the result below the selection when possible, otherwise above it. Keep the result within the viewport and visually connected to the selection.
- Isolate the result styling from page styles with Shadow DOM.
- Remove the result when the selection is cleared, a new ordinary selection is made, the user clicks elsewhere, or Escape is pressed.
- If a result is dismissed while a request is pending, a late response must not restore the badge.
- Do not add copy, listen, close, or context-menu controls.

## API and pronunciation rules

- The extension must not call Gemini directly. It sends requests through the configured backend.
- Backend endpoint: `POST /api/pronunciation`.
- Meaning endpoint: `POST /api/meaning`; return a concise Bengali translation, not a phonetic transliteration.
- Request body: `{ "text": "Authentication" }`.
- Successful pronunciation responses include a Bengali-script `pronunciation` string; meaning responses include a Bengali `meaning` string.
- Empty text and text over 500 characters must be rejected without calling Gemini.
- Instruct Gemini to return only Bengali phonetic pronunciation for pronunciation requests and concise Bengali meaning for meaning requests.
- The Gemini API key belongs only on the backend, never in the extension package.
- The local-development default may use `http://localhost:3000/api/pronunciation`; any public release must configure a public HTTPS backend.

## Cache and request handling

- Check the built-in pronunciation dictionary before making a backend request.
- Cache successful results in the extension and backend to reduce repeat API requests.
- Keep meaning and pronunciation caches in separate namespaces.
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
2. Alt + selection of valid English text displays its Bengali meaning after the short debounce.
3. Ordinary selection and combined Ctrl+Alt selection do not issue a request and dismiss any previous result.
4. Clearing the selection or pressing Escape dismisses the result.
5. A late response cannot recreate a dismissed result.
6. Empty, non-English-only, and over-limit selections do not call the backend.
7. Browser shortcuts continue to work.
8. Pronunciation and meaning caches are independent; cached results are reused only for the matching mode.
9. Public release packages point to an HTTPS backend and do not contain API keys or local environment files.
10. Chrome and Firefox source and release packages remain separate and independently loadable.
