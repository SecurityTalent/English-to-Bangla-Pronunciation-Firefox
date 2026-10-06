# Specification: Start the backend from the project root

## Status

Implemented

## Problem

Running `npm start` from the project root failed with ENOENT because the root had no `package.json`, even though the backend has a start script.

## Requirement

From the project root, `npm start` must launch the backend server without requiring the user to change directories.

## Acceptance criteria

- Root `npm start` runs the backend's existing start script.
- The server reports that it is listening on the configured port.
