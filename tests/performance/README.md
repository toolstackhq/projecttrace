# Performance Material

This folder contains the baseline performance testing material for ProjectTrace.

## Layout

- `k6/` workload scripts and HTML dashboard export flow
- `jmeter/` JMeter plans, generator, and CLI notes
- `gatling/` JavaScript simulations and HTML report flow

## k6 scripts

- `smoke-test.js`
- `baseline-load-test.js`
- `volume-test.js`
- `crud-workflow-test.js`
- `search-filter-test.js`
- `spike-test.js`
- `stress-test.js`
- `soak-test-template.js`

See `k6/README.md` for Docker execution and the built-in k6 HTML report export.

## JMeter

See `jmeter/README.md` for the generated plans, seeded login, and CLI run format.

## Gatling

See `gatling/README.md` for the JavaScript simulations, report output, and local npm setup.
