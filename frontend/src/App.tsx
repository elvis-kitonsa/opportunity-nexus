import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./auth/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SplashScreen } from "./components/SplashScreen";
import { ApplicantsPage } from "./pages/ApplicantsPage";
import { EmployerJobsPage } from "./pages/EmployerJobsPage";
import { JobDetailPage } from "./pages/JobDetailPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { MyApplicationsPage } from "./pages/MyApplicationsPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SeekerJobsPage } from "./pages/SeekerJobsPage";
import { SeekerProfilePage } from "./pages/SeekerProfilePage";
import { PageLoader } from "./components/ui";

/** Show the marketing landing page to guests; send signed-in users to their home. */
function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <LandingPage />;
  return <Navigate to={user.role === "employer" ? "/employer" : "/jobs"} replace />;
}

export default function App() {
  // Show the animated cover once per browser session, before anything else.
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem("nexus_splash_seen"),
  );

  function finishSplash() {
    sessionStorage.setItem("nexus_splash_seen", "1");
    setShowSplash(false);
  }

  return (
    <>
      {showSplash && <SplashScreen onDone={finishSplash} />}
      <Routes>
        {/* Standalone landing (its own header/footer) */}
        <Route path="/" element={<HomeRoute />} />

        {/* Standalone auth (full-screen, own header — no app chrome) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<Layout />}>
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
    </>
  );
}
