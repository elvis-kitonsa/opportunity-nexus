import { Link } from "react-router-dom";

import { useMyApplications } from "../api/hooks";
import { MatchBadge } from "../components/MatchBadge";
import { FileText } from "../components/icons";
import { CardSkeletons, EmptyState, ErrorText, PageHeading } from "../components/ui";
import type { ApplicationStatus } from "../types";

const STATUS_META: Record<ApplicationStatus, { label: string; className: string }> = {
  applied: { label: "Applied", className: "bg-slate-100 text-slate-700" },
  reviewed: { label: "Reviewed", className: "bg-blue-100 text-blue-700" },
  shortlisted: { label: "Shortlisted", className: "bg-brand-100 text-brand-700" },
  rejected: { label: "Not selected", className: "bg-red-100 text-red-700" },
  hired: { label: "Hired", className: "bg-green-100 text-green-700" },
};

export function MyApplicationsPage() {
  const { data: applications, isLoading, isError } = useMyApplications();

  return (
    <div>
      <PageHeading title="My applications" subtitle="Track the status of every role you’ve applied to." />

      {isLoading && <CardSkeletons count={3} />}
      {isError && <ErrorText>Couldn’t load your applications.</ErrorText>}

      {applications && applications.length === 0 && (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No applications yet"
          description="Browse your matched jobs and apply — your match score is saved with each application."
          action={
            <Link to="/jobs" className="btn-primary">
              Browse matched jobs
            </Link>
          }
        />
      )}

      <ul className="space-y-3">
        {applications?.map((app) => {
          const meta = STATUS_META[app.status] ?? STATUS_META.applied;
          return (
            <li key={app.id} className="card flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{app.job.title}</p>
                <p className="text-sm text-slate-500">{app.job.employer.company_name}</p>
              </div>
              <div className="flex flex-none items-center gap-3">
                {app.match_score != null && <MatchBadge score={app.match_score} />}
                <span className={`chip font-semibold ${meta.className}`}>{meta.label}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
