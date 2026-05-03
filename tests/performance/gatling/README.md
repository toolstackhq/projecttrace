# Gatling Material

This folder contains runnable Gatling JavaScript simulations for ProjectTrace.

You need Node.js 20 or newer and npm 10 or newer.

## Install

```bash
cd tests/performance/gatling
npm install
```

## Token Bootstrap

The repo generates a JWT from the seeded admin account before each Make-driven Gatling run.
That means the simulations can run as an authenticated user without doing a separate login step
inside the Gatling script.

If you run the simulation directly, set the token yourself:

```bash
GATLING_ACCESS_TOKEN=... npm run smoke
```

## Simulations

| Test | ProjectTrace simulation | Netflix-style example |
| --- | --- | --- |
| Smoke | `smoke-test.gatling.js` | Sign in, open the home page, and confirm browse/search still works. |
| Load | `baseline-load-test.gatling.js` | A normal evening of browsing rows of titles and opening details. |
| Volume | `volume-test.gatling.js` | A huge catalog where large reads and searches still need to stay fast. |
| CRUD workflow | `crud-workflow-test.gatling.js` | A user updates metadata, comments, and linked items in sequence. |
| Search and filter | `search-filter-test.gatling.js` | Filtering by genre, language, or region on a large catalog. |
| Spike | `spike-test.gatling.js` | A trailer drops and traffic jumps sharply for a short burst. |
| Stress | `stress-test.gatling.js` | Launch-night traffic pushes the service past its normal limit. |
| Soak | `soak-test-template.gatling.js` | Overnight browsing and watching to catch drift or leaks. |

## Which Command To Use

- `npm run smoke`: quick smoke check
- `npm run load`: longer steady load run
- `npm run volume`: large-data reads and detail pages
- `npm run crud`: create, update, comment, link, unlink
- `npm run search`: list filtering and search paths
- `npm run spike`: sudden burst test
- `npm run stress`: push past the expected limit
- `npm run soak`: long sustained run

## Run From The Repo Root

```bash
make gatling-report GATLING_PLAN=smoke-test.gatling.js
make gatling-load-report
make gatling-report-open GATLING_PLAN=smoke-test.gatling.js
make gatling-load-report-open
```

## Report Output

The Gatling CLI writes HTML reports under:

```text
tests/performance/gatling/target/gatling
```

Open the newest report folder and then its `index.html` file after a run.

## Base URL

The simulations target the backend service directly:

- host: `backend` in Docker Compose
- host: `localhost` when running on your machine
- port: `8000`
- API prefix: `/api`

The health check uses `/health`.
