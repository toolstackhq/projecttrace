# Gatling Zero to Hero

For the practical definitions of smoke, load, volume, spike, stress, and soak tests, see
`docs/09-performance-test-types.md`.

## Read This First

If you are new to Gatling, read this page in this order:

1. What Gatling is and why teams use it
2. How the JavaScript SDK project is laid out
3. How ProjectTrace simulations are organized
4. How to run a smoke test and read the report
5. How to run a longer load test
6. How open and closed workload models differ

## What Gatling Is

Gatling is a code-first performance testing tool.

For ProjectTrace, that means:

- you write simulations as JavaScript files
- the CLI runs them and builds an HTML report
- requests hit the REST API directly
- you can model realistic user journeys without a browser

This makes Gatling a good fit for API-first CRUD apps like ProjectTrace.

## Install

Gatling's JavaScript SDK uses Node.js and npm.

Recommended setup:

```bash
cd tests/performance/gatling
npm install
```

Then run a simulation with:

```bash
npx gatling run --simulation smoke-test
```

If you are learning inside this repo, the root Make targets are easier:

```bash
make gatling-report GATLING_PLAN=smoke-test.gatling.js
make gatling-load-report
make gatling-report-open GATLING_PLAN=smoke-test.gatling.js
make gatling-load-report-open
```

The Make targets fetch a JWT from the seeded admin user before the run starts, so the simulation
can focus on the authenticated API traffic instead of a separate login flow.

## Project Layout

ProjectTrace keeps Gatling material in one place:

- `tests/performance/gatling/package.json`
- `tests/performance/gatling/src/*.gatling.js`
- `tests/performance/gatling/target/gatling/`

The `src` folder holds the simulations.
The `target/gatling` folder holds the generated HTML reports.

## What The Project Tests

ProjectTrace Gatling simulations cover the same baseline journeys as the other tools:

- dashboard summary
- bugs list
- requirements list
- test cases list
- bug CRUD
- search and filter paths
- long-running steady load
- spike and stress behavior

## Core Ideas

### Simulation

A simulation is the test script Gatling runs.
In this repo, each simulation is a `*.gatling.js` file.

### Scenario

A scenario is the user journey.
Examples:

- log in
- open the dashboard
- browse bugs
- create a bug
- link a requirement

### Checks

Checks verify that the API returned the result you expected.
Use them to confirm status codes and extract IDs for later requests.

### Workload Model

Gatling is usually used with an open workload model.
That means you decide how users arrive over time instead of making one fixed loop.

In simple terms:

- smoke = tiny check
- load = expected steady traffic
- volume = larger pages and bigger reads
- spike = sudden burst
- stress = push past the normal limit
- soak = hold steady for a long time

## Open vs Closed Workloads

This is the part that usually makes perf testing click:

- open workload: new users arrive at a rate, like people walking into a store
- closed workload: a fixed number of users keep cycling through actions, like the same people browsing, waiting, and browsing again

For ProjectTrace, learn the open model first because it is easier to reason about when you want to say, "put 5 users per second on the app for 5 minutes."

If you see `constantUsersPerSec`, `atOnceUsers`, or `rampUsers`, you are looking at an open-model style simulation.

## ProjectTrace Simulations

The repo includes these simulations:

- `smoke-test.gatling.js`
- `baseline-load-test.gatling.js`
- `volume-test.gatling.js`
- `crud-workflow-test.gatling.js`
- `search-filter-test.gatling.js`
- `spike-test.gatling.js`
- `stress-test.gatling.js`
- `soak-test-template.gatling.js`

## Run Commands

From the Gatling folder:

```bash
cd tests/performance/gatling
npm run smoke
npm run load
```

From the repo root:

```bash
make gatling-report GATLING_PLAN=smoke-test.gatling.js
make gatling-load-report
```

## Reading The Report

Focus on:

- response time percentiles
- throughput
- errors
- user arrival rate
- how the app behaves as the run gets longer

If p95 rises but errors stay low, the app is probably queueing or querying inefficiently.
If both latency and errors rise, the app is running into a capacity or failure limit.

## ProjectTrace Base URL

The simulations target the backend service in Docker or on your host:

- host: `backend` in Compose, or `localhost` locally
- port: `8000`
- protocol: `http`
- API prefix: `/api`

The health check uses `/health`.

You can override the defaults with:

```bash
GATLING_SERVICE_BASE_URL=http://localhost:8000
GATLING_API_PREFIX=/api
GATLING_ACCESS_TOKEN=<jwt>
```

## Troubleshooting

- If the CLI cannot find a simulation, confirm the file is named `*.gatling.js`.
- If npm cannot resolve packages, run `npm install` in `tests/performance/gatling`.
- If a report does not open, check `tests/performance/gatling/target/gatling`.
