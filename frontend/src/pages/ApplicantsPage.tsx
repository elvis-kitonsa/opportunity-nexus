import { useParams } from "react-router-dom";

import {
  useApplicants,
  useMatchedCandidates,
  useUpdateApplicationStatus,
} from "../api/hooks";
import { MatchBadge } from "../components/MatchBadge";
import { apiErrorMessage } from "../lib/apiClient";
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
      <section>
        <h1 className="mb-1 text-2xl font-bold">Applicants</h1>
        <p className="mb-4 text-sm text-slate-500">Ranked by match score at time of application.</p>
        {isLoading ? (
          <p className="text-slate-500">Loading…</p>
        ) : applicants && applicants.length === 0 ? (
          <p className="text-slate-500">No applicants yet.</p>
        ) : (
          <ul className="space-y-3">
            {applicants?.map((a) => (
              <li key={a.id} className="card flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{a.seeker.full_name}</p>
                  <p className="text-sm text-slate-600">
                    {a.seeker.institution?.name ?? "—"}
                    {a.seeker.is_institution_verified ? " · verified" : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {a.seeker.skills.map((s) => s.skill.name).join(", ") || "No skills listed"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {a.match_score != null && <MatchBadge score={a.match_score} />}
                  <select
                    className="input w-36"
                    value={a.status}
                    onChange={(e) => onStatusChange(a.id, e.target.value as ApplicationStatus)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
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
        <h2 className="mb-1 text-xl font-bold">Suggested candidates</h2>
        <p className="mb-4 text-sm text-slate-500">
          Seekers across the platform who fit this role — even if they haven’t applied.
        </p>
        <ul className="space-y-3">
          {candidates?.length === 0 && <p className="text-slate-500">No suggestions yet.</p>}
          {candidates?.map((c) => (
            <li key={c.seeker.id} className="card flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{c.seeker.full_name}</p>
                <p className="text-xs text-slate-500">
                  Matches: {c.breakdown.matched_skills.join(", ") || "—"}
                </p>
              </div>
              <MatchBadge score={c.match_score} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
