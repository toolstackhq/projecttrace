# Architecture

## App Structure

ProjectTrace uses a simple split:

- `backend/` FastAPI application, models, schemas, routers, Alembic, seed scripts
- `frontend/` React + Vite application with route-based pages
- `tests/performance/` k6 scripts and JMeter material
- `docs/` setup, API, performance, and roadmap guidance

## Backend Structure

- `app/core/` config, database session, request logging
- `app/models/` SQLAlchemy tables and enums
- `app/schemas/` Pydantic request and response models
- `app/routers/` REST endpoints by domain
- `app/services/` reusable query, relation, and activity helpers
- `app/scripts/` seed and reset commands

## Frontend Structure

- App shell with left navigation and global search
- List/detail routes for the main domains
- Shared components for tables, badges, dialogs, filters, and layout
- React Router for navigation

## Database Schema

Core tables:

- users
- projects
- epics
- features
- requirements
- test_cases
- test_runs
- bugs
- comments
- activity_logs
- pull_request_links

Join tables:

- requirements_test_cases
- requirements_bugs

## Why This App Is Useful For Performance Testing

ProjectTrace has the kinds of patterns that make real performance work meaningful:

- dashboard aggregation
- list pages with filtering and search
- many-to-many relationships
- detail pages with linked records
- comment-heavy defect tracking
- activity logging and summary queries

That means you can introduce or remove bottlenecks later and measure the effect cleanly.
