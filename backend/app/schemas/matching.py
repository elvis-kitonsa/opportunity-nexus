from pydantic import BaseModel

from app.schemas.job import JobRead
from app.schemas.profile import SeekerProfileRead


class MatchBreakdown(BaseModel):
    """Explains how a match score was reached, for transparency in the UI."""

    matched_skills: list[str]
    missing_required_skills: list[str]
    missing_optional_skills: list[str]


class JobMatch(BaseModel):
    """A job ranked for a seeker."""

    job: JobRead
    match_score: float
    breakdown: MatchBreakdown


class CandidateMatch(BaseModel):
    """A seeker ranked for a job."""

    seeker: SeekerProfileRead
    match_score: float
    breakdown: MatchBreakdown
