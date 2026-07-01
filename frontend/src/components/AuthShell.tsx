import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Check, NexusMark } from "./icons";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Where the top-right link points (the opposite auth action). */
  altHref: string;
  altLabel: string;
}

const PERKS = [
  "Explainable match scores",
  "Verified student profiles",
  "Roles that actually fit juniors",
];

/**
 * Full-screen, self-contained auth layout: a slim header plus a two-column card
 * (people illustration + form) centered so the whole card fits without scrolling.
 */
export function AuthShell({ title, subtitle, children, footer, altHref, altLabel }: Props) {
  return (
    <div className="app-bg flex h-screen flex-col overflow-hidden">
      <header className="flex flex-none items-center justify-between px-5 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white">
            <NexusMark className="h-5 w-5" />
          </span>
          Opportunity Nexus
        </Link>
        <Link to={altHref} className="btn-secondary">
          {altLabel}
        </Link>
      </header>

      <main className="grid flex-1 place-items-center px-4 pb-4">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card md:grid-cols-2">
          {/* Brand + photo panel (falls back to the gradient if no image) */}
          <div className="relative hidden flex-col justify-end overflow-hidden bg-brand-gradient p-7 text-white md:flex">
            {/* photo layer */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/auth.jpg')" }}
            />
            {/* blue legibility overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(9,45,110,0.72) 0%, rgba(9,45,110,0.45) 40%, rgba(6,26,60,0.86) 100%)",
              }}
            />
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                Opportunity Nexus
              </p>
              <h2 className="mt-3 text-2xl font-bold leading-snug drop-shadow-sm">
                Where graduates and employers meet.
              </h2>
              <ul className="mt-5 space-y-2">
                {PERKS.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-sm text-white/90">
                    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-white/20">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="p-7 sm:p-9">
            <div className="mb-5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
            {children}
            {footer && <div className="mt-4 text-center text-sm text-slate-600">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
