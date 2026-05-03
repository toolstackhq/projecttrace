# ProjectTrace

ProjectTrace is a full-stack QA and development tracking tool built for learning serious performance testing with k6 and JMeter.

It models a realistic workflow:
`Project -> Epic -> Feature -> Requirement -> Test Case -> Test Run -> Bug`

## Architecture

- Backend: FastAPI + SQLAlchemy + Alembic
- Frontend: React + Vite + Tailwind CSS
- Database: PostgreSQL
- Runtime: Docker Compose
- Documentation: VitePress-ready GitHub Pages docs
- Performance tooling: k6 scripts, JMeter plans, and Gatling simulations under `tests/performance`

## API Docs

The backend exposes FastAPI OpenAPI docs out of the box:

- Swagger UI: <a href="http://localhost:8000/docs">http://localhost:8000/docs</a>
- ReDoc: <a href="http://localhost:8000/redoc">http://localhost:8000/redoc</a>
- OpenAPI JSON: <a href="http://localhost:8000/openapi.json">http://localhost:8000/openapi.json</a>

Use the same REST endpoints for curl, API tests, k6, and JMeter.

## Quick Start

1. Copy `.env.example` to `.env` if you want to run locally.
2. Start the stack:

```bash
docker compose up --build
```

3. Open the UI at <a href="http://localhost:5173">http://localhost:5173</a>
4. Open the API docs at <a href="http://localhost:8000/docs">http://localhost:8000/docs</a>

## Documentation Site

The docs site lives in `docs/` and is ready for GitHub Pages deployment.
It is organized around four learning tracks:

- ProjectTrace
- JMeter
- k6
- Gatling

```bash
cd docs
npm install
npm run dev
```

## Authentication

- If the database is empty, the login screen will let you create the first admin account.
- If you seeded the database, the default seeded admin is `admin@projecttrace.dev`.
- The default seeded password is `ProjectTrace123!` unless you override `SEED_USER_PASSWORD`.
- The frontend stores a JWT access token locally and sends it as a bearer token on API requests.

## Migrations

Run the baseline migration:

```bash
make migrate
```

## Seed Data

Generate realistic sample data:

```bash
make seed
```

The seed script creates one admin user and uses the configured `SEED_USER_PASSWORD` for seeded accounts.

## Reset Database

Drop and recreate the schema:

```bash
make reset-db
```

## Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

## Run the Backend

```bash
cd backend
pip install -e .
alembic upgrade head
uvicorn app.main:app --reload
```

## k6 Tests

Scripts live in `tests/performance/k6`.

See `tests/performance/k6/README.md` and `docs/04-k6-guide.md`.

No local k6 install is required for the normal workflow. The Docker report target runs k6 in Docker.
That target uses k6's built-in web dashboard export to generate `reports/k6/latest/index.html`.
Use the smoke command for a quick check and the load command when you want the run to stay under
load for longer.

Run a k6 plan from CLI with:

```bash
make k6-report PLAN=smoke-test.js
```

Longer steady load run:

```bash
make k6-load-report
```

To open the HTML report after the run:

```bash
make k6-report-open PLAN=smoke-test.js
```

Useful plan files:

- `tests/performance/k6/smoke-test.js`
- `tests/performance/k6/baseline-load-test.js`
- `tests/performance/k6/volume-test.js`
- `tests/performance/k6/crud-workflow-test.js`
- `tests/performance/k6/search-filter-test.js`
- `tests/performance/k6/spike-test.js`
- `tests/performance/k6/stress-test.js`
- `tests/performance/k6/soak-test-template.js`

## JMeter Tests

See `tests/performance/jmeter/README.md` and `docs/05-jmeter-guide.md`.

No local JMeter install is required. The report target runs JMeter in Docker.

Run a JMeter plan from CLI with:

```bash
docker compose --profile perf run --rm jmeter -n -t tests/performance/jmeter/plans/smoke-test.jmx -l reports/jmeter/latest/results.jtl -e -o reports/jmeter/latest
```

Run and generate a report instantly with:

```bash
make jmeter-report PLAN=smoke-test.jmx
```

Longer steady load run:

```bash
make jmeter-load-report
```

That target first ensures the canonical perf login exists in the database, then runs JMeter in
Docker and writes the HTML report.

To open the HTML report after the run:

```bash
make jmeter-report-open PLAN=smoke-test.jmx
```

Useful plan files:

- `tests/performance/jmeter/plans/smoke-test.jmx`
- `tests/performance/jmeter/plans/baseline-load-test.jmx`
- `tests/performance/jmeter/plans/volume-test.jmx`
- `tests/performance/jmeter/plans/crud-workflow-test.jmx`
- `tests/performance/jmeter/plans/search-filter-test.jmx`
- `tests/performance/jmeter/plans/spike-test.jmx`
- `tests/performance/jmeter/plans/stress-test.jmx`
- `tests/performance/jmeter/plans/soak-test-template.jmx`

## Gatling Tests

Gatling simulations live in `tests/performance/gatling`.

You will need to install the local JavaScript dependencies once:

```bash
cd tests/performance/gatling
npm install
```

Run the smoke simulation from the folder with:

```bash
npm run smoke
```

Run the longer load simulation with:

```bash
npm run load
```

The repo also exposes root Make targets:

```bash
make gatling-report GATLING_PLAN=smoke-test.gatling.js
make gatling-load-report
make gatling-report-open GATLING_PLAN=smoke-test.gatling.js
make gatling-load-report-open
```

The Make targets fetch a JWT from the seeded admin user before running Gatling, so the scripts
stay authenticated without a manual login step.

The generated HTML report lives under `tests/performance/gatling/target/gatling/.../index.html`.

Useful simulation files:

- `tests/performance/gatling/src/smoke-test.gatling.js`
- `tests/performance/gatling/src/baseline-load-test.gatling.js`
- `tests/performance/gatling/src/volume-test.gatling.js`
- `tests/performance/gatling/src/crud-workflow-test.gatling.js`
- `tests/performance/gatling/src/search-filter-test.gatling.js`
- `tests/performance/gatling/src/spike-test.gatling.js`
- `tests/performance/gatling/src/stress-test.gatling.js`
- `tests/performance/gatling/src/soak-test-template.gatling.js`

## Why This App Exists

ProjectTrace is intentionally baseline-clean. It gives you:

- dense list/detail pages
- searchable data sets
- linked entities and many-to-many relationships
- summary endpoints and activity logs
- a dataset large enough to reveal bottlenecks later

## Next Learning Steps

1. Add password reset and account lifecycle management.
2. Add charts and deeper analytics.
3. Add GitHub PR linking using the placeholder design.
4. Introduce bottlenecks intentionally and measure them with k6 and JMeter.
