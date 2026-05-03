# ProjectTrace

<div align="left">
  <a href="https://github.com/toolstackhq/projecttrace">
    <img alt="ProjectTrace" src="https://img.shields.io/badge/ProjectTrace-enterprise%20QA%20traceability-111827?style=for-the-badge">
  </a>
  <a href="https://toolstackhq.github.io/projecttrace/">
    <img alt="Docs" src="https://img.shields.io/badge/docs-vitepress-0F766E?style=for-the-badge">
  </a>
  <a href="https://toolstackhq.github.io/projecttrace/03-api-guide">
    <img alt="OpenAPI" src="https://img.shields.io/badge/api-openapi%20%2F%20swagger-2563EB?style=for-the-badge">
  </a>
  <a href="https://github.com/toolstackhq/projecttrace/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-4B5563?style=for-the-badge">
  </a>
</div>

ProjectTrace is a full-stack QA traceability app for learning real performance testing on a CRUD web application.
It is intentionally baseline-clean so you can use it to learn k6, JMeter, and Gatling before you introduce bottlenecks.

## Overview

ProjectTrace models the workflow below:

`Project -> Epic -> Feature -> Requirement -> Test Case -> Test Run -> Bug`

It includes:

- projects, epics, features, requirements, test cases, test runs, bugs, comments, activity logs, and users
- REST APIs for CRUD, search, filtering, pagination, and linking entities
- FastAPI OpenAPI docs for programmatic access
- Docker Compose for local development and performance runs
- VitePress docs for learning the app and the perf tools

## At A Glance

| Area | Stack |
| --- | --- |
| Backend | FastAPI, SQLAlchemy, Alembic, PostgreSQL |
| Frontend | React, Vite, Tailwind CSS |
| Perf tools | k6, JMeter, Gatling |
| Docs | VitePress |
| Runtime | Docker Compose |

## Quick Start

1. Copy the example env file if you want to run outside Docker:

```bash
cp .env.example .env
```

2. Start the stack:

```bash
docker compose up --build
```

3. Open the UI:

<a href="http://localhost:5173">http://localhost:5173</a>

4. Open the API docs:

<a href="http://localhost:8000/docs">http://localhost:8000/docs</a>

5. Open the docs site:

<a href="http://localhost:5173/projecttrace/">http://localhost:5173/projecttrace/</a>

## Running Locally

### Backend

```bash
cd backend
pip install -e .
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docs

```bash
cd docs
npm install
npm run dev
```

## Database

Run migrations:

```bash
make migrate
```

Seed realistic data:

```bash
make seed
```

Reset the schema:

```bash
make reset-db
```

The seed data includes:

- 25 users
- 10 projects
- 30 epics
- 100 features
- 500 requirements
- 2,000 test cases
- 10,000 test runs
- 5,000 bugs
- 20,000 comments

## Authentication

- If the database is empty, the first user can bootstrap an admin account.
- Seeded login:
  - email: `admin@projecttrace.dev`
  - password: `ProjectTrace123!`
- The frontend stores a JWT access token and sends it as a bearer token.
- Admins can provision users and delete data.
- Editors can create and update data but cannot delete it.

## API Docs

ProjectTrace exposes the FastAPI OpenAPI surface directly:

- Swagger UI: <a href="http://localhost:8000/docs">http://localhost:8000/docs</a>
- ReDoc: <a href="http://localhost:8000/redoc">http://localhost:8000/redoc</a>
- OpenAPI JSON: <a href="http://localhost:8000/openapi.json">http://localhost:8000/openapi.json</a>

Use these endpoints for:

- curl
- API tests
- k6
- JMeter
- Gatling

## Documentation

The docs site is organized into four learning tracks:

- ProjectTrace
- JMeter
- k6
- Gatling

Start here:

- <a href="https://toolstackhq.github.io/projecttrace/">ProjectTrace docs home</a>
- <a href="https://toolstackhq.github.io/projecttrace/05-jmeter-guide">JMeter guide</a>
- <a href="https://toolstackhq.github.io/projecttrace/04-k6-guide">k6 guide</a>
- <a href="https://toolstackhq.github.io/projecttrace/10-gatling-guide">Gatling guide</a>

## Performance Testing

The performance material lives under `tests/performance`.

### k6

Run a quick smoke check:

```bash
make k6-report PLAN=smoke-test.js
```

Run a longer steady-load test:

```bash
make k6-load-report
```

Open the HTML report:

```bash
make k6-report-open PLAN=smoke-test.js
```

### JMeter

Run a quick smoke check:

```bash
make jmeter-report PLAN=smoke-test.jmx
```

Run a longer steady-load test:

```bash
make jmeter-load-report
```

Open the HTML report:

```bash
make jmeter-report-open PLAN=smoke-test.jmx
```

### Gatling

Run a quick smoke check:

```bash
make gatling-report GATLING_PLAN=smoke-test.gatling.js
```

Run a longer steady-load test:

```bash
make gatling-load-report
```

Open the HTML report:

```bash
make gatling-report-open GATLING_PLAN=smoke-test.gatling.js
```

### Workload Types

- Smoke: prove the app is wired correctly.
- Load: hold expected traffic steady.
- Volume: expose data-size problems.
- Spike: test sudden bursts.
- Stress: push past expected capacity.
- Soak: hold load for a long time.

## Project Structure

- `backend/` FastAPI app, SQLAlchemy models, Alembic migrations, and backend tests
- `frontend/` React + Vite app
- `docs/` VitePress learning site
- `tests/performance/` k6, JMeter, and Gatling assets
- `docker-compose.yml` local stack for app and test tooling
- `Makefile` one-command developer and perf workflow

## Why This App Exists

ProjectTrace is designed to be a realistic learning target for performance testing.
It gives you:

- normal CRUD traffic
- search and filter flows
- detail pages with linked entities
- activity logs and summary endpoints
- a data model large enough to make performance problems visible later

## Next Learning Steps

1. Learn the app workflow first.
2. Run the smoke tests.
3. Run steady load tests.
4. Read the HTML reports and compare percentiles.
5. Introduce bottlenecks one at a time and measure the impact.

## Contributing

The repo is set up for incremental improvements. Keep changes simple, documented, and easy to measure.

## License

MIT. See the repository <a href="https://github.com/toolstackhq/projecttrace/blob/main/LICENSE">LICENSE</a>.
