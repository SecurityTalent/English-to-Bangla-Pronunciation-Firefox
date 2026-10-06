# Alt + Select Bengali Meaning

## Problem

Users can request Bengali-script phonetic pronunciation with Ctrl + select, but cannot quickly look up a selected English word's Bengali meaning.

## Requirements

- Ctrl + select continues to show phonetic pronunciation.
- Alt + select requests a concise Bengali meaning for the selected English text.
- Ordinary selection does not make a lookup.
- Holding Ctrl and Alt together does not trigger a lookup.
- Meaning results use their own extension and backend cache namespace; pronunciation entries must never be displayed as meanings.
- The extension calls `POST /api/meaning` through the configured backend. Gemini remains backend-only.
- Input follows existing validation: English text, non-empty, maximum 500 characters.
- Existing dismissal, stale-response protection, and browser-shortcut behavior remain in effect.
- Documentation and product requirements explain both selection modes and API endpoints.

## Acceptance criteria

1. Alt + select displays a Bengali meaning beside the selection when the meaning service is available.
2. Ctrl + select retains its existing pronunciation behavior.
3. The two modes cache independently.
4. Empty, non-English-only, and over-limit selections are rejected by the extension; the API rejects empty and over-limit text.
5. Both endpoints report a missing Gemini key clearly, and selected text is never sent directly to Gemini from the extension.
