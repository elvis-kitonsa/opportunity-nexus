#!/usr/bin/env bash
set -e

# Wait for Postgres to accept connections before running migrations.
echo "Waiting for Postgres at ${POSTGRES_HOST:-db}:${POSTGRES_PORT:-5432}..."
python - <<'PY'
import os, time
import psycopg2

host = os.getenv("POSTGRES_HOST", "db")
port = int(os.getenv("POSTGRES_PORT", "5432"))
user = os.getenv("POSTGRES_USER", "nexus")
password = os.getenv("POSTGRES_PASSWORD", "")
dbname = os.getenv("POSTGRES_DB", "opportunity_nexus")

for attempt in range(30):
    try:
        psycopg2.connect(host=host, port=port, user=user, password=password, dbname=dbname).close()
        print("Postgres is ready.")
        break
    except psycopg2.OperationalError:
        print(f"  not ready yet (attempt {attempt + 1}/30)...")
        time.sleep(2)
else:
    raise SystemExit("Postgres did not become ready in time.")
PY

# Apply version-controlled migrations. The schema is owned by the committed
# Alembic revisions (see alembic/versions/), so we never autogenerate at runtime.
echo "Applying migrations..."
alembic upgrade head

exec "$@"
