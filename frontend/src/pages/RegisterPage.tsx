import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { apiErrorMessage } from "../lib/apiClient";
import type { UserRole } from "../types";
import { Briefcase, User } from "../components/icons";
import { ErrorText, Spinner } from "../components/ui";

export function RegisterPage() {
  const { registerSeeker, registerEmployer } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("seeker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // full name (seeker) or company name (employer)
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (role === "seeker") {
        await registerSeeker({ email, password, full_name: name });
        navigate("/profile");
      } else {
        await registerEmployer({ email, password, company_name: name });
        navigate("/employer");
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Registration failed."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Join Opportunity Nexus in under a minute.</p>
      </div>
      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && <ErrorText>{error}</ErrorText>}

        <div className="grid grid-cols-2 gap-2">
          {(["seeker", "employer"] as UserRole[]).map((r) => {
            const selected = role === r;
            const Icon = r === "seeker" ? User : Briefcase;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm font-semibold transition ${
                  selected
                    ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-5 w-5" />
                {r === "seeker" ? "Job seeker" : "Employer"}
              </button>
            );
          })}
        </div>

        <div>
          <label className="label">{role === "seeker" ? "Full name" : "Company name"}</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {role === "seeker" && (
            <p className="mt-1 text-xs text-slate-500">
              Use your institution email (e.g. @mak.ac.ug) to get verified automatically.
            </p>
          )}
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner className="h-4 w-4" /> Creating…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
