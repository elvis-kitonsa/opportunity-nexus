import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.skill import Skill

_slug_re = re.compile(r"[^a-z0-9]+")


def slugify(name: str) -> str:
    return _slug_re.sub("-", name.strip().lower()).strip("-")


def get_or_create_skill(db: Session, name: str) -> Skill:
    """Resolve a skill by its normalised slug, creating it if it doesn't exist.

    New skills are created on demand so seekers/employers can type free-form
    skills; admins can later curate/merge them in Django.
    """
    slug = slugify(name)
    skill = db.scalar(select(Skill).where(Skill.slug == slug))
    if skill is None:
        skill = Skill(name=name.strip(), slug=slug)
        db.add(skill)
        db.flush()  # assign an id without committing the outer transaction
    return skill
