import { Link } from "react-router-dom";

import { useMatchedJobs } from "../api/hooks";
import { MatchBadge } from "../components/MatchBadge";

export function SeekerJobsPage() {
  const { data: matches, isLoading, isError } = useMatchedJobs();

  if (isLoading) return <p className="text-slate-500">Finding your matches…</p>;
  if (isError) return <p className="text-red-600">Couldn’t load matches.</p>;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Jobs matched to you</h1>
      <p className="mb-6 text-sm text-slate-500">
        Ranked by how well your skills fit each listing.
      </p>

      {matches && matches.length === 0 && (
        <p className="text-slate-500">
          No matches yet. Add skills to your <Link to="/profile" className="text-brand-600">profile</Link>{" "}
          to start matching.
        </p>
      )}

      <ul className="space-y-3">
        {matches?.map(({ job, match_score, breakdown }) => (
          <li key={job.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link to={`/jobs/${job.id}`} className="text-lg font-semibold text-brand-700">
                  {job.title}
                </Link>
                <p className="text-sm text-slate-600">
                  {job.employer.company_name}
                  {job.location ? ` · ${job.location}` : ""}
                </p>
              </div>
              <MatchBadge score={match_score} />
            </div>
            {breakdown.matched_skills.length > 0 && (
              <p className="mt-3 text-xs text-slate-500">
                You match: {breakdown.matched_skills.join(", ")}
              </p>
            )}
            {breakdown.missing_required_skills.length > 0 && (
              <p className="mt-1 text-xs text-amber-700">
                Missing required: {breakdown.missing_required_skills.join(", ")}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
