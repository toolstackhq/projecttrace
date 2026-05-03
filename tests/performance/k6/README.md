# k6 Material

This folder contains runnable k6 workloads for ProjectTrace.

You do not need a local k6 install for the normal flow. Run k6 in Docker with:

```bash
make k6-report PLAN=smoke-test.js
```

That command:

- ensures the canonical perf login exists
- runs the requested k6 workload in Docker
- writes `reports/k6/latest/index.html`

If you want a longer steady run instead of a quick smoke check, use:

```bash
make k6-load-report
```

## Seeded Login

The tests authenticate with the seeded admin account by default:

- email: `admin@projecttrace.dev`
- password: `ProjectTrace123!`

## Workloads

| Test | ProjectTrace script | Netflix-style example |
| --- | --- | --- |
| Smoke | `smoke-test.js` | Sign in, open home, confirm browse/search still works. |
| Load | `baseline-load-test.js` | A normal evening of browsing rows of titles and opening details. |
| Volume | `volume-test.js` | A huge catalog where big reads and searches still need to stay fast. |
| CRUD workflow | `crud-workflow-test.js` | A user updates watch metadata, comments, and linked items in sequence. |
| Search and filter | `search-filter-test.js` | Filtering by genre, language, or region on a large catalog. |
| Spike | `spike-test.js` | A trailer drops and traffic jumps sharply for a short burst. |
| Stress | `stress-test.js` | Launch-night traffic pushes the service past its normal limit. |
| Soak | `soak-test-template.js` | Overnight browsing and watching to catch drift or leaks. |

## Which Command To Use

- `make k6-report`: quick smoke check
- `make k6-load-report`: longer steady load run
- `make k6-report-open`: smoke plus auto-open report
- `make k6-load-report-open`: load plus auto-open report

## HTML Report

ProjectTrace uses the built-in k6 web dashboard export to write the HTML report automatically:

```bash
make k6-report-open PLAN=smoke-test.js
```

That command produces `reports/k6/latest/index.html` from the k6 web dashboard export.

The built-in report focuses on charts and trend visuals. k6 still prints thresholds and checks in
the terminal summary.

For short smoke tests, the repo lowers the dashboard aggregation period so the HTML export still
has enough data to render.

## Base URL

The Docker flow targets the backend service inside Compose:

- host: `backend`
- port: `8000`
- protocol: `http`
- API prefix: `/api`

The smoke test also checks the service-root health endpoint at `/health`. Docker sets
`K6_SERVICE_BASE_URL=http://backend:8000` for that check. If you run k6 on the host, the default
is `http://localhost:8000`.

If you run a k6 script directly on the host, you can override the base URL with `K6_BASE_URL`.
