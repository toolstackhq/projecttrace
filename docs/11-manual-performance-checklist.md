# Manual Performance Checklist

This is a human-friendly checklist, not a replacement for k6, JMeter, or Gatling.
Use it when you want to understand the app flow before you run a load test, or when you want to
sanity-check a new baseline against the seeded ProjectTrace data.

## Why This Exists

Automated performance tests tell you numbers.
This checklist tells you what those numbers are actually measuring.

Use it to:

- learn the app flow before testing
- reproduce a bad result manually
- confirm the seeded data and login still work
- explain a performance run to someone new

## How To Use It

For each scenario:

1. Make sure the seeded backend is running.
2. Log in with the canonical perf account.
3. Walk the steps once by hand.
4. Compare the feel of the app with the automated report later.

## Scenarios

### 1. Login And Open Dashboard

| Field | Value |
| --- | --- |
| Preconditions | ProjectTrace backend is up and the seeded perf user exists. |
| Steps | Log in, open the dashboard, and wait for the summary cards and recent activity. |
| Expected result | Login succeeds and the dashboard loads without errors. |
| Baseline target | Login p95 under 1 second, dashboard summary p95 under 750 ms. |
| Automated coverage | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/smoke-test.js">k6 smoke</a>, <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/jmeter/plans/smoke-test.jmx">JMeter smoke</a>, <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/gatling/src/smoke-test.gatling.js">Gatling smoke</a> |

### 2. Browse Bugs

| Field | Value |
| --- | --- |
| Preconditions | Logged in on a seeded dataset. |
| Steps | Open Bugs, apply a normal filter, and open a bug detail page. |
| Expected result | The list loads quickly and the detail view opens cleanly. |
| Baseline target | Bugs list p95 under 750 ms, bug detail should stay comfortable under the same baseline feel. |
| Automated coverage | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/baseline-load-test.js">k6 baseline</a>, <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/jmeter/plans/baseline-load-test.jmx">JMeter baseline</a>, <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/gatling/src/baseline-load-test.gatling.js">Gatling baseline</a> |

### 3. Create A Bug And Add A Comment

| Field | Value |
| --- | --- |
| Preconditions | Logged in with a user that can create and edit bugs. |
| Steps | Create a bug, update its status or severity, then add a comment. |
| Expected result | The bug is saved, updated, and the comment appears. |
| Baseline target | Create bug p95 under 1 second. |
| Automated coverage | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/crud-workflow-test.js">k6 CRUD</a>, <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/jmeter/plans/crud-workflow-test.jmx">JMeter CRUD</a>, <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/gatling/src/crud-workflow-test.gatling.js">Gatling CRUD</a> |

### 4. Open A Requirement And Link A Test Case

| Field | Value |
| --- | --- |
| Preconditions | Logged in and the seeded requirements/test cases exist. |
| Steps | Open a requirement, inspect its linked feature and epic, then link a test case. |
| Expected result | The requirement detail page shows the relationship and the link action succeeds. |
| Baseline target | View requirement detail p95 under 1 second, create test run p95 under 1 second. |
| Automated coverage | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/volume-test.js">k6 volume</a>, <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/jmeter/plans/volume-test.jmx">JMeter volume</a>, <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/gatling/src/volume-test.gatling.js">Gatling volume</a> |

### 5. Search And Filter

| Field | Value |
| --- | --- |
| Preconditions | Seeded data is present across projects, requirements, test cases, and bugs. |
| Steps | Search bugs, requirements, test cases, and projects using a few different filters. |
| Expected result | Results narrow correctly and remain responsive. |
| Baseline target | Search-heavy reads should stay in the same baseline band as the list endpoints. |
| Automated coverage | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/search-filter-test.js">k6 search</a>, <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/jmeter/plans/search-filter-test.jmx">JMeter search</a>, <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/gatling/src/search-filter-test.gatling.js">Gatling search</a> |

### 6. Run A Longer Load Session

| Field | Value |
| --- | --- |
| Preconditions | Smoke has already passed. |
| Steps | Run the longer load scenario and keep an eye on the HTML report. |
| Expected result | The app stays stable, percentiles stay within the baseline, and errors remain low. |
| Baseline target | Steady load should hold the target p95 values defined in the baseline guide. |
| Automated coverage | <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/k6/baseline-load-test.js">k6 baseline</a>, <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/jmeter/plans/baseline-load-test.jmx">JMeter baseline</a>, <a href="https://github.com/toolstackhq/projecttrace/blob/main/tests/performance/gatling/src/baseline-load-test.gatling.js">Gatling baseline</a> |

## Notes For Beginners

- Smoke is the first check.
- Load is the normal steady run.
- Volume is about data size.
- Spike is a short burst.
- Stress is past the limit.
- Soak is long and steady.

If you can walk through the checklist manually, the automated reports will make more sense.
