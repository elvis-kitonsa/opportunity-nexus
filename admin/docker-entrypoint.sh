#!/usr/bin/env bash
set -e

echo "Waiting for Postgres at ${POSTGRES_HOST:-db}:${POSTGRES_PORT:-5432}..."
python - <<'PY'
import os, time
import psycopg2

cfg = dict(
    host=os.getenv("POSTGRES_HOST", "db"),
    port=int(os.getenv("POSTGRES_PORT", "5432")),
    user=os.getenv("POSTGRES_USER", "nexus"),
    password=os.getenv("POSTGRES_PASSWORD", ""),
    dbname=os.getenv("POSTGRES_DB", "opportunity_nexus"),
)
for attempt in range(30):
    try:
        psycopg2.connect(**cfg).close()
        print("Postgres is ready.")
        break
    except psycopg2.OperationalError:
        print(f"  not ready yet (attempt {attempt + 1}/30)...")
        time.sleep(2)
else:
    raise SystemExit("Postgres did not become ready in time.")
PY

# Apply Django's own migrations (admin/auth/sessions). The business tables are
# unmanaged and owned by the backend's Alembic migrations.
echo "Applying Django migrations..."
python manage.py migrate --noinput

python manage.py collectstatic --noinput

# Optionally create an admin superuser on first boot.
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    echo "Ensuring superuser '$DJANGO_SUPERUSER_USERNAME' exists..."
    python manage.py createsuperuser --noinput || true
fi

exec "$@"
