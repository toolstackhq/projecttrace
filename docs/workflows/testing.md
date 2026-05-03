# Testing Workflow

Testing work in ProjectTrace is built around two main objects:

- test cases
- test runs

## Test cases

Test cases define the scenario to execute.

Typical fields:

- title
- description
- priority
- project
- automation status
- automated test name
- automation linked timestamp

Steps:

1. Open `Testing -> Test Cases`.
2. Click `Create test case`.
3. Enter the test case details.
4. Mark whether the case is automated, planned, broken, or not automated.
5. If it is automated, add the automated test name.
6. Save it.
7. Open the detail page to link it to requirements.

## Test runs

Test runs record execution results for a test case. They do not execute the test suite by
themselves. Think of them as the execution history for a test case.

Statuses:

- `PASSED`
- `FAILED`
- `BLOCKED`
- `SKIPPED`

Steps:

1. Open `Testing -> Test Runs`.
2. Click `Record test run`.
3. Select the project and test case.
4. Pick a result status.
5. Save.

## Traceability

Use requirements to connect planning to testing:

- one requirement can link to many test cases
- one test case can support many requirements

That lets you see coverage and execution from both sides.

## API first usage

If you want to drive testing programmatically, use the REST API and OpenAPI docs:

- Swagger UI: `/docs`
- ReDoc: `/redoc`
- CRUD endpoints: `/api/test-cases`, `/api/test-runs`, `/api/requirements`, `/api/bugs`

This is what you should use for k6, JMeter, curl, and automated API tests.
