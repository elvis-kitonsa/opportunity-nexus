"""Seed reference data: institutions and a starter skill catalogue.

Idempotent — safe to run repeatedly. Run from the backend/ directory after the
schema exists (i.e. after `alembic upgrade head`):

    python scripts/seed.py
"""

import os
import sys

# Make `app` importable when this file is run directly.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.institution import Institution
from app.models.skill import Skill
from app.services.skills import slugify

# (name, student email domain, location). Domains are the addresses students
# actually receive — confirm per institution; Makerere students use the
# students.* subdomain.
INSTITUTIONS = [
    ("Makerere University", "students.mak.ac.ug", "Kampala"),
    ("Kyambogo University", "kyu.ac.ug", "Kampala"),
    ("Makerere University Business School", "mubs.ac.ug", "Kampala"),
    ("Mbarara University of Science and Technology", "must.ac.ug", "Mbarara"),
    ("Gulu University", "gu.ac.ug", "Gulu"),
    ("Uganda Christian University", "ucu.ac.ug", "Mukono"),
    ("Busitema University", "busitema.ac.ug", "Tororo"),
    ("Uganda Technical College, Bushenyi", "utcbushenyi.ac.ug", "Bushenyi"),
]

# (name, category)
SKILLS = [
    ("Python", "Programming"),
    ("JavaScript", "Programming"),
    ("TypeScript", "Programming"),
    ("Java", "Programming"),
    ("C++", "Programming"),
    ("C#", "Programming"),
    ("PHP", "Programming"),
    ("Kotlin", "Programming"),
    ("React", "Frontend"),
    ("HTML", "Frontend"),
    ("CSS", "Frontend"),
    ("Tailwind CSS", "Frontend"),
    ("Flutter", "Mobile"),
    ("Node.js", "Backend"),
    ("Django", "Backend"),
    ("FastAPI", "Backend"),
    ("Laravel", "Backend"),
    ("REST APIs", "Backend"),
    ("SQL", "Data"),
    ("PostgreSQL", "Data"),
    ("Data Analysis", "Data"),
    ("Machine Learning", "Data"),
    ("Microsoft Excel", "Data"),
    ("Git", "Tools"),
    ("Docker", "Tools"),
    ("Linux", "Tools"),
    ("Communication", "Soft skills"),
    ("Problem Solving", "Soft skills"),
    ("Teamwork", "Soft skills"),
]


def seed() -> None:
    db = SessionLocal()
    created_institutions = created_skills = 0
    try:
        for name, domain, location in INSTITUTIONS:
            exists = db.scalar(select(Institution).where(Institution.email_domain == domain))
            if not exists:
                db.add(Institution(name=name, email_domain=domain, location=location))
                created_institutions += 1

        for name, category in SKILLS:
            slug = slugify(name)
            exists = db.scalar(select(Skill).where(Skill.slug == slug))
            if not exists:
                db.add(Skill(name=name, slug=slug, category=category))
                created_skills += 1

        db.commit()
        print(f"Seed complete: +{created_institutions} institutions, +{created_skills} skills.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
