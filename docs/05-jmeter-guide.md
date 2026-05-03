# JMeter Zero to Hero

For the practical definitions of smoke, load, volume, spike, stress, and soak tests, see
`docs/09-performance-test-types.md`.

## Read This First

If you are new to JMeter, read this page in this order:

1. What JMeter is and why people still use it
2. How a test plan is structured
3. How ProjectTrace plans map to real API endpoints
4. How to run a smoke test in Docker
5. How to run a longer load test
6. How to read the HTML report

### 1. What JMeter Is And Why People Still Use It

JMeter is a GUI-first performance testing tool. People still use it because it is easy to
understand visually, it handles HTTP and API flows well, and it has a long history in teams that
need repeatable load tests without writing a lot of code first.

For a beginner, the value of JMeter is not that it is fashionable. The value is that it shows the
full test structure in one place:

- what users are doing
- which endpoints are being called
- what data is being sent
- where timings and assertions are checked

That makes it a good tool for learning performance testing step by step.

### 2. How A Test Plan Is Structured

Think of a JMeter test plan as a tree:

- Test Plan: the whole scenario
- Thread Group: the virtual users and timing
- Config Elements: shared settings such as host names, headers, and CSV data
- Samplers: the actual requests being sent
- Timers: delays or think time between requests
- Assertions: checks that the response is correct
- Listeners: the places where results are collected and visualized

If you understand that tree, you can read almost any JMeter plan.

### 3. How ProjectTrace Plans Map To Real API Endpoints

ProjectTrace is a real CRUD app, so each JMeter plan maps to normal API behavior:

- dashboard loads use `GET /api/stats/summary`
- list pages use `GET /api/projects`, `GET /api/bugs`, `GET /api/requirements`, and similar endpoints
- create flows use `POST` endpoints such as `POST /api/bugs`
- updates use `PUT /api/...`
- link and unlink actions use the relationship endpoints

That means you are not testing a fake toy endpoint. You are testing the same kinds of reads and writes a web app uses every day.

### 4. How To Run A Smoke Test In Docker

The smoke test is the fastest check. It proves the backend is reachable, the auth path works, and
the core endpoints respond correctly.

Run it from the repo root:

```bash
make jmeter-report PLAN=smoke-test.jmx
```

The command will:

- start the backend if needed
- make sure the canonical perf user exists
- run the JMeter plan in Docker
- generate an HTML report in `reports/jmeter/latest/`

### 5. How To Run A Longer Load Test

The load test is the one you use when you want to hold traffic steady for longer and see how the
app behaves over time.

Run it with:

```bash
make jmeter-load-report
```

Use this when you want to learn about:

- steady throughput
- response time drift
- error rate under sustained traffic
- whether the app stays stable long enough to matter

### 6. How To Read The HTML Report

Open `reports/jmeter/latest/index.html` after a run and look for:

- the error percentage
- average and percentile latency
- throughput
- sampler failures
- whether response time rises as load increases

If throughput stays flat but latency rises, the app is usually queueing work or waiting on a slow
resource. If errors rise along with latency, you are likely near or beyond capacity.

## Install

- Download Apache JMeter from the official site
- Run `bin/jmeter` on macOS/Linux or `bin/jmeter.bat` on Windows
- Or use the Dockerized JMeter service in this repo and skip local installation on Linux

## Build a Test Plan

Recommended layout:

- Test Plan
- Thread Group
- HTTP Request Defaults
- HTTP Header Manager
- CSV Data Set Config
- HTTP Samplers
- Timers
- Assertions
- Listeners

ProjectTrace ships runnable JMeter plans in:

- `tests/performance/jmeter/plans/smoke-test.jmx`
- `tests/performance/jmeter/plans/baseline-load-test.jmx`
- `tests/performance/jmeter/plans/volume-test.jmx`
- `tests/performance/jmeter/plans/crud-workflow-test.jmx`
- `tests/performance/jmeter/plans/search-filter-test.jmx`
- `tests/performance/jmeter/plans/spike-test.jmx`
- `tests/performance/jmeter/plans/stress-test.jmx`
- `tests/performance/jmeter/plans/soak-test-template.jmx`

## Thread Groups

Use different thread groups for:

- dashboard load
- bugs list
- bug CRUD
- requirements list
- requirement CRUD
- test case CRUD
- test run creation
- mixed journeys

## HTTP Samplers

Map each sampler to a real API endpoint such as:

- `GET /api/stats/summary`
- `GET /api/bugs`
- `POST /api/bugs`
- `POST /api/bugs/{id}/comments`

## CSV Data Set Config

Use CSV files for reusable IDs or payload values:

- project IDs
- user IDs
- test case IDs
- search terms

The generated ProjectTrace plans authenticate with the seeded admin account by default:

- email: `admin@projecttrace.dev`
- password: `ProjectTrace123!`

## Timers

Add think time with:

- Constant Timer
- Uniform Random Timer

## Assertions

Use:

- Response Code Assertion
- JSON Assertion
- Duration Assertion

## Listeners

Useful listeners:

- Summary Report
- Aggregate Report
- View Results Tree for debugging only
- HTML Report generation for final runs

## CLI Run

```bash
docker compose --profile perf run --rm jmeter -n -t test-plan.jmx -l reports/jmeter/latest/results.jtl -e -o reports/jmeter/latest
```

## HTML Reports

```bash
docker compose --profile perf run --rm jmeter -n -t test-plan.jmx -l reports/jmeter/latest/results.jtl -e -o reports/jmeter/latest
```

If you want one command from the repo root, use:

```bash
make jmeter-report PLAN=smoke-test.jmx
make jmeter-report-open PLAN=smoke-test.jmx
```

The Docker wrapper recreates the report directory before JMeter starts, so you do not need to
pre-create `reports/jmeter/latest`.

The Docker plans target the backend service inside Compose by default:

- host: `backend`
- port: `8000`
- protocol: `http`

If you run JMeter locally against a non-Docker backend, override the host with `-JbaseHost=localhost`.

The repo also runs a small backend bootstrap before the perf target so the canonical login user
exists even if the database already has other test data.

## Major Test Types

- Smoke: a quick authenticated sanity check
- Load: expected steady traffic
- Volume: large page sizes and detail reads over the seeded data set
- Spike: sudden bursts and recovery
- Stress: push past the expected limit
- Soak: long-running steady load to catch drift

## Reading Reports

Watch:

- response time percentiles
- throughput
- error percentage
- active threads over time
- response codes and sampler failures
