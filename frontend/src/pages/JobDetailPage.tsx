import { useState } from "react";
import { useParams } from "react-router-dom";

import { useApplyToJob, useJob } from "../api/hooks";
import { apiErrorMessage } from "../lib/apiClient";

export function JobDetailPage() {
  const { jobId } = useParams();
  const id = Number(jobId);
  const { data: job, isLoading, isError } = useJob(id);
  const apply = useApplyToJob();
  const [coverLetter, setCoverLetter] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <p className="text-slate-500">Loading…</p>;
  if (isError || !job) return <p className="text-red-600">Job not found.</p>;

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
      <header>
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <p className="text-slate-600">
          {job.employer.company_name}
          {job.location ? ` · ${job.location}` : ""} · {job.employment_type.replace("_", " ")}
        </p>
      </header>

      <section className="card whitespace-pre-wrap text-sm text-slate-700">{job.description}</section>

      {job.skills.length > 0 && (
        <section className="card">
          <h2 className="mb-2 font-semibold">Required & desired skills</h2>
          <ul className="flex flex-wrap gap-2">
            {job.skills.map((s) => (
              <li
                key={s.skill.id}
                className={`rounded-full px-3 py-1 text-xs ${
                  s.is_required ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {s.skill.name}
                {s.is_required ? " (required)" : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card space-y-3">
        <h2 className="font-semibold">Apply</h2>
        {message && <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}
        {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <textarea
          className="input min-h-28"
          placeholder="Cover letter (optional)"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
        />
        <button className="btn-primary" onClick={handleApply} disabled={apply.isPending || !!message}>
          {apply.isPending ? "Submitting…" : "Submit application"}
        </button>
      </section>
    </article>
  );
}
