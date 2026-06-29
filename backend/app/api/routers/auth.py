from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.institution import Institution
from app.models.profiles import EmployerProfile, SeekerProfile
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import EmployerRegister, SeekerRegister, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


def _get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.lower()))


def _email_domain(email: str) -> str:
    return email.rsplit("@", 1)[-1].lower()


@router.post("/register/seeker", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_seeker(payload: SeekerRegister, db: Session = Depends(get_db)) -> User:
    if _get_user_by_email(db, payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered."
        )

    # Auto-verify the student if their email domain belongs to a known institution.
    domain = _email_domain(payload.email)
    institution = db.scalar(
        select(Institution).where(
            Institution.email_domain == domain, Institution.is_active.is_(True)
        )
    )

    user = User(
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        role=payload.role,
        is_verified=institution is not None,
    )
    user.seeker_profile = SeekerProfile(
        full_name=payload.full_name,
        institution=institution,
        is_institution_verified=institution is not None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post(
    "/register/employer", response_model=UserRead, status_code=status.HTTP_201_CREATED
)
def register_employer(payload: EmployerRegister, db: Session = Depends(get_db)) -> User:
    if _get_user_by_email(db, payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered."
        )

    user = User(
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        role=payload.role,
        # Employers must be vetted by an admin before they are trusted.
        is_verified=False,
    )
    user.employer_profile = EmployerProfile(company_name=payload.company_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
) -> Token:
    """OAuth2 password flow. The `username` field carries the email."""
    user = _get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user.")
    return Token(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
