# Opportunity Nexus

Opportunity Nexus is an intelligent two-sided job matching platform built for
entry-level candidates from universities and technical institutions. Job seekers
build verified profiles with skills, GitHub portfolios, and education
backgrounds. Employers post listings with required skill criteria. A
FastAPI-powered matching engine scores and ranks candidates against listings — so
employers find the right graduate, and graduates find roles that actually match
what they've built.

Built with React + TypeScript, FastAPI, Django, and PostgreSQL.

---

## Architecture

```
                ┌──────────────────────┐
                │   React + TS (Vite)  │   seekers & employers
                │   Tailwind · Query   │
                └──────────┬───────────┘
                           │  REST (JWT)
                ┌──────────▼───────────┐
                │   FastAPI backend    │   core API + matching engine + auth
                │   SQLAlchemy/Alembic │
                └──────────┬───────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │            PostgreSQL                │   single shared database
        └──────────────────▲──────────────────┘
                           │
                ┌──────────┴───────────┐
                │    Django admin      │   institutions · moderation · analytics
                └──────────────────────┘
```

- **FastAPI** owns the database schema via **Alembic** migrations.
- **Django** shares the same database. It manages only its own admin/auth tables;
  the business tables are mapped as `managed = False` models, so there is a single
  source of truth for the schema.

## Tech stack

| Layer     | Technology                                                        |
| --------- | ----------------------------------------------------------------- |
| Frontend  | React + TypeScript, Vite, Tailwind CSS, TanStack React Query, Axios |
| Backend   | FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, python-jose, passlib |
| Admin     | Django 5                                                          |
| Database  | PostgreSQL 16                                                     |
| Infra     | Docker Compose                                                    |

## The matching engine

The differentiator. It scores how well a seeker fits a job (0–100%) based on
**weighted skill overlap**, and powers both directions: seekers see jobs ranked
by fit, employers see candidates ranked by fit.

For each skill a job requires (with an `importance` weight of 1–5 and a
`required` flag):

- A matched skill earns at least 60% of its importance weight; the remainder
  scales with the seeker's self-rated proficiency (so juniors aren't punished for
  modesty).
- Missing **required** skills apply an additional penalty on top of simply not
  contributing to coverage.

The API returns an **explainable breakdown** (matched / missing-required /
missing-optional skills) so the UI can show *why* a score was reached. See
[`backend/app/services/matching.py`](backend/app/services/matching.py).

## User flows

**Job seekers** — register (auto-verified if their email domain matches an
onboarded institution, e.g. `@mak.ac.ug`), build a profile with skills, GitHub and
education, browse skill-ranked job matches, and apply (match score is snapshotted
at application time).

**Employers** — register (verified by an admin before being trusted), post
listings with weighted skill criteria, and review applicants ranked by match
score plus suggested candidates sourced from the wider seeker pool.

**Admins (Django)** — onboard institutions, verify employers, moderate
(publish/reject) job listings, and curate the skill catalogue.

## Quick start (Docker)

```bash
cp .env.example .env          # adjust secrets for anything non-local
docker compose up --build
```

Services:

| Service      | URL                                  |
| ------------ | ------------------------------------ |
| Frontend     | http://localhost:5173                |
| Backend API  | http://localhost:8000                |
| API docs     | http://localhost:8000/docs           |
| Django admin | http://localhost:8001 (admin / admin_dev_password) |

On first boot the backend autogenerates and applies the initial Alembic
migration, then Django applies its own migrations and bootstraps a superuser.

## Local development (without Docker)

**Backend**

```bash
cd backend
python -m venv .venv && . .venv/Scripts/activate   # on Windows
pip install -r requirements.txt
cp .env.example .env                                # point DATABASE_URL at your Postgres
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

**Admin**

```bash
cd admin
python -m venv .venv && . .venv/Scripts/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8001
```

## API surface (v1, prefix `/api/v1`)

| Router         | Highlights                                                            |
| -------------- | -------------------------------------------------------------------- |
| `auth`         | `register/seeker`, `register/employer`, `login`, `me`               |
| `users`        | seeker & employer profile read/update, institutions list            |
| `jobs`         | CRUD for employers, public published listing, `mine`                |
| `applications` | seeker apply, `mine`, employer applicant list, status updates        |
| `matching`     | `matching/jobs` (for seeker), `matching/candidates/{job_id}` (for employer) |

Full interactive docs at `/docs` when the backend is running.

## Project structure

```
opportunity-nexus/
├── backend/      FastAPI: models, JWT auth, matching engine, Alembic
├── frontend/     Vite + React + TypeScript + Tailwind SPA
├── admin/        Django admin over the shared database
├── docker-compose.yml
└── README.md
```

## Status

Scaffold complete and verified: backend imports and the matching engine ranks
correctly; the frontend type-checks and builds; the Django admin passes system
checks; the compose configuration validates.
