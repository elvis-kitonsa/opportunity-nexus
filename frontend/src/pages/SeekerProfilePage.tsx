import { useEffect, useState } from "react";

import { useMySeekerProfile, useUpdateSeekerProfile } from "../api/hooks";
import { apiErrorMessage } from "../lib/apiClient";
import { Plus, ShieldCheck, X } from "../components/icons";
import { ErrorText, PageHeading, PageLoader, Spinner, SuccessText } from "../components/ui";

interface SkillRow {
  name: string;
  proficiency: number;
}

export function SeekerProfilePage() {
  const { data: profile, isLoading } = useMySeekerProfile(true);
  const update = useUpdateSeekerProfile();

  const [form, setForm] = useState({
    full_name: "",
    headline: "",
    bio: "",
    github_url: "",
    portfolio_url: "",
    field_of_study: "",
    graduation_year: "",
  });
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hydrate the form once the profile loads.
  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      headline: profile.headline ?? "",
      bio: profile.bio ?? "",
      github_url: profile.github_url ?? "",
      portfolio_url: profile.portfolio_url ?? "",
      field_of_study: profile.field_of_study ?? "",
      graduation_year: profile.graduation_year?.toString() ?? "",
    });
    setSkills(profile.skills.map((s) => ({ name: s.skill.name, proficiency: s.proficiency })));
  }, [profile]);

  if (isLoading) return <PageLoader />;

  function setField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setMessage(null);
    setError(null);
    try {
      await update.mutateAsync({
        full_name: form.full_name,
        headline: form.headline || null,
        bio: form.bio || null,
        github_url: form.github_url || null,
        portfolio_url: form.portfolio_url || null,
        field_of_study: form.field_of_study || null,
        graduation_year: form.graduation_year ? Number(form.graduation_year) : null,
        skills: skills.filter((s) => s.name.trim()).map((s) => ({
          name: s.name.trim(),
          proficiency: s.proficiency,
        })),
      });
      setMessage("Profile saved.");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save profile."));
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeading
        title="Your profile"
        subtitle="A strong profile means sharper matches. Keep your skills up to date."
        actions={
          profile?.is_institution_verified ? (
            <span className="chip bg-green-100 font-semibold text-green-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified · {profile.institution?.name ?? "institution"}
            </span>
          ) : (
            <span className="chip bg-slate-100 font-medium text-slate-600">
              Not institution-verified
            </span>
          )
        }
      />

      <div className="card space-y-4">
        {message && <SuccessText>{message}</SuccessText>}
        {error && <ErrorText>{error}</ErrorText>}

        <div>
          <label className="label">Full name</label>
          <input className="input" value={form.full_name} onChange={(e) => setField("full_name", e.target.value)} />
        </div>
        <div>
          <label className="label">Headline</label>
          <input className="input" value={form.headline} onChange={(e) => setField("headline", e.target.value)} placeholder="e.g. Final-year CS student · aspiring backend engineer" />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea className="input min-h-24" value={form.bio} onChange={(e) => setField("bio", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">GitHub URL</label>
            <input className="input" value={form.github_url} onChange={(e) => setField("github_url", e.target.value)} />
          </div>
          <div>
            <label className="label">Portfolio URL</label>
            <input className="input" value={form.portfolio_url} onChange={(e) => setField("portfolio_url", e.target.value)} />
          </div>
          <div>
            <label className="label">Field of study</label>
            <input className="input" value={form.field_of_study} onChange={(e) => setField("field_of_study", e.target.value)} />
          </div>
          <div>
            <label className="label">Graduation year</label>
            <input className="input" type="number" value={form.graduation_year} onChange={(e) => setField("graduation_year", e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Skills</label>
          <div className="space-y-2">
            {skills.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="input flex-1"
                  placeholder="Skill (e.g. Python)"
                  value={row.name}
                  onChange={(e) =>
                    setSkills((s) => s.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))
                  }
                />
                <select
                  className="input w-32"
                  value={row.proficiency}
                  onChange={(e) =>
                    setSkills((s) =>
                      s.map((r, j) => (j === i ? { ...r, proficiency: Number(e.target.value) } : r)),
                    )
                  }
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      Level {n}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-secondary px-2.5"
                  title="Remove skill"
                  onClick={() => setSkills((s) => s.filter((_, j) => j !== i))}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {skills.length === 0 && (
              <p className="text-sm text-slate-400">No skills yet — add a few to start matching.</p>
            )}
          </div>
          <button
            type="button"
            className="btn-secondary mt-2"
            onClick={() => setSkills((s) => [...s, { name: "", proficiency: 3 }])}
          >
            <Plus className="h-4 w-4" /> Add skill
          </button>
        </div>

        <button className="btn-primary" onClick={handleSave} disabled={update.isPending}>
          {update.isPending ? (
            <>
              <Spinner className="h-4 w-4" /> Saving…
            </>
          ) : (
            "Save profile"
          )}
        </button>
      </div>
    </div>
  );
}
