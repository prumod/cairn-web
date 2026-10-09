# Architecture

## Current system

This repository contains the Cairn web frontend. The root Bun workspace owns shared development tooling; `web/` contains the Vite and React application. Vite serves the `web/` entry point and builds static assets to `web/dist`. React is configured with the Oxc-based compiler.

`web/index.html` provides the `#root` element. `web/src/main.tsx` checks that the element exists and mounts `App` inside React `StrictMode`. `web/src/App.tsx` implements the unstyled interactive prototype with fictional data and local React state. Its actions simulate product flows; they are not backend operations, authentication, or external integrations. Treat the prototype as interaction evidence, not proof that planned services or production behavior exist.

## Planned boundary and deployment

The backend is separate and has not been scaffolded in this repository. The frontend is intended for Vercel and the backend for Railway, but neither deployment is configured. When implemented, private data must be protected by backend authentication; the frontend alone is not an access-control boundary. These are planned constraints, not current runtime behavior.

## Change contracts

- Keep frontend concerns in `web/`; the backend remains a separate system.
- Treat deployment targets and private-data protection above as plans until implemented and verified.
- For test scope and test contracts, see [Testing](TESTING.md).
