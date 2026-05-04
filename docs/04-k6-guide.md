# k6 Zero to Hero

For the practical definitions of smoke, load, volume, spike, stress, and soak tests, see
`docs/09-performance-test-types.md`.

## Read This First

If you are new to k6, read this page in this order:

1. What k6 is and when to use it
2. How ProjectTrace scripts are organized
3. How to run a smoke test
4. How to run a longer load test
5. How to read the built-in HTML report

## ProjectTrace Starter Targets

These are the app-specific starting targets used in the smoke-style tests:

| Action | Target |
| --- | --- |
| Login | p95 under 1 second |
| Dashboard summary | p95 under 750 ms |
| List bugs | p95 under 750 ms |
| Create bug | p95 under 1 second |
| View requirement detail | p95 under 1 second |
| Create test run | p95 under 1 second |

The smoke script checks login timing directly, and the request checks plus thresholds keep the API
workload honest. Treat these as the first baseline, then tune them with business input.

## Install

```bash
brew install k6
```

or use the package instructions for your platform.

If you do not want to install k6 locally, use the Docker report target instead:

```bash
make k6-report PLAN=smoke-test.js
```

## Run Scripts

```bash
k6 run tests/performance/k6/smoke-test.js
k6 run tests/performance/k6/baseline-load-test.js
k6 run tests/performance/k6/volume-test.js
k6 run tests/performance/k6/crud-workflow-test.js
k6 run tests/performance/k6/search-filter-test.js
k6 run tests/performance/k6/spike-test.js
k6 run tests/performance/k6/stress-test.js
k6 run tests/performance/k6/soak-test-template.js
```

### Script Map

The important load-shape comments live beside the `options`, `stages`, `setup()`, and `group()`
blocks in the source files.

| File | GitHub | What to notice |
| --- | --- | --- |
| `smoke-test.js` | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/smoke-test.js">open</a> | 1 VU, 1 iteration, health + dashboard + bugs sanity checks. |
| `baseline-load-test.js` | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/baseline-load-test.js">open</a> | Ramp, hold, and ramp-down stages for the baseline load. |
| `volume-test.js` | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/volume-test.js">open</a> | Bigger page sizes and detail reads over the seeded data. |
| `crud-workflow-test.js` | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/crud-workflow-test.js">open</a> | Fixed iteration count for create, update, link, comment, and delete actions. |
| `search-filter-test.js` | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/search-filter-test.js">open</a> | Steady duration run against search-heavy list endpoints. |
| `spike-test.js` | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/spike-test.js">open</a> | Fast jump up and back down to model a burst. |
| `stress-test.js` | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/stress-test.js">open</a> | Pushes beyond normal capacity to find the breaking point. |
| `soak-test-template.js` | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/soak-test-template.js">open</a> | Long steady traffic to catch drift and leaks. |

Set the target API URL with:

```bash
K6_BASE_URL=http://localhost:8000/api k6 run tests/performance/k6/smoke-test.js
```

The smoke test also hits the service-root health endpoint at `/health`. When you run k6 in
Docker, the repo sets `K6_SERVICE_BASE_URL=http://backend:8000` for that request. If you run on
the host, the default service URL is `http://localhost:8000`.

For the no-install Docker flow, use:

```bash
make k6-report PLAN=smoke-test.js
make k6-report-open PLAN=smoke-test.js
```

That flow uses k6's built-in web dashboard export to write `reports/k6/latest/index.html`.
The HTML report gives you the graphs; the terminal summary still shows thresholds and checks.
For the short smoke plan, the repo lowers the dashboard aggregation period so the export still
contains enough data to render.

## Core Concepts

- VUs: virtual users that execute the script concurrently
- Iterations: a fixed number of script runs
- Duration: a time-based run
- Thresholds: pass/fail targets for latency and error rate
- Checks: functional assertions inside the test

## Latency Metrics

- p50: median response time
- p90: 90% of requests are faster than this
- p95: 95% of requests are faster than this
- p99: tail latency

## Throughput and Errors

- RPS or throughput: how many requests are processed per second
- Error rate: failed requests divided by total requests

## Interpreting Output

Look for:

- response time growth as VUs increase
- error rate spikes during the workload
- dashboard and list endpoints holding steady under read pressure
- CRUD journeys remaining stable with realistic write load
- volume tests exposing slow list and detail queries
- soak tests staying flat instead of drifting over time
