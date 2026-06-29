from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import EmploymentType, ExperienceLevel, JobStatus
from app.schemas.skill import JobSkillInput, JobSkillRead


class JobBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    location: str | None = Field(default=None, max_length=255)
    employment_type: EmploymentType = EmploymentType.FULL_TIME
    experience_level: ExperienceLevel = ExperienceLevel.ENTRY
    min_experience_years: int = Field(default=0, ge=0, le=20)


class JobCreate(JobBase):
    skills: list[JobSkillInput] = []


class JobUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    description: str | None = None
    location: str | None = Field(default=None, max_length=255)
    employment_type: EmploymentType | None = None
    experience_level: ExperienceLevel | None = None
    min_experience_years: int | None = Field(default=None, ge=0, le=20)
    skills: list[JobSkillInput] | None = None


class EmployerSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_name: str
    is_verified: bool


class JobRead(JobBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: JobStatus
    employer: EmployerSummary
    skills: list[JobSkillRead] = []
