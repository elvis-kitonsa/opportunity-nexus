"""Django models mapping the shared business tables.

All models here are ``managed = False``: the schema is owned by the FastAPI
backend's Alembic migrations. Django neither creates nor alters these tables;
it only reads and writes rows through the admin. The audit timestamp columns
(``created_at`` / ``updated_at``) are populated by the database / backend and
are intentionally not mapped here.
"""

from django.db import models


class Role(models.TextChoices):
    SEEKER = "seeker", "Job seeker"
    EMPLOYER = "employer", "Employer"


class EmploymentType(models.TextChoices):
    FULL_TIME = "full_time", "Full time"
    PART_TIME = "part_time", "Part time"
    INTERNSHIP = "internship", "Internship"
    CONTRACT = "contract", "Contract"
    GRADUATE_TRAINEE = "graduate_trainee", "Graduate trainee"


class ExperienceLevel(models.TextChoices):
    ENTRY = "entry", "Entry"
    JUNIOR = "junior", "Junior"
    MID = "mid", "Mid"


class JobStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PENDING_REVIEW = "pending_review", "Pending review"
    PUBLISHED = "published", "Published"
    REJECTED = "rejected", "Rejected"
    CLOSED = "closed", "Closed"


class ApplicationStatus(models.TextChoices):
    APPLIED = "applied", "Applied"
    REVIEWED = "reviewed", "Reviewed"
    SHORTLISTED = "shortlisted", "Shortlisted"
    REJECTED = "rejected", "Rejected"
    HIRED = "hired", "Hired"


class User(models.Model):
    email = models.EmailField(unique=True)
    hashed_password = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=Role.choices)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = "users"

    def __str__(self) -> str:
        return self.email


class Institution(models.Model):
    name = models.CharField(max_length=255, unique=True)
    email_domain = models.CharField(max_length=255, unique=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = "institutions"

    def __str__(self) -> str:
        return self.name


class SeekerProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.DO_NOTHING, db_column="user_id", related_name="seeker_profile"
    )
    full_name = models.CharField(max_length=255)
    headline = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    github_url = models.CharField(max_length=255, blank=True, null=True)
    portfolio_url = models.CharField(max_length=255, blank=True, null=True)
    linkedin_url = models.CharField(max_length=255, blank=True, null=True)
    institution = models.ForeignKey(
        Institution,
        on_delete=models.DO_NOTHING,
        db_column="institution_id",
        blank=True,
        null=True,
        related_name="seekers",
    )
    field_of_study = models.CharField(max_length=255, blank=True, null=True)
    graduation_year = models.IntegerField(blank=True, null=True)
    is_institution_verified = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = "seeker_profiles"

    def __str__(self) -> str:
        return self.full_name


class EmployerProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.DO_NOTHING, db_column="user_id", related_name="employer_profile"
    )
    company_name = models.CharField(max_length=255)
    company_website = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = "employer_profiles"

    def __str__(self) -> str:
        return self.company_name


class Skill(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.CharField(max_length=120, unique=True)
    category = models.CharField(max_length=80, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "skills"

    def __str__(self) -> str:
        return self.name


class Job(models.Model):
    employer = models.ForeignKey(
        EmployerProfile,
        on_delete=models.DO_NOTHING,
        db_column="employer_profile_id",
        related_name="jobs",
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True, null=True)
    employment_type = models.CharField(max_length=20, choices=EmploymentType.choices)
    experience_level = models.CharField(max_length=20, choices=ExperienceLevel.choices)
    min_experience_years = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=JobStatus.choices)

    class Meta:
        managed = False
        db_table = "jobs"

    def __str__(self) -> str:
        return self.title


class JobSkill(models.Model):
    job = models.ForeignKey(
        Job, on_delete=models.DO_NOTHING, db_column="job_id", related_name="skills"
    )
    skill = models.ForeignKey(Skill, on_delete=models.DO_NOTHING, db_column="skill_id")
    importance = models.IntegerField(default=3)
    is_required = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = "job_skills"

    def __str__(self) -> str:
        return f"{self.skill_id} for job {self.job_id}"


class SeekerSkill(models.Model):
    seeker = models.ForeignKey(
        SeekerProfile,
        on_delete=models.DO_NOTHING,
        db_column="seeker_profile_id",
        related_name="skills",
    )
    skill = models.ForeignKey(Skill, on_delete=models.DO_NOTHING, db_column="skill_id")
    proficiency = models.IntegerField(default=3)

    class Meta:
        managed = False
        db_table = "seeker_skills"

    def __str__(self) -> str:
        return f"{self.skill_id} for seeker {self.seeker_id}"


class Application(models.Model):
    job = models.ForeignKey(
        Job, on_delete=models.DO_NOTHING, db_column="job_id", related_name="applications"
    )
    seeker = models.ForeignKey(
        SeekerProfile,
        on_delete=models.DO_NOTHING,
        db_column="seeker_profile_id",
        related_name="applications",
    )
    cover_letter = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=ApplicationStatus.choices)
    match_score = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "applications"

    def __str__(self) -> str:
        return f"Application #{self.pk}"
