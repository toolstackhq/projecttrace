# Performance Baseline

## Goal

Create a clean baseline before any bottlenecks are introduced.

## What Baseline Means

A baseline is the agreed starting point for performance.

In a real team, business owners usually define it as a set of expectations such as:

- how long key pages should take
- how many users or requests the app should handle
- what error rate is acceptable
- what "good enough" looks like for the current release

It is not a single universal number. It is a measured reference point.

For ProjectTrace, a sensible starting baseline is:

- smoke checks pass reliably
- dashboard and list endpoints stay fast under moderate concurrency
- p95 latency stays stable enough to compare later runs against it
- error rate stays near zero
- the same dataset size is used each time

More concrete starter targets for the seeded local stack are:

| Action | Starter target |
| --- | --- |
| Login | p95 under 1 second |
| Dashboard summary | p95 under 750 ms |
| List bugs | p95 under 750 ms |
| Create bug | p95 under 1 second |
| View requirement detail | p95 under 1 second |
| Create test run | p95 under 1 second |

If your business asks for a baseline, they usually mean:

1. run the same workload against a known-good build
2. record the current p50, p90, p95, p99, throughput, and errors
3. treat those numbers as the comparison point for future testing

That is how you know whether a later change made the app better or worse.

## Recommended Runs

- `k6` smoke test
- `k6` baseline load test
- `k6` CRUD workflow test
- `k6` search/filter test
- JMeter dashboard and list/test workflow plans

## Metrics To Capture

- p50, p90, p95, p99
- throughput
- error rate
- CPU
- memory
- database connections
- query latency
- response payload size

## Acceptance Criteria

Example baseline targets:

- dashboard renders quickly under moderate concurrency
- list endpoints stay responsive with pagination
- CRUD endpoints complete without error spikes
- tail latency stays within a tight range
- summary endpoint does not dominate backend time

## Comparison Method

When a future bottleneck is introduced:

1. run the same scenario
2. keep the same dataset size
3. compare percentiles, throughput, and errors
4. inspect the backend and database metrics
5. record the result in the template
