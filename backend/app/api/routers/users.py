from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user, get_db, require_employer, require_seeker
from app.models.institution import Institution
from app.models.profiles import EmployerProfile, SeekerProfile
from app.models.skill import SeekerSkill
from app.models.user import User
from app.schemas.profile import (
    EmployerProfileRead,
    EmployerProfileUpdate,
    InstitutionRead,
    SeekerProfileRead,
    SeekerProfileUpdate,
)
from app.services.skills import get_or_create_skill

router = APIRouter(prefix="/users", tags=["users"])


def _load_seeker(db: Session, profile_id: int) -> SeekerProfile | None:
    return db.scalar(
        select(SeekerProfile)
        .where(SeekerProfile.id == profile_id)
        .options(
            selectinload(SeekerProfile.institution),
            selectinload(SeekerProfile.skills).selectinload(SeekerSkill.skill),
        )
    )


@router.get("/institutions", response_model=list[InstitutionRead])
def list_institutions(db: Session = Depends(get_db)) -> list[Institution]:
    return list(
        db.scalars(
            select(Institution)
            .where(Institution.is_active.is_(True))
            .order_by(Institution.name)
        )
    )


# ---- Seeker profile ----------------------------------------------------------


@router.get("/me/seeker-profile", response_model=SeekerProfileRead)
def get_my_seeker_profile(
    current_user: User = Depends(require_seeker), db: Session = Depends(get_db)
) -> SeekerProfile:
    profile = _load_seeker(db, current_user.seeker_profile.id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")
    return profile


@router.put("/me/seeker-profile", response_model=SeekerProfileRead)
def update_my_seeker_profile(
    payload: SeekerProfileUpdate,
    current_user: User = Depends(require_seeker),
    db: Session = Depends(get_db),
) -> SeekerProfile:
    profile = current_user.seeker_profile

    data = payload.model_dump(exclude_unset=True)
    skills_input = data.pop("skills", None)

    # Validate institution reference if provided.
    if "institution_id" in data and data["institution_id"] is not None:
        institution = db.get(Institution, data["institution_id"])
        if institution is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown institution."
            )

    for field, value in data.items():
        # Pydantic HttpUrl serialises to a URL object; store as plain string.
        setattr(profile, field, str(value) if value is not None and "url" in field else value)

    # Replace the skill set if a new one was supplied.
    if skills_input is not None:
        profile.skills.clear()
        db.flush()
        for item in skills_input:
            skill = get_or_create_skill(db, item["name"])
            profile.skills.append(
                SeekerSkill(skill_id=skill.id, proficiency=item["proficiency"])
            )

    db.commit()
    return _load_seeker(db, profile.id)


# ---- Employer profile --------------------------------------------------------


@router.get("/me/employer-profile", response_model=EmployerProfileRead)
def get_my_employer_profile(
    current_user: User = Depends(require_employer),
) -> EmployerProfile:
    return current_user.employer_profile


@router.put("/me/employer-profile", response_model=EmployerProfileRead)
def update_my_employer_profile(
    payload: EmployerProfileUpdate,
    current_user: User = Depends(require_employer),
    db: Session = Depends(get_db),
) -> EmployerProfile:
    profile = current_user.employer_profile
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, str(value) if value is not None and "website" in field else value)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/seekers/{profile_id}", response_model=SeekerProfileRead)
def get_seeker_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SeekerProfile:
    """Employers (and the owner) can view a seeker's public profile."""
    profile = _load_seeker(db, profile_id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")
    return profile
