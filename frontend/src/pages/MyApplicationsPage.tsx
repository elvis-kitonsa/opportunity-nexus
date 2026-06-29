import { useMyApplications } from "../api/hooks";
import { MatchBadge } from "../components/MatchBadge";

const STATUS_LABELS: Record<string, string> = {
  applied: "Applied",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  rejected: "Not selected",
  hired: "Hired",
};

export function MyApplicationsPage() {
  const { data: applications, isLoading, isError } = useMyApplications();

  if (isLoading) return <p className="text-slate-500">Loading…</p>;
  if (isError) return <p className="text-red-600">Couldn’t load your applications.</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My applications</h1>
      {applications && applications.length === 0 && (
        <p className="text-slate-500">You haven’t applied to any jobs yet.</p>
      )}
      <ul className="space-y-3">
        {applications?.map((app) => (
          <li key={app.id} className="card flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{app.job.title}</p>
              <p className="text-sm text-slate-600">{app.job.employer.company_name}</p>
            </div>
            <div className="flex items-center gap-3">
              {app.match_score != null && <MatchBadge score={app.match_score} />}
              <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {STATUS_LABELS[app.status] ?? app.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
