import { useState } from "react";
import { Link } from "react-router-dom";

import { useCreateJob, useMyJobs } from "../api/hooks";
import { apiErrorMessage } from "../lib/apiClient";
import { Briefcase, Plus, Users, X } from "../components/icons";
import { CardSkeletons, EmptyState, ErrorText, PageHeading, Spinner } from "../components/ui";
import type { JobStatus } from "../types";

const STATUS_META: Record<JobStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600" },
  pending_review: { label: "Pending review", className: "bg-amber-100 text-amber-700" },
  published: { label: "Published", className: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
  closed: { label: "Closed", className: "bg-slate-200 text-slate-600" },
};

interface SkillRow {
  name: string;
  importance: number;
  is_required: boolean;
}

const EMPTY_FORM = {
  title: "",
  description: "",
  location: "",
  employment_type: "full_time",
  experience_level: "entry",
  min_experience_years: 0,
};

export function EmployerJobsPage() {
  const { data: jobs, isLoading } = useMyJobs();
  const createJob = useCreateJob();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [skills, setSkills] = useState<SkillRow[]>([{ name: "", importance: 3, is_required: true }]);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);
    try {
      await createJob.mutateAsync({
        ...form,
        min_experience_years: Number(form.min_experience_years),
        skills: skills.filter((s) => s.name.trim()),
      });
      setForm(EMPTY_FORM);
      setSkills([{ name: "", importance: 3, is_required: true }]);
      setShowForm(false);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create the listing."));
    }
  }

  return (
    <div>
      <PageHeading
        title="My listings"
        subtitle="Post roles with weighted skill criteria and review ranked applicants."
        actions={
          <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? (
              <>
                <X className="h-4 w-4" /> Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> New listing
              </>
            )}
          </button>
        }
      />

      {showForm && (
        <div className="card mb-6 space-y-4">
          {error && <ErrorText>{error}</ErrorText>}
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-28" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="label">Employment type</label>
              <select className="input" value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })}>
                <option value="full_time">Full time</option>
                <option value="part_time">Part time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
                <option value="graduate_trainee">Graduate trainee</option>
              </select>
            </div>
            <div>
              <label className="label">Experience level</label>
              <select className="input" value={form.experience_level} onChange={(e) => setForm({ ...form, experience_level: e.target.value })}>
                <option value="entry">Entry</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
              </select>
            </div>
            <div>
              <label className="label">Min. years experience</label>
              <input className="input" type="number" value={form.min_experience_years} onChange={(e) => setForm({ ...form, min_experience_years: Number(e.target.value) })} />
            </div>
          </div>

          <div>
            <label className="label">Required & desired skills</label>
            <div className="space-y-2">
              {skills.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="input flex-1"
                    placeholder="Skill"
                    value={row.name}
                    onChange={(e) => setSkills((s) => s.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))}
                  />
                  <select
                    className="input w-32"
                    value={row.importance}
                    onChange={(e) => setSkills((s) => s.map((r, j) => (j === i ? { ...r, importance: Number(e.target.value) } : r)))}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        Weight {n}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={row.is_required}
                      onChange={(e) => setSkills((s) => s.map((r, j) => (j === i ? { ...r, is_required: e.target.checked } : r)))}
                    />
                    required
                  </label>
                  <button type="button" className="btn-secondary px-2.5" title="Remove skill" onClick={() => setSkills((s) => s.filter((_, j) => j !== i))}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="btn-secondary mt-2" onClick={() => setSkills((s) => [...s, { name: "", importance: 3, is_required: false }])}>
              <Plus className="h-4 w-4" /> Add skill
            </button>
          </div>

          <button className="btn-primary" onClick={handleCreate} disabled={createJob.isPending}>
            {createJob.isPending ? (
              <>
                <Spinner className="h-4 w-4" /> Creating…
              </>
            ) : (
              "Create listing"
            )}
          </button>
          <p className="text-xs text-slate-500">
            New listings start as “pending review” until an admin publishes them.
          </p>
        </div>
      )}

      {isLoading ? (
        <CardSkeletons count={3} />
      ) : jobs && jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-6 w-6" />}
          title="No listings yet"
          description="Post your first role to start matching with skilled graduates."
          action={
            !showForm && (
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" /> New listing
              </button>
            )
          }
        />
      ) : (
        <ul className="space-y-3">
          {jobs?.map((job) => {
            const meta = STATUS_META[job.status] ?? STATUS_META.draft;
            return (
              <li key={job.id} className="card flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{job.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {job.location ?? "Remote / unspecified"} · {job.skills.length} skill
                    {job.skills.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex flex-none items-center gap-3">
                  <span className={`chip font-semibold ${meta.className}`}>{meta.label}</span>
                  <Link
                    to={`/employer/jobs/${job.id}/applicants`}
                    className="btn-secondary"
                  >
                    <Users className="h-4 w-4" /> Applicants
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
