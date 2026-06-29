from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_db, require_employer, require_seeker
from app.models.enums import JobStatus
from app.models.job import Job
from app.models.profiles import SeekerProfile
from app.models.skill import JobSkill, SeekerSkill
from app.models.user import User
from app.schemas.matching import CandidateMatch, JobMatch, MatchBreakdown
from app.services.matching import MatchResult, score_match

router = APIRouter(prefix="/matching", tags=["matching"])


def _breakdown(result: MatchResult) -> MatchBreakdown:
    return MatchBreakdown(
        matched_skills=result.matched_skills,
        missing_required_skills=result.missing_required_skills,
        missing_optional_skills=result.missing_optional_skills,
    )


@router.get("/jobs", response_model=list[JobMatch])
def match_jobs_for_me(
    current_user: User = Depends(require_seeker),
    db: Session = Depends(get_db),
    limit: int = 20,
) -> list[JobMatch]:
    """Published jobs ranked by how well they fit the current seeker."""
    seeker = db.scalar(
        select(SeekerProfile)
        .where(SeekerProfile.id == current_user.seeker_profile.id)
        .options(selectinload(SeekerProfile.skills).selectinload(SeekerSkill.skill))
    )

    jobs = db.scalars(
        select(Job)
        .where(Job.status == JobStatus.PUBLISHED)
        .options(
            selectinload(Job.employer),
            selectinload(Job.skills).selectinload(JobSkill.skill),
        )
    ).all()

    ranked = []
    for job in jobs:
        result = score_match(job, seeker)
        ranked.append(JobMatch(job=job, match_score=result.score, breakdown=_breakdown(result)))

    ranked.sort(key=lambda m: m.match_score, reverse=True)
    return ranked[: min(limit, 100)]


@router.get("/candidates/{job_id}", response_model=list[CandidateMatch])
def match_candidates_for_job(
    job_id: int,
    current_user: User = Depends(require_employer),
    db: Session = Depends(get_db),
    limit: int = 20,
) -> list[CandidateMatch]:
    """Seekers across the platform ranked by how well they fit a given job.

    Unlike `/applications/job/{id}`, this scores the whole seeker pool — it's the
    employer's candidate-discovery / sourcing view, not just who applied.
    """
    job = db.scalar(
        select(Job)
        .where(Job.id == job_id)
        .options(selectinload(Job.skills).selectinload(JobSkill.skill))
    )
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    if job.employer_profile_id != current_user.employer_profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing.")

    seekers = db.scalars(
        select(SeekerProfile).options(
            selectinload(SeekerProfile.institution),
            selectinload(SeekerProfile.skills).selectinload(SeekerSkill.skill),
        )
    ).all()

    ranked = []
    for seeker in seekers:
        result = score_match(job, seeker)
        if result.score <= 0:
            continue  # skip candidates with no overlap at all
        ranked.append(
            CandidateMatch(seeker=seeker, match_score=result.score, breakdown=_breakdown(result))
        )

    ranked.sort(key=lambda m: m.match_score, reverse=True)
    return ranked[: min(limit, 100)]
