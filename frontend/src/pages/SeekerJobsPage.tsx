import { Link } from "react-router-dom";

import { useMatchedJobs } from "../api/hooks";
import { MatchBadge } from "../components/MatchBadge";
import { ArrowRight, Check, MapPin, Sparkles, Target, X } from "../components/icons";
import { CardSkeletons, EmptyState, ErrorText, PageHeading } from "../components/ui";

export function SeekerJobsPage() {
  const { data: matches, isLoading, isError } = useMatchedJobs();

  return (
    <div>
      <PageHeading
        title="Jobs matched to you"
        subtitle="Ranked by how well your skills fit each listing."
      />

      {isLoading && <CardSkeletons count={4} />}
      {isError && <ErrorText>Couldn’t load your matches. Please try again.</ErrorText>}

      {matches && matches.length === 0 && (
        <EmptyState
          icon={<Sparkles className="h-6 w-6" />}
          title="No matches yet"
          description="Add a few skills to your profile and we’ll start ranking jobs that fit what you’ve built."
          action={
            <Link to="/profile" className="btn-primary">
              Complete your profile <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      )}

      <ul className="space-y-3">
        {matches?.map(({ job, match_score, breakdown }) => (
          <li key={job.id}>
            <Link to={`/jobs/${job.id}`} className="card-interactive block">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-slate-900">{job.title}</h2>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-slate-500">
                    <span className="font-medium text-slate-700">{job.employer.company_name}</span>
                    {job.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {job.location}
                      </span>
                    )}
                  </p>
                </div>
                <MatchBadge score={match_score} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {breakdown.matched_skills.map((s) => (
                  <span key={s} className="chip bg-green-50 text-green-700">
                    <Check className="h-3 w-3" /> {s}
                  </span>
                ))}
                {breakdown.missing_required_skills.map((s) => (
                  <span key={s} className="chip bg-amber-50 text-amber-700">
                    <X className="h-3 w-3" /> {s}
                  </span>
                ))}
                {breakdown.matched_skills.length === 0 &&
                  breakdown.missing_required_skills.length === 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Target className="h-3.5 w-3.5" /> Open the role to see the full breakdown
                    </span>
                  )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
