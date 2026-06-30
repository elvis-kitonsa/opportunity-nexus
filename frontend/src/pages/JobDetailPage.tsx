import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useApplyToJob, useJob } from "../api/hooks";
import { apiErrorMessage } from "../lib/apiClient";
import { ArrowRight, Briefcase, Check, MapPin } from "../components/icons";
import { EmptyState, ErrorText, PageLoader, Spinner, SuccessText } from "../components/ui";

export function JobDetailPage() {
  const { jobId } = useParams();
  const id = Number(jobId);
  const { data: job, isLoading, isError } = useJob(id);
  const apply = useApplyToJob();
  const [coverLetter, setCoverLetter] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <PageLoader />;
  if (isError || !job)
    return (
      <EmptyState
        title="Job not found"
        description="This listing may have been closed or removed."
        action={
          <Link to="/jobs" className="btn-secondary">
            Back to matches
          </Link>
        }
      />
    );

  async function handleApply() {
    setError(null);
    setMessage(null);
    try {
      const result = await apply.mutateAsync({ job_id: id, cover_letter: coverLetter || undefined });
      setMessage(`Application submitted — your match score was ${Math.round(result.match_score ?? 0)}%.`);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not submit application."));
    }
  }

  return (
    <article className="space-y-5">
      <Link to="/jobs" className="text-sm font-medium text-slate-500 hover:text-slate-700">
        ← Back to matches
      </Link>

      <header className="card">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{job.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
          <span className="font-medium text-slate-800">{job.employer.company_name}</span>
          {job.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {job.location}
            </span>
          )}
          <span className="inline-flex items-center gap-1 capitalize">
            <Briefcase className="h-4 w-4" /> {job.employment_type.replace("_", " ")}
          </span>
        </div>
      </header>

      <section className="card">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          About the role
        </h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {job.description}
        </p>
      </section>

      {job.skills.length > 0 && (
        <section className="card">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Required &amp; desired skills
          </h2>
          <ul className="flex flex-wrap gap-2">
            {job.skills.map((s) => (
              <li
                key={s.skill.id}
                className={`chip ${
                  s.is_required
                    ? "bg-brand-50 text-brand-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {s.skill.name}
                {s.is_required && <span className="text-[10px] font-bold uppercase">· req</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card space-y-3">
        <h2 className="font-semibold text-slate-900">Apply to this role</h2>
        {message && <SuccessText>{message}</SuccessText>}
        {error && <ErrorText>{error}</ErrorText>}
        {!message && (
          <>
            <textarea
              className="input min-h-28"
              placeholder="Add a short cover letter (optional) — tell them what you've built."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
            <button className="btn-primary" onClick={handleApply} disabled={apply.isPending}>
              {apply.isPending ? (
                <>
                  <Spinner className="h-4 w-4" /> Submitting…
                </>
              ) : (
                <>
                  Submit application <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </>
        )}
        {message && (
          <Link to="/applications" className="btn-secondary inline-flex w-fit">
            <Check className="h-4 w-4" /> View my applications
          </Link>
        )}
      </section>
    </article>
  );
}
