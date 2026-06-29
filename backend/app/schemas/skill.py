from pydantic import BaseModel, ConfigDict, Field


class SkillRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    category: str | None = None


class SeekerSkillInput(BaseModel):
    """A skill claimed by a seeker, identified by name (created on the fly if new)."""

    name: str = Field(min_length=1, max_length=120)
    proficiency: int = Field(default=3, ge=1, le=5)


class SeekerSkillRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    skill: SkillRead
    proficiency: int


class JobSkillInput(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    importance: int = Field(default=3, ge=1, le=5)
    is_required: bool = False


class JobSkillRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    skill: SkillRead
    importance: int
    is_required: bool
