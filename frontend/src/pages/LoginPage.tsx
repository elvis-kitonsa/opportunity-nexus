import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { apiErrorMessage } from "../lib/apiClient";
import { AuthShell } from "../components/AuthShell";
import { ArrowRight } from "../components/icons";
import { ErrorText, Spinner } from "../components/ui";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(user.role === "employer" ? "/employer" : "/jobs");
    } catch (err) {
      setError(apiErrorMessage(err, "Login failed."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to see your matches."
      altHref="/register"
      altLabel="Get started"
      footer={
        <>
          No account?{" "}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorText>{error}</ErrorText>}
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner className="h-4 w-4" /> Signing in…
            </>
          ) : (
            <>
              Log in <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
