import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

function navClass({ isActive }: { isActive: boolean }) {
  return `text-sm font-medium ${isActive ? "text-brand-600" : "text-slate-600 hover:text-slate-900"}`;
}

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-brand-700">
            Opportunity Nexus
          </Link>
          <nav className="flex items-center gap-5">
            {user?.role === "seeker" && (
              <>
                <NavLink to="/jobs" className={navClass}>
                  Matched Jobs
                </NavLink>
                <NavLink to="/applications" className={navClass}>
                  My Applications
                </NavLink>
                <NavLink to="/profile" className={navClass}>
                  Profile
                </NavLink>
              </>
            )}
            {user?.role === "employer" && (
              <NavLink to="/employer" className={navClass}>
                My Listings
              </NavLink>
            )}
            {user ? (
              <button onClick={logout} className="btn-secondary">
                Log out
              </button>
            ) : (
              <NavLink to="/login" className={navClass}>
                Log in
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
