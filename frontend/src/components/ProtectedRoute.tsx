import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth, type UserRole } from "../auth/AuthContext";

interface Props {
  children: ReactNode;
  role?: UserRole;
}

export function ProtectedRoute({ children, role }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-slate-500">Loading…</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role && user.role !== role) {
    // Send users to the home route appropriate for their role.
    return <Navigate to={user.role === "employer" ? "/employer" : "/jobs"} replace />;
  }
  return <>{children}</>;
}
