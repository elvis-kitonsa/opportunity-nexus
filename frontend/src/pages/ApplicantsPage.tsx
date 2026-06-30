import { Link, useParams } from "react-router-dom";

import {
  useApplicants,
  useMatchedCandidates,
  useUpdateApplicationStatus,
} from "../api/hooks";
import { MatchBadge } from "../components/MatchBadge";
import { apiErrorMessage } from "../lib/apiClient";
import { ShieldCheck, Sparkles, Users } from "../components/icons";
import { CardSkeletons, EmptyState } from "../components/ui";
import type { ApplicationStatus } from "../types";

const STATUSES: ApplicationStatus[] = ["applied", "reviewed", "shortlisted", "rejected", "hired"];

export function ApplicantsPage() {
  const { jobId } = useParams();
  const id = Number(jobId);
  const { data: applicants, isLoading } = useApplicants(id);
  const { data: candidates } = useMatchedCandidates(id);
  const updateStatus = useUpdateApplicationStatus();

  async function onStatusChange(applicationId: number, status: ApplicationStatus) {
    try {
      await updateStatus.mutateAsync({ id: applicationId, status });
    } catch (err) {
      alert(apiErrorMessage(err, "Could not update status."));
    }
  }

  return (
    <div className="space-y-10">
      <Link to="/employer" className="text-sm font-medium text-slate-500 hover:text-slate-700">
        ← Back to listings
      </Link>

      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Applicants</h1>
        <p className="mb-4 mt-1 text-sm text-slate-500">
          Ranked by match score at the time of application.
        </p>

        {isLoading ? (
          <CardSkeletons count={3} />
        ) : applicants && applicants.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No applicants yet"
            description="Once your listing is published, candidates who apply will appear here, ranked by fit."
          />
        ) : (
          <ul className="space-y-3">
            {applicants?.map((a) => (
              <li key={a.id} className="card flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold text-slate-900">
                    {a.seeker.full_name}
                    {a.seeker.is_institution_verified && (
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                    )}
                  </p>
                  <p className="text-sm text-slate-500">
                    {a.seeker.institution?.name ?? "Institution not set"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {a.seeker.skills.length > 0 ? (
                      a.seeker.skills.map((s) => (
                        <span key={s.skill.id} className="chip bg-slate-100 text-slate-600">
                          {s.skill.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No skills listed</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-none flex-col items-end gap-2">
                  {a.match_score != null && <MatchBadge score={a.match_score} />}
                  <select
                    className="input w-36"
                    value={a.status}
                    onChange={(e) => onStatusChange(a.id, e.target.value as ApplicationStatus)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
          <Sparkles className="h-5 w-5 text-brand-600" />
          Suggested candidates
        </h2>
        <p className="mb-4 mt-1 text-sm text-slate-500">
          Seekers across the platform who fit this role — even if they haven’t applied.
        </p>
        {candidates && candidates.length === 0 ? (
          <EmptyState
            title="No suggestions yet"
            description="As more graduates build profiles, strong matches for this role will surface here."
          />
        ) : (
          <ul className="space-y-3">
            {candidates?.map((c) => (
              <li key={c.seeker.id} className="card flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold text-slate-900">
                    {c.seeker.full_name}
                    {c.seeker.is_institution_verified && (
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Matches: {c.breakdown.matched_skills.join(", ") || "—"}
                  </p>
                </div>
                <MatchBadge score={c.match_score} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
