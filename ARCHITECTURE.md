# Architecture

## Current system

This repository contains the Cairn web frontend. The root Bun workspace owns shared development tooling; `web/` contains the Vite and React application. Vite serves the `web/` entry point and builds static assets to `web/dist`. React is configured with the Oxc-based compiler.

`web/index.html` provides the `#root` element. `web/src/main.tsx` checks that the element exists and renders an empty React `StrictMode` tree into it. There is currently no product UI, routing, application state, API client, backend, authentication, or external integration implemented here. Treat the repository as a frontend foundation, not as evidence that planned product behavior exists.

## Planned boundary and deployment

The backend is separate and has not been scaffolded in this repository. The frontend is intended for Vercel and the backend for Railway, but neither deployment is configured. When implemented, private data must be protected by backend authentication; the frontend alone is not an access-control boundary. These are planned constraints, not current runtime behavior.

## Change contracts

- Keep frontend concerns in `web/`; the backend remains a separate system.
- Treat deployment targets and private-data protection above as plans until implemented and verified.
- For test scope and test contracts, see [Testing](TESTING.md).
