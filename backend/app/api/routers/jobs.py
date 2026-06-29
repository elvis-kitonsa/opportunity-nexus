from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_db, require_employer
from app.models.enums import JobStatus
from app.models.job import Job
from app.models.skill import JobSkill
from app.models.user import User
from app.schemas.job import JobCreate, JobRead, JobUpdate
from app.services.skills import get_or_create_skill

router = APIRouter(prefix="/jobs", tags=["jobs"])

_JOB_LOADERS = (
    selectinload(Job.employer),
    selectinload(Job.skills).selectinload(JobSkill.skill),
)


def _load_job(db: Session, job_id: int) -> Job | None:
    return db.scalar(select(Job).where(Job.id == job_id).options(*_JOB_LOADERS))


def _apply_skills(db: Session, job: Job, skills_input: list[dict]) -> None:
    job.skills.clear()
    db.flush()
    for item in skills_input:
        skill = get_or_create_skill(db, item["name"])
        job.skills.append(
            JobSkill(
                skill_id=skill.id,
                importance=item["importance"],
                is_required=item["is_required"],
            )
        )


@router.get("", response_model=list[JobRead])
def list_jobs(
    db: Session = Depends(get_db),
    q: str | None = None,
    location: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[Job]:
    """Public listing of published jobs."""
    stmt = (
        select(Job)
        .where(Job.status == JobStatus.PUBLISHED)
        .options(*_JOB_LOADERS)
        .order_by(Job.created_at.desc())
    )
    if q:
        stmt = stmt.where(Job.title.ilike(f"%{q}%"))
    if location:
        stmt = stmt.where(Job.location.ilike(f"%{location}%"))
    stmt = stmt.limit(min(limit, 100)).offset(offset)
    return list(db.scalars(stmt))


@router.get("/mine", response_model=list[JobRead])
def list_my_jobs(
    current_user: User = Depends(require_employer), db: Session = Depends(get_db)
) -> list[Job]:
    """All of the current employer's jobs, regardless of moderation status."""
    stmt = (
        select(Job)
        .where(Job.employer_profile_id == current_user.employer_profile.id)
        .options(*_JOB_LOADERS)
        .order_by(Job.created_at.desc())
    )
    return list(db.scalars(stmt))


@router.get("/{job_id}", response_model=JobRead)
def get_job(job_id: int, db: Session = Depends(get_db)) -> Job:
    job = _load_job(db, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    return job


@router.post("", response_model=JobRead, status_code=status.HTTP_201_CREATED)
def create_job(
    payload: JobCreate,
    current_user: User = Depends(require_employer),
    db: Session = Depends(get_db),
) -> Job:
    data = payload.model_dump()
    skills_input = data.pop("skills", [])
    job = Job(employer_profile_id=current_user.employer_profile.id, **data)
    db.add(job)
    db.flush()
    _apply_skills(db, job, skills_input)
    db.commit()
    return _load_job(db, job.id)


@router.put("/{job_id}", response_model=JobRead)
def update_job(
    job_id: int,
    payload: JobUpdate,
    current_user: User = Depends(require_employer),
    db: Session = Depends(get_db),
) -> Job:
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    if job.employer_profile_id != current_user.employer_profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing.")

    data = payload.model_dump(exclude_unset=True)
    skills_input = data.pop("skills", None)
    for field, value in data.items():
        setattr(job, field, value)
    if skills_input is not None:
        _apply_skills(db, job, skills_input)

    db.commit()
    return _load_job(db, job.id)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    current_user: User = Depends(require_employer),
    db: Session = Depends(get_db),
) -> None:
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    if job.employer_profile_id != current_user.employer_profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing.")
    db.delete(job)
    db.commit()
