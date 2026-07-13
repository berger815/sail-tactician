# Tactician modular foundation

This package is the first behavior-preserving step away from the monolithic `index.html`.
It does not replace the working application. It establishes boundaries, tests, and build
tooling so the live behavior can be moved incrementally and verified at every step.

## Dependency direction

`ui -> state -> core` and `services -> state`. Core modules depend on no browser APIs,
DOM elements, canvas contexts, storage, timers, or global application state.

## Boundaries

- `src/core`: deterministic sailing mathematics and recommendations.
- `src/state`: application state, actions, and selectors.
- `src/services`: GPS, IMU, wind, persistence, telemetry, and offline integration.
- `src/ui`: screens and renderers. Add during migration.
- `tests`: characterization and unit tests.

## Migration order

1. Preserve the working application while moving inline CSS and JavaScript into `src/styles/legacy.css` and ordered `src/legacy/app-*.js` files.
2. Validate the extracted angles, geodesy, polars, start-line, and confidence modules.
3. Load a generated browser core and delegate legacy angle/geodesy helpers to the tested source modules.
4. Add legacy adapters that convert `NAV`, `WIND`, `CRS`, and `RACE` globals to explicit inputs.
5. Replace one legacy function at a time with an imported module and compare outputs in demo/replay mode.
6. Extract browser services, then canvas renderers, then modal and screen markup.
7. Delete each legacy implementation as soon as its replacement passes characterization tests.
8. Finish with one authoritative implementation per behavior and a thin `index.html` shell.

## Definition of done for the complete refactor

- `index.html` is less than 250 lines.
- No function is redefined later in the load sequence.
- Navigation and routing calculations have deterministic fixtures.
- Sensor and network services can be replaced with replay fakes.
- Start, Plan, and Race consume the same state and routing core.
- The application builds offline and recovers from interrupted sessions.
