# Production and Backend Startup Documentation

## Problem

The README does not explain the missing-dependency startup fix or the `EADDRINUSE` error, and its deployment notes need a clear production release sequence.

## Requirements

- Document installing backend dependencies before local startup.
- Explain that port `EADDRINUSE` means another process already owns that port and avoid recommending duplicate server startup.
- Document how to identify port 3000's listener on Windows and how to choose a different port.
- Provide a practical deployment and release checklist that includes private API key configuration, HTTPS, health checks, both API routes, separate Chrome/Firefox packaging, and both extension store submission paths.
- Clearly state that public production deployment is blocked until abuse protection and usage monitoring are configured.

## Acceptance criteria

1. README troubleshooting resolves the two recent startup errors.
2. Production steps describe how to deploy from GitHub and configure the extension for the hosted API.
3. Documentation does not claim that a production service has already been deployed.
