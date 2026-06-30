"""Unit tests for the matching engine (pure functions, no database)."""

from app.models.job import Job
from app.models.profiles import SeekerProfile
from app.models.skill import JobSkill, SeekerSkill, Skill
from app.services.matching import PROFICIENCY_FLOOR, REQUIRED_PENALTY, score_match

# Reusable skill catalogue.
PYTHON = Skill(id=1, name="Python", slug="python")
SQL = Skill(id=2, name="SQL", slug="sql")
REACT = Skill(id=3, name="React", slug="react")


def make_job(*skills: JobSkill) -> Job:
    job = Job(title="Test Role")
    job.skills = list(skills)
    return job


def make_seeker(*skills: SeekerSkill) -> SeekerProfile:
    seeker = SeekerProfile(full_name="Test Seeker")
    seeker.skills = list(skills)
    return seeker


def test_job_with_no_skills_scores_zero():
    result = score_match(make_job(), make_seeker())
    assert result.score == 0.0
    assert result.matched_skills == []


def test_no_overlap_scores_zero_and_lists_missing():
    job = make_job(JobSkill(skill_id=1, importance=5, is_required=True, skill=PYTHON))
    seeker = make_seeker(SeekerSkill(skill_id=3, proficiency=5, skill=REACT))

    result = score_match(job, seeker)

    assert result.score == 0.0
    assert result.matched_skills == []
    assert result.missing_required_skills == ["Python"]


def test_breakdown_classifies_matched_and_missing():
    job = make_job(
        JobSkill(skill_id=1, importance=5, is_required=True, skill=PYTHON),
        JobSkill(skill_id=2, importance=3, is_required=True, skill=SQL),
        JobSkill(skill_id=3, importance=2, is_required=False, skill=REACT),
    )
    seeker = make_seeker(SeekerSkill(skill_id=1, proficiency=5, skill=PYTHON))

    result = score_match(job, seeker)

    assert result.matched_skills == ["Python"]
    assert result.missing_required_skills == ["SQL"]
    assert result.missing_optional_skills == ["React"]


def test_stronger_candidate_outranks_weaker():
    job = make_job(
        JobSkill(skill_id=1, importance=5, is_required=True, skill=PYTHON),
        JobSkill(skill_id=2, importance=3, is_required=True, skill=SQL),
        JobSkill(skill_id=3, importance=2, is_required=False, skill=REACT),
    )
    strong = make_seeker(
        SeekerSkill(skill_id=1, proficiency=5, skill=PYTHON),
        SeekerSkill(skill_id=2, proficiency=4, skill=SQL),
    )
    weak = make_seeker(SeekerSkill(skill_id=3, proficiency=3, skill=REACT))

    assert score_match(job, strong).score > score_match(job, weak).score


def test_full_match_at_top_proficiency_scores_100():
    job = make_job(
        JobSkill(skill_id=1, importance=5, is_required=True, skill=PYTHON),
        JobSkill(skill_id=2, importance=3, is_required=True, skill=SQL),
    )
    seeker = make_seeker(
        SeekerSkill(skill_id=1, proficiency=5, skill=PYTHON),
        SeekerSkill(skill_id=2, proficiency=5, skill=SQL),
    )

    assert score_match(job, seeker).score == 100.0


def test_proficiency_floor_rewards_modest_juniors():
    """A claimed skill earns at least the floor fraction of its weight."""
    job = make_job(JobSkill(skill_id=1, importance=5, is_required=False, skill=PYTHON))
    # Lowest possible self-rating still counts as a real match.
    seeker = make_seeker(SeekerSkill(skill_id=1, proficiency=1, skill=PYTHON))

    result = score_match(job, seeker)

    # proficiency 1/5: factor = floor + (1-floor)*(1/5)
    expected = (PROFICIENCY_FLOOR + (1 - PROFICIENCY_FLOOR) * (1 / 5)) * 100
    assert result.score == round(expected, 1)
    assert result.score >= PROFICIENCY_FLOOR * 100


def test_missing_required_applies_extra_penalty():
    """Missing a required skill costs more than the same skill being optional."""
    required_job = make_job(
        JobSkill(skill_id=1, importance=5, is_required=True, skill=PYTHON),
        JobSkill(skill_id=2, importance=5, is_required=True, skill=SQL),
    )
    optional_job = make_job(
        JobSkill(skill_id=1, importance=5, is_required=False, skill=PYTHON),
        JobSkill(skill_id=2, importance=5, is_required=False, skill=SQL),
    )
    seeker = make_seeker(SeekerSkill(skill_id=1, proficiency=5, skill=PYTHON))

    required_score = score_match(required_job, seeker).score
    optional_score = score_match(optional_job, seeker).score

    assert required_score < optional_score
    # Half of one of two required skills missing -> scaled by (1 - penalty/2).
    assert required_score == round(optional_score * (1 - REQUIRED_PENALTY * 0.5), 1)


def test_score_never_exceeds_bounds():
    job = make_job(JobSkill(skill_id=1, importance=5, is_required=True, skill=PYTHON))
    seeker = make_seeker(SeekerSkill(skill_id=1, proficiency=5, skill=PYTHON))

    result = score_match(job, seeker)

    assert 0.0 <= result.score <= 100.0
