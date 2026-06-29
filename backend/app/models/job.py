from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.enums import EmploymentType, ExperienceLevel, JobStatus

if TYPE_CHECKING:
    from app.models.application import Application
    from app.models.profiles import EmployerProfile
    from app.models.skill import JobSkill


class Job(Base):
    """A job listing posted by an employer."""

    __tablename__ = "jobs"

    employer_profile_id: Mapped[int] = mapped_column(
        ForeignKey("employer_profiles.id", ondelete="CASCADE"), index=True, nullable=False
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)

    employment_type: Mapped[EmploymentType] = mapped_column(
        Enum(EmploymentType, name="employment_type"),
        default=EmploymentType.FULL_TIME,
        nullable=False,
    )
    experience_level: Mapped[ExperienceLevel] = mapped_column(
        Enum(ExperienceLevel, name="experience_level"),
        default=ExperienceLevel.ENTRY,
        nullable=False,
    )
    min_experience_years: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    status: Mapped[JobStatus] = mapped_column(
        Enum(JobStatus, name="job_status"), default=JobStatus.PENDING_REVIEW, nullable=False
    )

    employer: Mapped["EmployerProfile"] = relationship(back_populates="jobs")
    skills: Mapped[list["JobSkill"]] = relationship(
        back_populates="job", cascade="all, delete-orphan"
    )
    applications: Mapped[list["Application"]] = relationship(
        back_populates="job", cascade="all, delete-orphan"
    )
