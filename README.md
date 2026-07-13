# Sail Tactician — modular foundation

Incremental architecture for the working Tactician prototype. The application shell now
loads extracted legacy CSS and JavaScript while the tested core is migrated one behavior
at a time.

## Run

```bash
npm install
npm test
npm run build
```

## Current structure

- `index.html`: product markup and external asset references
- `src/styles/legacy.css`: behavior-preserving extraction of existing styles
- `src/legacy/app-*.js`: ordered, behavior-preserving extraction of the original script blocks
- `src/core`: pure, tested sailing calculations
- `src/generated/tactician-core.js`: checked browser bundle consumed by the legacy runtime
- `src/services` and `src/state`: browser boundaries and application state

The next change should add parity adapters between the legacy runtime and `src/core`; do
not redesign the user interface until those comparisons are stable.
