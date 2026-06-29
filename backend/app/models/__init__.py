"""Import all models here so that Alembic's autogenerate and SQLAlchemy's mapper
configuration can see them via a single import of `app.models`."""

from app.db.base_class import Base
from app.models.application import Application
from app.models.enums import (
    ApplicationStatus,
    EmploymentType,
    ExperienceLevel,
    JobStatus,
    UserRole,
)
from app.models.institution import Institution
from app.models.job import Job
from app.models.profiles import EmployerProfile, SeekerProfile
from app.models.skill import JobSkill, SeekerSkill, Skill
from app.models.user import User

__all__ = [
    "Base",
    "User",
    "UserRole",
    "Institution",
    "SeekerProfile",
    "EmployerProfile",
    "Skill",
    "SeekerSkill",
    "JobSkill",
    "Job",
    "Application",
    "EmploymentType",
    "ExperienceLevel",
    "JobStatus",
    "ApplicationStatus",
]
