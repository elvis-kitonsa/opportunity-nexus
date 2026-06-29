from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_db, require_employer, require_seeker
from app.models.application import Application
from app.models.enums import JobStatus
from app.models.job import Job
from app.models.profiles import SeekerProfile
from app.models.skill import JobSkill, SeekerSkill
from app.models.user import User
from app.schemas.application import (
    ApplicantRead,
    ApplicationCreate,
    ApplicationRead,
    ApplicationStatusUpdate,
)
from app.services.matching import score_match

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    payload: ApplicationCreate,
    current_user: User = Depends(require_seeker),
    db: Session = Depends(get_db),
) -> Application:
    job = db.scalar(
        select(Job)
        .where(Job.id == payload.job_id)
        .options(selectinload(Job.skills).selectinload(JobSkill.skill))
    )
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    if job.status != JobStatus.PUBLISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="This job is not open for applications."
        )

    seeker = db.scalar(
        select(SeekerProfile)
        .where(SeekerProfile.id == current_user.seeker_profile.id)
        .options(selectinload(SeekerProfile.skills).selectinload(SeekerSkill.skill))
    )

    existing = db.scalar(
        select(Application).where(
            Application.job_id == job.id, Application.seeker_profile_id == seeker.id
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="You have already applied to this job."
        )

    # Snapshot the match score so the employer's ranking stays stable.
    result = score_match(job, seeker)
    application = Application(
        job_id=job.id,
        seeker_profile_id=seeker.id,
        cover_letter=payload.cover_letter,
        match_score=result.score,
    )
    db.add(application)
    db.commit()

    return db.scalar(
        select(Application)
        .where(Application.id == application.id)
        .options(
            selectinload(Application.job).selectinload(Job.employer),
            selectinload(Application.job).selectinload(Job.skills).selectinload(JobSkill.skill),
        )
    )


@router.get("/mine", response_model=list[ApplicationRead])
def list_my_applications(
    current_user: User = Depends(require_seeker), db: Session = Depends(get_db)
) -> list[Application]:
    stmt = (
        select(Application)
        .where(Application.seeker_profile_id == current_user.seeker_profile.id)
        .options(
            selectinload(Application.job).selectinload(Job.employer),
            selectinload(Application.job).selectinload(Job.skills).selectinload(JobSkill.skill),
        )
        .order_by(Application.created_at.desc())
    )
    return list(db.scalars(stmt))


@router.get("/job/{job_id}", response_model=list[ApplicantRead])
def list_applicants(
    job_id: int,
    current_user: User = Depends(require_employer),
    db: Session = Depends(get_db),
) -> list[Application]:
    """Applicants for one of the employer's jobs, ranked by match score (desc)."""
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    if job.employer_profile_id != current_user.employer_profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing.")

    stmt = (
        select(Application)
        .where(Application.job_id == job_id)
        .options(
            selectinload(Application.seeker).selectinload(SeekerProfile.institution),
            selectinload(Application.seeker)
            .selectinload(SeekerProfile.skills)
            .selectinload(SeekerSkill.skill),
        )
        .order_by(Application.match_score.desc().nullslast())
    )
    return list(db.scalars(stmt))


@router.patch("/{application_id}/status", response_model=ApplicantRead)
def update_application_status(
    application_id: int,
    payload: ApplicationStatusUpdate,
    current_user: User = Depends(require_employer),
    db: Session = Depends(get_db),
) -> Application:
    application = db.scalar(
        select(Application)
        .where(Application.id == application_id)
        .options(selectinload(Application.job))
    )
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Application not found."
        )
    if application.job.employer_profile_id != current_user.employer_profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing.")

    application.status = payload.status
    db.commit()

    return db.scalar(
        select(Application)
        .where(Application.id == application_id)
        .options(
            selectinload(Application.seeker).selectinload(SeekerProfile.institution),
            selectinload(Application.seeker)
            .selectinload(SeekerProfile.skills)
            .selectinload(SeekerSkill.skill),
        )
    )
