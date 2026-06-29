import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { apiErrorMessage } from "../lib/apiClient";
import type { UserRole } from "../types";

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
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">Create your account</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="grid grid-cols-2 gap-2">
          {(["seeker", "employer"] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={role === r ? "btn-primary" : "btn-secondary"}
            >
              {r === "seeker" ? "Job seeker" : "Employer"}
            </button>
          ))}
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
          {submitting ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-600">
          Log in
        </Link>
      </p>
    </div>
  );
}
