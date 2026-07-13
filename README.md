# Sail Tactician — modular foundation

Incremental architecture package for the working Tactician prototype.

## Run

```bash
npm install
npm test
npm run build
```

## Integrate with the repository

Copy these files into a branch created from `main`. Leave the current `index.html` in place
for the first commit. The next commit should add adapter-based parity checks between the
legacy functions and `src/core`; do not redesign the user interface until parity is stable.

The first extraction includes angle handling, geodesy, polar interpolation, start-line
analysis, timing guidance, recommendation confidence, a minimal state store, and a wrapped
GPS service.
