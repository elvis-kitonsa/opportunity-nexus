"""The matching engine.

Scores how well a job seeker fits a job listing based on weighted skill overlap.
The same routine powers both directions:
  * employers ranking applicants for one of their jobs, and
  * seekers ranking jobs by how well they fit.

The score is a 0-100 percentage. The design goals are: explainable (we return a
breakdown of matched / missing skills), and forgiving for entry-level candidates
(a claimed skill always earns most of its weight regardless of self-rated
proficiency, so juniors aren't punished for modesty).
"""

from __future__ import annotations

from dataclasses import dataclass

from app.models.job import Job
from app.models.profiles import SeekerProfile

# A matched skill earns at least this fraction of its importance weight; the rest
# scales with the seeker's self-rated proficiency (1-5).
PROFICIENCY_FLOOR = 0.6

# How much weight missing *required* skills removes, on top of them simply not
# contributing to coverage. Missing every required skill scales the score by
# (1 - REQUIRED_PENALTY).
REQUIRED_PENALTY = 0.4


@dataclass
class MatchResult:
    score: float
    matched_skills: list[str]
    missing_required_skills: list[str]
    missing_optional_skills: list[str]


def score_match(job: Job, seeker: SeekerProfile) -> MatchResult:
    """Compute the match between a job and a seeker.

    Both `job.skills` and `seeker.skills` are expected to be loaded.
    """
    # Map the seeker's skills: skill_id -> proficiency (1-5)
    seeker_proficiency: dict[int, int] = {
        ss.skill_id: ss.proficiency for ss in seeker.skills
    }

    total_weight = sum(js.importance for js in job.skills)

    matched: list[str] = []
    missing_required: list[str] = []
    missing_optional: list[str] = []

    # A job with no declared skills can't be scored meaningfully.
    if total_weight == 0:
        return MatchResult(0.0, matched, missing_required, missing_optional)

    earned = 0.0
    required_total = 0
    required_missing = 0

    for js in job.skills:
        name = js.skill.name
        if js.is_required:
            required_total += 1

        proficiency = seeker_proficiency.get(js.skill_id)
        if proficiency is not None:
            factor = PROFICIENCY_FLOOR + (1 - PROFICIENCY_FLOOR) * (proficiency / 5)
            earned += js.importance * factor
            matched.append(name)
        else:
            if js.is_required:
                required_missing += 1
                missing_required.append(name)
            else:
                missing_optional.append(name)

    score = (earned / total_weight) * 100

    # Extra penalty for unmet hard requirements.
    if required_total:
        score *= 1 - REQUIRED_PENALTY * (required_missing / required_total)

    score = round(max(0.0, min(100.0, score)), 1)
    return MatchResult(score, matched, missing_required, missing_optional)
