from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import UserRole


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)
    role: UserRole


class SeekerRegister(UserCreate):
    """Registration payload for a job seeker, with the minimal profile fields."""

    full_name: str = Field(min_length=1, max_length=255)
    role: UserRole = UserRole.SEEKER


class EmployerRegister(UserCreate):
    """Registration payload for an employer, with the minimal profile fields."""

    company_name: str = Field(min_length=1, max_length=255)
    role: UserRole = UserRole.EMPLOYER


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: UserRole
    is_active: bool
    is_verified: bool


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
