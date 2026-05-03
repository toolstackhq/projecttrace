# API Guide

All endpoints are served under `/api` unless noted otherwise.

ProjectTrace is intentionally API-first. The browser UI is a client of the same REST endpoints that
you can use for curl, Postman, k6, JMeter, and automated API tests.

OpenAPI access:

- Swagger UI: `/docs`
- ReDoc: `/redoc`
- OpenAPI JSON: `/openapi.json`

## Health

- `GET /health`

## Authentication

- `GET /api/auth/status`
- `POST /api/auth/login`
- `GET /api/auth/me`

All authenticated API requests use `Authorization: Bearer <token>`.

## Summary

- `GET /api/stats/summary`

## Users

- `POST /api/users`
- `GET /api/users`
- `GET /api/users/{id}`

Example:

```json
{
  "name": "Ava Chen",
  "email": "ava.chen@example.com",
  "password": "ProjectTrace123!",
  "role": "EDITOR"
}
```

## Projects

- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/{id}`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`
- `GET /api/projects/{project_id}/activity`

## Epics

- `POST /api/epics`
- `GET /api/epics`
- `GET /api/epics/{id}`
- `PUT /api/epics/{id}`
- `DELETE /api/epics/{id}`

## Features

- `POST /api/features`
- `GET /api/features`
- `GET /api/features/{id}`
- `PUT /api/features/{id}`
- `DELETE /api/features/{id}`

## Requirements

- `POST /api/requirements`
- `GET /api/requirements`
- `GET /api/requirements/{id}`
- `PUT /api/requirements/{id}`
- `DELETE /api/requirements/{id}`
- `POST /api/requirements/{id}/test-cases/{test_case_id}`
- `DELETE /api/requirements/{id}/test-cases/{test_case_id}`
- `POST /api/requirements/{id}/bugs/{bug_id}`
- `DELETE /api/requirements/{id}/bugs/{bug_id}`

## Test Cases

- `POST /api/test-cases`
- `GET /api/test-cases`
- `GET /api/test-cases/{id}`
- `PUT /api/test-cases/{id}`
- `DELETE /api/test-cases/{id}`

Test case fields include:

- `automation_status`
- `automated_test_name`
- `automation_linked_at`

## Test Runs

- `POST /api/test-runs`
- `GET /api/test-runs`
- `GET /api/test-runs/{id}`
- `PUT /api/test-runs/{id}`

Test runs are execution records. They store:

- project
- test case
- status
- executed_by
- executed_at

## Bugs

- `POST /api/bugs`
- `GET /api/bugs`
- `GET /api/bugs/{id}`
- `PUT /api/bugs/{id}`
- `DELETE /api/bugs/{id}`
- `POST /api/bugs/{bug_id}/comments`
- `GET /api/bugs/{bug_id}/comments`

## Comments

- `DELETE /api/comments/{id}`

## Activity

- `GET /api/activity`
- `GET /api/projects/{project_id}/activity`

Activity filters:

- `project_id`
- `entity_type`
- `entity_id`
- `action`
- `user_id`

Example:

```text
/api/activity?entity_type=Requirement&entity_id=42&page=1&page_size=20
```

## Pagination

List endpoints accept:

- `page`
- `page_size`
- `search` on bugs, requirements, test cases, and projects
- `sort` and `order` where useful
- resource-specific filters such as `project_id`, `status`, `priority`, `severity`, `assignee_id`, `executed_by`

Example:

```text
/api/bugs?search=login&page=1&page_size=20&status=OPEN&severity=HIGH
```

## Response Shape

Paged lists return:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "page_size": 20,
  "pages": 0
}
```
