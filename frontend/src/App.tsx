import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./auth/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ApplicantsPage } from "./pages/ApplicantsPage";
import { EmployerJobsPage } from "./pages/EmployerJobsPage";
import { JobDetailPage } from "./pages/JobDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { MyApplicationsPage } from "./pages/MyApplicationsPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SeekerJobsPage } from "./pages/SeekerJobsPage";
import { SeekerProfilePage } from "./pages/SeekerProfilePage";

/** Send authenticated users to their role's home; others to login. */
function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "employer" ? "/employer" : "/jobs"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Seeker */}
        <Route
          path="/jobs"
          element={
            <ProtectedRoute role="seeker">
              <SeekerJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:jobId"
          element={
            <ProtectedRoute role="seeker">
              <JobDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute role="seeker">
              <MyApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute role="seeker">
              <SeekerProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Employer */}
        <Route
          path="/employer"
          element={
            <ProtectedRoute role="employer">
              <EmployerJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/:jobId/applicants"
          element={
            <ProtectedRoute role="employer">
              <ApplicantsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
