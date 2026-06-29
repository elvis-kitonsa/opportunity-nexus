import enum


class UserRole(str, enum.Enum):
    SEEKER = "seeker"
    EMPLOYER = "employer"


class EmploymentType(str, enum.Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    INTERNSHIP = "internship"
    CONTRACT = "contract"
    GRADUATE_TRAINEE = "graduate_trainee"


class ExperienceLevel(str, enum.Enum):
    ENTRY = "entry"
    JUNIOR = "junior"
    MID = "mid"


class JobStatus(str, enum.Enum):
    """Moderation/lifecycle state of a job listing (managed via Django admin)."""

    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    PUBLISHED = "published"
    REJECTED = "rejected"
    CLOSED = "closed"


class ApplicationStatus(str, enum.Enum):
    APPLIED = "applied"
    REVIEWED = "reviewed"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"
    HIRED = "hired"
