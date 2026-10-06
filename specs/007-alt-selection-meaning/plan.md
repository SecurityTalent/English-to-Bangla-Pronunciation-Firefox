# Implementation plan

1. Extend modifier tracking to capture Alt-assisted mouse and keyboard selections without blocking native shortcuts.
2. Route meaning requests through a new background action and `/api/meaning` endpoint.
3. Maintain independent extension storage and backend caches for pronunciation and meaning.
4. Add a Bengali-meaning-specific Gemini instruction while preserving the pronunciation prompt and dictionary.
5. Update product requirements and user-facing setup/API documentation.
6. Review the diff and build the distributable extension package.
