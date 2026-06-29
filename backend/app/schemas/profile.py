from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from app.schemas.skill import SeekerSkillInput, SeekerSkillRead


class InstitutionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email_domain: str
    location: str | None = None


# ---- Seeker profile ----------------------------------------------------------


class SeekerProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, max_length=255)
    headline: str | None = Field(default=None, max_length=255)
    bio: str | None = None
    github_url: HttpUrl | None = None
    portfolio_url: HttpUrl | None = None
    linkedin_url: HttpUrl | None = None
    field_of_study: str | None = Field(default=None, max_length=255)
    graduation_year: int | None = Field(default=None, ge=1980, le=2100)
    institution_id: int | None = None
    skills: list[SeekerSkillInput] | None = None


class SeekerProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    headline: str | None = None
    bio: str | None = None
    github_url: str | None = None
    portfolio_url: str | None = None
    linkedin_url: str | None = None
    field_of_study: str | None = None
    graduation_year: int | None = None
    is_institution_verified: bool
    institution: InstitutionRead | None = None
    skills: list[SeekerSkillRead] = []


# ---- Employer profile --------------------------------------------------------


class EmployerProfileUpdate(BaseModel):
    company_name: str | None = Field(default=None, max_length=255)
    company_website: HttpUrl | None = None
    description: str | None = None
    location: str | None = Field(default=None, max_length=255)


class EmployerProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_name: str
    company_website: str | None = None
    description: str | None = None
    location: str | None = None
    is_verified: bool
