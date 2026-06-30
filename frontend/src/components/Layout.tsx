import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { Logout, NexusMark, User } from "./icons";

function navClass({ isActive }: { isActive: boolean }) {
  return `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive
      ? "bg-brand-50 text-brand-700"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
}

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white">
              <NexusMark className="h-5 w-5" />
            </span>
            <span className="hidden sm:inline">Opportunity Nexus</span>
          </Link>

          <nav className="flex items-center gap-1.5">
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
              <div className="ml-2 flex items-center gap-2">
                <span className="hidden items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-2 pr-3 text-xs font-medium text-slate-600 sm:flex">
                  <User className="h-3.5 w-3.5" />
                  {user.email}
                </span>
                <button onClick={logout} className="btn-ghost" title="Log out">
                  <Logout className="h-4 w-4" />
                  <span className="hidden sm:inline">Log out</span>
                </button>
              </div>
            ) : (
              <>
                <NavLink to="/login" className={navClass}>
                  Log in
                </NavLink>
                <Link to="/register" className="btn-primary">
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="animate-fade-up">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Opportunity Nexus · Skills-based hiring for graduates
        </div>
      </footer>
    </div>
  );
}
