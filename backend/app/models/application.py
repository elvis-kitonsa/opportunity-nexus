from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Enum, Float, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.enums import ApplicationStatus

if TYPE_CHECKING:
    from app.models.job import Job
    from app.models.profiles import SeekerProfile


class Application(Base):
    """A seeker's application to a job listing."""

    __tablename__ = "applications"
    __table_args__ = (
        UniqueConstraint("job_id", "seeker_profile_id", name="uq_application_job_seeker"),
    )

    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"), index=True, nullable=False
    )
    seeker_profile_id: Mapped[int] = mapped_column(
        ForeignKey("seeker_profiles.id", ondelete="CASCADE"), index=True, nullable=False
    )

    cover_letter: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, name="application_status"),
        default=ApplicationStatus.APPLIED,
        nullable=False,
    )

    # Match score snapshot at the time of application (0-100), so the employer's
    # ranking is stable even if the seeker later edits their skills.
    match_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    job: Mapped["Job"] = relationship(back_populates="applications")
    seeker: Mapped["SeekerProfile"] = relationship(back_populates="applications")
