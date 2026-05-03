# Performance Baseline

## Goal

Create a clean baseline before any bottlenecks are introduced.

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

