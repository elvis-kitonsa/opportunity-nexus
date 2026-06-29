"""Smoke test: verify the app imports and the matching engine behaves sensibly.

Run with the venv python from the backend/ dir:  python scripts/verify.py
"""

from app.main import app  # noqa: F401  (verifies the whole router tree imports)
from app.models.job import Job
from app.models.profiles import SeekerProfile
from app.models.skill import JobSkill, SeekerSkill, Skill
from app.services.matching import score_match

python = Skill(id=1, name="Python", slug="python")
react = Skill(id=2, name="React", slug="react")
sql = Skill(id=3, name="SQL", slug="sql")

job = Job(title="Junior Backend Engineer")
job.skills = [
    JobSkill(skill_id=1, importance=5, is_required=True, skill=python),
    JobSkill(skill_id=3, importance=3, is_required=True, skill=sql),
    JobSkill(skill_id=2, importance=2, is_required=False, skill=react),
]

strong = SeekerProfile(full_name="Strong Match")
strong.skills = [
    SeekerSkill(skill_id=1, proficiency=5, skill=python),
    SeekerSkill(skill_id=3, proficiency=4, skill=sql),
]

weak = SeekerProfile(full_name="Weak Match")
weak.skills = [SeekerSkill(skill_id=2, proficiency=3, skill=react)]

print(f"App routes registered: {len(app.routes)}")
for label, seeker in [("strong", strong), ("weak", weak)]:
    r = score_match(job, seeker)
    print(
        f"[{label}] score={r.score}  matched={r.matched_skills}  "
        f"missing_required={r.missing_required_skills}  missing_optional={r.missing_optional_skills}"
    )

assert score_match(job, strong).score > score_match(job, weak).score, "ranking broken"
print("OK: matching engine ranks the stronger candidate higher.")
