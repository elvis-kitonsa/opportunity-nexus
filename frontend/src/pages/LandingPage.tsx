import { Link } from "react-router-dom";

import {
  ArrowRight,
  Briefcase,
  Check,
  NexusMark,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "../components/icons";

/** Public marketing landing page shown at `/` to signed-out visitors. */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <Hero />
      <LogosStrip />
      <MatchPreviewSection />
      <Features />
      <AudienceSection />
      <HowItWorks />
      <CtaBanner />
      <MarketingFooter />
    </div>
  );
}

function MarketingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white">
            <NexusMark className="h-5 w-5" />
          </span>
          Opportunity Nexus
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/login" className="btn-ghost">
            Log in
          </Link>
          <Link to="/register" className="btn-primary">
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-hero-grid [background-size:24px_24px]" />
      <div className="absolute inset-x-0 -top-32 -z-10 mx-auto h-72 max-w-3xl rounded-full bg-brand-200/40 blur-3xl" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Sparkles className="h-3.5 w-3.5" />
            Skills-based matching for early-career talent
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Land the role you're{" "}
            <span className="gradient-text">actually built for.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600 lg:mx-0">
            Opportunity Nexus matches university and technical-institute graduates to jobs by
            weighted skill fit — so you see roles ranked by how well you match, and employers
            see the candidates who can do the work.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link to="/register" className="btn-primary px-6 py-3 text-base">
              Get matched
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="btn-secondary px-6 py-3 text-base">
              I already have an account
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Free for job seekers · Verified institution emails get a trust badge
          </p>
        </div>

        {/* Hero photo (clean — no overlapping card) */}
        <div className="relative">
          <div
            className="relative overflow-hidden rounded-3xl bg-brand-gradient shadow-glow"
            style={{ aspectRatio: "4 / 3" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/hero.jpg')" }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, rgba(9,45,110,0.20) 0%, rgba(9,45,110,0.02) 40%, rgba(6,26,60,0.28) 100%)",
              }}
            />
            {/* small, non-obstructing match badge */}
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-slate-800">92% skills match</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A small decorative preview of ranked match cards. */
function ScoreShowcase() {
  const rows = [
    { title: "Junior Backend Engineer", company: "Pesapal", score: 92, tone: "green" },
    { title: "Data Analyst (Graduate)", company: "Sun King", score: 78, tone: "green" },
    { title: "Frontend Developer", company: "Andela", score: 64, tone: "amber" },
  ] as const;
  return (
    <div className="w-full">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
        <div className="mb-2 flex items-center gap-2 px-2 pt-1 text-xs font-medium text-slate-400">
          <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
          <span className="ml-2">Jobs matched to you</span>
        </div>
        <ul className="space-y-2 text-left">
          {rows.map((r) => (
            <li
              key={r.title}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">{r.title}</p>
                <p className="text-xs text-slate-500">{r.company}</p>
              </div>
              <span
                className={`chip ${
                  r.tone === "green"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {r.score}% match
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Photo of a subject with a graceful gradient fallback + rounded frame. */
function Photo({ src, className = "" }: { src: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-brand-gradient shadow-card ${className}`}>
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${src}')` }} />
    </div>
  );
}

/** Product-style section: the ranked match preview beside an explanation. */
function MatchPreviewSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <ScoreShowcase />
        </div>
        <div className="order-1 lg:order-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Target className="h-3.5 w-3.5" /> Explainable matching
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
            See every role ranked by how well you fit.
          </h2>
          <p className="mt-4 text-slate-600">
            Each listing shows a 0–100% score from weighted skill overlap — plus exactly which
            skills you match and which you're missing, so you always know where to focus next.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Weighted by how important each skill is to the role",
              "Forgiving for juniors — a claimed skill always counts",
              "The same engine ranks candidates for employers",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Two photo+text rows: one for seekers, one for employers. */
function AudienceSection() {
  return (
    <section className="border-t border-slate-100 bg-slate-50/60">
      <div className="mx-auto max-w-6xl space-y-20 px-4 py-20">
        {/* For seekers */}
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Photo src="/images/community.jpg" className="aspect-[4/3]" />
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <Users className="h-3.5 w-3.5" /> For job seekers
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
              Built for graduates entering the workforce.
            </h2>
            <p className="mt-4 text-slate-600">
              Register with your institution email to earn a verified badge, showcase your skills,
              GitHub and education, and get discovered by employers who need exactly what you've
              built — no years of experience required.
            </p>
            <Link to="/register" className="btn-primary mt-6 w-fit">
              Create your profile <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* For employers */}
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Photo src="/images/employers.jpg" className="aspect-[4/3] lg:order-2" />
          <div className="lg:order-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <Briefcase className="h-3.5 w-3.5" /> For employers
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
              Hire the right graduate, faster.
            </h2>
            <p className="mt-4 text-slate-600">
              Post a role with weighted skill criteria and review applicants ranked by fit — plus
              suggested candidates from the wider talent pool who match, even if they haven't
              applied yet.
            </p>
            <Link to="/register" className="btn-secondary mt-6 w-fit">
              Post a listing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogosStrip() {
  return (
    <section className="border-y border-slate-100 bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
          Built for graduates from onboarded institutions
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-semibold text-slate-500">
          <span>Makerere University</span>
          <span>Kyambogo University</span>
          <span>MUBS</span>
          <span>Technical Institutes</span>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Target,
    title: "Explainable match scores",
    body: "Every job shows a 0–100% fit based on weighted skill overlap — plus exactly which skills you match and which you're missing.",
  },
  {
    icon: ShieldCheck,
    title: "Verified profiles",
    body: "Register with your institution email (e.g. @mak.ac.ug) and earn an automatic verification badge employers trust.",
  },
  {
    icon: Briefcase,
    title: "Roles that fit juniors",
    body: "Self-rated proficiency means modest beginners aren't punished. The engine rewards real skill coverage, not years of experience.",
  },
  {
    icon: Users,
    title: "Two-sided ranking",
    body: "Seekers see jobs ranked by fit; employers see applicants — and suggested candidates from the wider pool — ranked the same way.",
  },
];

function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Hiring that rewards what you can do
        </h2>
        <p className="mt-3 text-slate-600">
          A matching engine designed for entry-level talent, not buzzword bingo.
        </p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="card-interactive">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  {
    label: "For seekers",
    items: [
      "Register with your school email and get verified",
      "Add your skills, GitHub and education",
      "Browse jobs ranked by how well you fit",
      "Apply — your match score is snapshotted",
    ],
  },
  {
    label: "For employers",
    items: [
      "Post a listing with weighted skill criteria",
      "An admin publishes it after a quick review",
      "See applicants ranked by match score",
      "Discover suggested candidates from the pool",
    ],
  },
];

function HowItWorks() {
  return (
    <section className="border-t border-slate-100 bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">How it works</h2>
          <p className="mt-3 text-slate-600">Two sides, one shared definition of a good match.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {STEPS.map((col) => (
            <div key={col.label} className="card">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                {col.label}
              </p>
              <ul className="mt-4 space-y-3">
                {col.items.map((item, i) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-14 text-center text-white sm:px-12">
        <div className="absolute inset-0 -z-0 bg-hero-grid opacity-20 [background-size:22px_22px]" />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight">Ready to find your match?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">
            Build your profile in minutes and start seeing roles ranked by the skills you've
            actually built.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="btn inline-flex bg-white px-6 py-3 text-base text-brand-700 hover:bg-slate-100"
            >
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="flex items-center gap-2 text-sm text-white/90">
              <Check className="h-4 w-4" /> No cost for job seekers
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarketingFooter() {
  return (
    <footer className="border-t border-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row">
        <div className="flex items-center gap-2 font-semibold text-slate-700">
          <NexusMark className="h-5 w-5 text-brand-600" />
          Opportunity Nexus
        </div>
        <p>© {new Date().getFullYear()} Opportunity Nexus. Skills-based hiring for graduates.</p>
      </div>
    </footer>
  );
}
