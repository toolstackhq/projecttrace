# Performance Test Types

ProjectTrace includes several major test types so you can see how a CRUD web app behaves under different traffic patterns.
The same ideas are demonstrated with k6, JMeter, and Gatling so you can compare tools, not just theory.

## Quick Map

| Test | What it does | When to use it | Netflix-style example |
| --- | --- | --- | --- |
| Smoke | Runs a tiny authenticated flow to prove the app and test data are wired correctly. | Before every other test. | Open the Netflix home page, sign in, and confirm browse/search still works. |
| Load | Runs expected, steady traffic to measure normal performance. | Baseline capacity checks. | Many viewers browse rows of titles and open details during normal evening traffic. |
| Volume | Uses larger page sizes and larger data reads to expose data-scale issues. | When data size matters more than user count. | A huge content catalog and search-heavy browsing should still feel fast. |
| Spike | Jumps from low traffic to high traffic very quickly. | To test sudden bursts and recovery. | A new trailer drops and thousands of viewers rush the app at once. |
| Stress | Pushes the app past expected capacity until errors or latency rise. | To find the breaking point. | A launch-night rush goes beyond capacity and the service starts degrading. |
| Soak | Holds the app under steady load for a long time. | To catch leaks, drift, and connection issues. | Overnight viewing and browsing keeps running for hours without memory drift. |

## What Each One Means

### Smoke

Smoke tests are short and cheap. They answer one question: does the app still respond correctly after login?

For ProjectTrace, smoke usually hits:

- `/health`
- `/api/stats/summary`
- one or two list endpoints

Use it as a preflight check before any longer test.

### Load

Load tests simulate expected day-to-day use.

For ProjectTrace, that means:

- dashboard reads
- bugs list reads
- requirements list reads
- test case list reads

This tells you the latency and throughput you can expect during normal operation.

### Volume

Volume tests focus on data size, not just user count.

For ProjectTrace, that means:

- larger page sizes
- detail pages that join related entities
- searches and filters over a bigger data set

This is the test that exposes slow queries, missing indexes, and oversized responses.

### Spike

Spike tests increase traffic very quickly, then drop it back down.

This helps you see:

- how fast the app degrades
- whether it recovers cleanly
- whether queueing or connection pooling breaks under sudden bursts

### Stress

Stress tests keep pushing until the app starts failing.

This tells you:

- where the breaking point is
- which endpoints fail first
- whether latency rises before errors do

### Soak

Soak tests run for a long time at a steady rate.

This helps detect:

- memory leaks
- connection leaks
- slow database growth
- gradual latency drift

## How To Read The Results

Focus on:

- `p95` and `p99` latency
- error rate
- throughput
- whether the app stays stable over time

If latency rises but errors stay low, you probably have queueing or inefficient queries.
If errors rise suddenly, you probably hit a resource limit or a bad failure path.

## ProjectTrace File Map

### k6

- `tests/performance/k6/smoke-test.js`
- `tests/performance/k6/baseline-load-test.js`
- `tests/performance/k6/volume-test.js`
- `tests/performance/k6/crud-workflow-test.js`
- `tests/performance/k6/search-filter-test.js`
- `tests/performance/k6/spike-test.js`
- `tests/performance/k6/stress-test.js`
- `tests/performance/k6/soak-test-template.js`

### JMeter

- `tests/performance/jmeter/plans/smoke-test.jmx`
- `tests/performance/jmeter/plans/baseline-load-test.jmx`
- `tests/performance/jmeter/plans/volume-test.jmx`
- `tests/performance/jmeter/plans/crud-workflow-test.jmx`
- `tests/performance/jmeter/plans/search-filter-test.jmx`
- `tests/performance/jmeter/plans/spike-test.jmx`
- `tests/performance/jmeter/plans/stress-test.jmx`
- `tests/performance/jmeter/plans/soak-test-template.jmx`

### Gatling

- `tests/performance/gatling/src/smoke-test.gatling.js`
- `tests/performance/gatling/src/baseline-load-test.gatling.js`
- `tests/performance/gatling/src/volume-test.gatling.js`
- `tests/performance/gatling/src/crud-workflow-test.gatling.js`
- `tests/performance/gatling/src/search-filter-test.gatling.js`
- `tests/performance/gatling/src/spike-test.gatling.js`
- `tests/performance/gatling/src/stress-test.gatling.js`
- `tests/performance/gatling/src/soak-test-template.gatling.js`

## Rule Of Thumb

- Smoke: prove the app works.
- Load: prove the app can handle normal traffic.
- Volume: prove the app can handle lots of data.
- Spike: prove the app can survive sudden bursts.
- Stress: prove the app fails gracefully.
- Soak: prove the app stays healthy over time.
