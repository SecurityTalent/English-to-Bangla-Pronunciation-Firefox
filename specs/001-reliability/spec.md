# Specification: Reliable pronunciation selection

## Status

Implemented

## Problem

The extension can leave a pronunciation badge visible after a normal selection or allow a late backend response to restore a badge after it has been dismissed. These behaviors conflict with the product requirements for temporary, Ctrl-triggered results.

## User story

As a Firefox user, I want a Bengali phonetic pronunciation only when I select English text while holding Ctrl, so the result is useful without interfering with normal selection or browser shortcuts.

## Requirements

1. Ctrl + mouse selection of non-empty English text of at most 500 characters requests a pronunciation after a 120 ms debounce.
2. A result appears near its selection and is dismissed when the selection is cleared, another selection is made without Ctrl, or Escape is pressed.
3. A response for an obsolete or dismissed selection must never recreate the result.
4. Empty, non-English-only, and over-limit selections must not issue a backend request.
5. Browser shortcuts remain untouched; event handlers must not call `preventDefault()`.
6. Cached and backend pronunciations continue to use the existing request and response format.

## Acceptance criteria

- A normal selection after a Ctrl selection removes any prior badge.
- Dismissing a badge while its request is pending prevents the late response from displaying it.
- Existing backend dictionary smoke checks continue to pass.
- JavaScript source files parse successfully and the extension package can be built.

## Out of scope

- Changing the pronunciation provider or backend API contract.
- Guaranteeing the quality of model-generated transliteration for every English phrase.
