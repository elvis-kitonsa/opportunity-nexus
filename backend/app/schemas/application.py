from pydantic import BaseModel, ConfigDict

from app.models.enums import ApplicationStatus
from app.schemas.job import JobRead
from app.schemas.profile import SeekerProfileRead


class ApplicationCreate(BaseModel):
    job_id: int
    cover_letter: str | None = None


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: ApplicationStatus
    cover_letter: str | None = None
    match_score: float | None = None
    job: JobRead


class ApplicantRead(BaseModel):
    """An application as seen by the employer — focuses on the candidate."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    status: ApplicationStatus
    cover_letter: str | None = None
    match_score: float | None = None
    seeker: SeekerProfileRead
