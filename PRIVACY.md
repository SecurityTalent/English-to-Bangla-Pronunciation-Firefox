# Privacy Policy — English to Bangla Pronunciation

Last updated: 2026-10-06

This document is a publication draft. Before listing the extension, the service operator must replace the bracketed contact details, verify the deployed backend's behavior, and publish this policy at a public URL.

## Information processed

- When you select English text with Ctrl for pronunciation or Alt for meaning, the extension sends that selected text (up to 500 characters) to the configured backend.
- If the backend has no cached or built-in pronunciation for the text, it sends the text to Google Gemini to generate a Bengali phonetic pronunciation. For meaning requests, it may send the text to Gemini to generate a Bengali meaning. The backend operator's Gemini API key stays on the backend and is not included in the extension.
- The extension stores separate pronunciation and meaning cache entries and its backend URL setting in browser extension storage. You can clear the extension cache from its settings.
- The backend keeps temporary in-memory caches of submitted text, pronunciations, and meanings. The caches are lost when the backend process restarts. The current backend request log records the route, status, and duration, not the request body.

## How information is used

Selected text is used only to look up or generate the requested pronunciation or Bengali meaning and return it to the extension. This project does not implement user accounts, advertising, analytics, or sale of personal information.

## Service operator and third parties

The operator of the configured backend can access text sent to that service. If you use a backend deployed by someone else, that operator's policies also apply. Text sent to Gemini is processed under Google's applicable Gemini API terms and privacy information. Do not select confidential or sensitive text unless you trust the backend operator and service provider.

## Retention and deletion

Browser cache entries remain in browser extension storage until cleared by the user or removed with the extension. Backend cache entries remain in process memory until the server restarts. The deployment operator must update this section if their hosting, logs, monitoring, or provider settings retain additional data.

## Contact

For privacy questions, contact: [ADD A PUBLIC SUPPORT EMAIL]
