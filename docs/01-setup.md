# Setup

## Prerequisites

- Docker and Docker Compose
- Python 3.11+ for local backend work
- Node.js 20+ for local frontend work
- PostgreSQL 16 if you want to run outside Docker

## Docker Setup

1. Copy `.env.example` to `.env` if needed.
2. Start the stack:

```bash
docker compose up --build
```

3. Open the login page in the frontend. If the database is empty, create the first admin account there.

## Run Backend

Backend service:

```bash
cd backend
uvicorn app.main:app --reload
```

## Run Frontend

Frontend service:

```bash
cd frontend
npm install
npm run dev
```

## Migrations

Run Alembic:

```bash
cd backend
alembic upgrade head
```

## Seeding Data

Generate realistic data:

```bash
cd backend
python -m app.scripts.seed
```

Seeded users share the password defined by `SEED_USER_PASSWORD` in `.env` and the first seeded user is an admin.

## Reset Database

Reset from code:

```bash
cd backend
python -m app.scripts.reset_db
```

Or with Compose:

```bash
docker compose down -v
```

## Troubleshooting

- If the backend cannot connect to PostgreSQL, check `DATABASE_URL`.
- If the frontend cannot reach the API, check `VITE_API_BASE_URL` and CORS settings.
- If migrations fail, confirm the database container is healthy.
- If the UI shows empty tables, run the seed script.
