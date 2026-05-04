# Performance Material

This folder contains the baseline performance testing material for ProjectTrace.

## Layout

- `k6/` workload scripts and HTML dashboard export flow
- `jmeter/` JMeter plans, generator, and CLI notes
- `gatling/` JavaScript simulations and HTML report flow

## k6 scripts

| File | GitHub | What it shows |
| --- | --- | --- |
| `smoke-test.js` | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/smoke-test.js">open</a> | 1 VU, 1 iteration, and the core smoke checks. |
| `baseline-load-test.js` | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/baseline-load-test.js">open</a> | Ramp, hold, and ramp-down stages for baseline load. |
| `volume-test.js` | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/volume-test.js">open</a> | Large page sizes and detail reads over the seeded data. |
| `crud-workflow-test.js` | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/crud-workflow-test.js">open</a> | Fixed iterations for create, update, link, comment, and delete. |
| `search-filter-test.js` | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/search-filter-test.js">open</a> | A steady run against search-heavy list endpoints. |
| `spike-test.js` | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/spike-test.js">open</a> | A sudden jump up and back down in traffic. |
| `stress-test.js` | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/stress-test.js">open</a> | Traffic beyond the normal limit. |
| `soak-test-template.js` | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/soak-test-template.js">open</a> | Long steady traffic to catch drift and leaks. |

See `k6/README.md` for Docker execution and the built-in k6 HTML report export.

## JMeter

See `jmeter/README.md` for the generated plans, seeded login, and CLI run format.

## Gatling

See `gatling/README.md` for the JavaScript simulations, report output, and local npm setup.
