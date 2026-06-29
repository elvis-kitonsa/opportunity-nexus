from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.application import Application
    from app.models.institution import Institution
    from app.models.job import Job
    from app.models.skill import SeekerSkill
    from app.models.user import User


class SeekerProfile(Base):
    """Profile for a job seeker (student / fresh graduate)."""

    __tablename__ = "seeker_profiles"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    headline: Mapped[str | None] = mapped_column(String(255), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)

    github_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    portfolio_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Education
    institution_id: Mapped[int | None] = mapped_column(
        ForeignKey("institutions.id", ondelete="SET NULL"), nullable=True
    )
    field_of_study: Mapped[str | None] = mapped_column(String(255), nullable=True)
    graduation_year: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # True once the account email matched a verified institution domain.
    is_institution_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped["User"] = relationship(back_populates="seeker_profile")
    institution: Mapped["Institution | None"] = relationship(back_populates="seekers")
    skills: Mapped[list["SeekerSkill"]] = relationship(
        back_populates="seeker", cascade="all, delete-orphan"
    )
    applications: Mapped[list["Application"]] = relationship(
        back_populates="seeker", cascade="all, delete-orphan"
    )


class EmployerProfile(Base):
    """Profile for an employer (company / recruiter)."""

    __tablename__ = "employer_profiles"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    company_website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Set by admin moderation in Django. Only verified employers' jobs are trusted.
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped["User"] = relationship(back_populates="employer_profile")
    jobs: Mapped[list["Job"]] = relationship(
        back_populates="employer", cascade="all, delete-orphan"
    )
