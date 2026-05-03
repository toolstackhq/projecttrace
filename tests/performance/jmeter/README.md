# JMeter Material

This folder now contains runnable JMeter plans that mirror the k6 coverage.

You do not need to install JMeter on Linux. The repo runs JMeter inside Docker through the
`jmeter` service in `docker-compose.yml`.

If you want a longer steady run instead of a quick smoke check, use:

```bash
make jmeter-load-report
```

## Seeded Login

Use the seeded admin account when you want the plans to run without manual setup:

- email: `admin@projecttrace.dev`
- password: `ProjectTrace123!`

Override them with JMeter properties if needed:

```bash
jmeter -JseedUserEmail=admin@projecttrace.dev -JseedUserPassword=ProjectTrace123! ...
```

The Docker plans default to the backend service inside Compose:

- host: `backend`
- port: `8000`
- protocol: `http`

If you run JMeter against a local backend instead, override the host:

```bash
jmeter -JbaseHost=localhost ...
```

The repo also ensures the canonical perf login exists before the run, so the report target
does not depend on whatever user record is already in the database.

## Generated Plans

The plans live in `plans/`:

- `smoke-test.jmx`
- `baseline-load-test.jmx`
- `volume-test.jmx`
- `crud-workflow-test.jmx`
- `search-filter-test.jmx`
- `spike-test.jmx`
- `stress-test.jmx`
- `soak-test-template.jmx`

Generate them again after editing the generator:

```bash
node tests/performance/jmeter/generate-plans.mjs
```

## What Each Plan Covers

| Test | ProjectTrace plan | Netflix-style example |
| --- | --- | --- |
| Smoke | `smoke-test.jmx` | Sign in, open home, confirm browse/search still works. |
| Load | `baseline-load-test.jmx` | A normal evening of browsing rows of titles and opening details. |
| Volume | `volume-test.jmx` | A huge catalog where big reads and searches still need to stay fast. |
| CRUD workflow | `crud-workflow-test.jmx` | A user updates watch metadata, comments, and linked items in sequence. |
| Search and filter | `search-filter-test.jmx` | Filtering by genre, language, or region on a large catalog. |
| Spike | `spike-test.jmx` | A trailer drops and traffic jumps sharply for a short burst. |
| Stress | `stress-test.jmx` | Launch-night traffic pushes the service past its normal limit. |
| Soak | `soak-test-template.jmx` | Overnight browsing and watching to catch drift or leaks. |

## Which Command To Use

- `make jmeter-report`: quick smoke check
- `make jmeter-load-report`: longer steady load run
- `make jmeter-report-open`: smoke plus auto-open report
- `make jmeter-load-report-open`: load plus auto-open report

## CLI Run

```bash
docker compose --profile perf run --rm jmeter -n -t tests/performance/jmeter/plans/smoke-test.jmx -l reports/jmeter/latest/results.jtl -e -o reports/jmeter/latest
```

## Instant Report

Run a plan and build the HTML report in one command:

```bash
make jmeter-report PLAN=smoke-test.jmx
```

Open the report automatically when your desktop supports `xdg-open`:

```bash
make jmeter-report-open PLAN=smoke-test.jmx
```

The container wrapper creates and clears `reports/jmeter/latest` for you before JMeter starts,
so the report path does not need to exist ahead of time.

## HTML Report

```bash
docker compose --profile perf run --rm jmeter -n -t tests/performance/jmeter/plans/smoke-test.jmx -l reports/jmeter/latest/results.jtl -e -o reports/jmeter/latest
```

## Debugging

Use the GUI `View Results Tree` listener only when debugging a plan. Keep it out of the final load run.

## Base URL

The Docker plans assume:

- host: `backend`
- port: `8000`
- protocol: `http`
- API prefix: `/api`
