# Privacy Policy — English to Bangla Pronunciation

Last updated: 2026-10-10

This policy describes the extension and the shared Render backend. Before listing or distributing the extension, verify that it matches the live service configuration, hosting logs, retention, and provider terms, and publish it at a public URL.

## Information processed

- The content script is enabled on all websites so it can detect text selection. Ordinary selections are not sent to the backend; a lookup requires Ctrl for pronunciation or Alt for meaning.
- For Ctrl pronunciation requests, the extension checks its built-in dictionary and local cache first. For Alt meaning requests, it checks its local meaning cache. On a cache miss, the selected text (up to 500 characters) is sent to the configured backend.
- The backend checks its own cache and built-in pronunciation dictionary. On a further cache miss, it sends the text to Google Gemini to generate a Bengali phonetic pronunciation or meaning. The Gemini API key stays in the backend environment and is not included in either browser extension.
- Chrome and Firefox store pronunciation and meaning cache entries and the backend URL in their respective browser extension storage. The toolbar's clear-cache action clears extension storage; this also resets the saved backend URL to the default. Removing the extension removes its local data.
- The backend keeps temporary in-memory caches of submitted text, pronunciations, and meanings. These caches are lost when the backend process restarts. The current request log records the route, status, and duration, not the request body. Hosting or provider logs may have separate retention rules.
- The backend temporarily processes the request IP address in memory to enforce a per-IP lookup rate limit. Rate-limit entries are removed when their one-minute window expires, with periodic cleanup running at least every ten seconds. The application request log does not include the IP address. The hosting provider may maintain its own network logs.

## How information is used

Selected text is used only to look up or generate the requested pronunciation or Bengali meaning and return it to the extension. This project does not implement user accounts, advertising, analytics, or sale of personal information.

## Service operator and third parties

The operator of the configured backend can access text sent to that service. If you use a backend deployed by someone else, that operator's policies also apply. Text sent to Gemini is processed under Google's applicable Gemini API terms and privacy information. Do not select confidential or sensitive text unless you trust the backend operator and service provider. Public deployments should use HTTPS.

## Retention and deletion

Browser cache entries remain in Chrome or Firefox extension storage until cleared by the user or removed with the extension. Backend text/result cache entries remain in process memory until the server restarts. Rate-limit IP entries are removed after their one-minute window, with cleanup at least every ten seconds. The deployment operator must update this section if hosting, logs, monitoring, or provider settings retain additional data.

## Contact

For privacy questions, contact [securi3ytalent@gmail.com](mailto:securi3ytalent@gmail.com) or visit [securitytalent.net](https://securitytalent.net/).
