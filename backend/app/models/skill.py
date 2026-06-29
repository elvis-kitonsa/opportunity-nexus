from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.job import Job
    from app.models.profiles import SeekerProfile


class Skill(Base):
    """A canonical skill. The skill catalogue is curated via the Django admin."""

    __tablename__ = "skills"

    name: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    # Normalised lookup key (lowercased) so "React.js" and "react.js" collapse together.
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    category: Mapped[str | None] = mapped_column(String(80), nullable=True)


class SeekerSkill(Base):
    """Association object: a skill a seeker claims, with self-rated proficiency (1-5)."""

    __tablename__ = "seeker_skills"
    __table_args__ = (UniqueConstraint("seeker_profile_id", "skill_id", name="uq_seeker_skill"),)

    seeker_profile_id: Mapped[int] = mapped_column(
        ForeignKey("seeker_profiles.id", ondelete="CASCADE"), index=True, nullable=False
    )
    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False
    )
    proficiency: Mapped[int] = mapped_column(Integer, default=3, nullable=False)

    skill: Mapped["Skill"] = relationship()
    seeker: Mapped["SeekerProfile"] = relationship(back_populates="skills")


class JobSkill(Base):
    """Association object: a skill a job requires, with importance (1-5) and whether
    it is mandatory. These two attributes drive the matching engine's weighting."""

    __tablename__ = "job_skills"
    __table_args__ = (UniqueConstraint("job_id", "skill_id", name="uq_job_skill"),)

    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"), index=True, nullable=False
    )
    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False
    )
    importance: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    skill: Mapped["Skill"] = relationship()
    job: Mapped["Job"] = relationship(back_populates="skills")
