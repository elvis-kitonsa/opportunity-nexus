import { useEffect, useState } from "react";

import { NexusMark } from "./icons";

interface Props {
  onDone?: () => void;
  /** How long the splash stays before it starts fading out (ms). */
  duration?: number;
  /** Background photo (served from /public). Falls back to the brand gradient. */
  image?: string;
}

/** Full-screen cinematic cover shown before the app: photo + zoom + brand reveal. */
export function SplashScreen({ onDone, duration = 2900, image = "/images/splash.jpg" }: Props) {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setLeaving(true), duration);
    const t2 = window.setTimeout(() => {
      setGone(true);
      onDone?.();
    }, duration + 650);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [duration, onDone]);

  function dismiss() {
    setLeaving(true);
    window.setTimeout(() => {
      setGone(true);
      onDone?.();
    }, 650);
  }

  if (gone) return null;

  return (
    <div
      onClick={dismiss}
      className={`splash-fade fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-brand-gradient text-white ${
        leaving ? "invisible opacity-0" : "opacity-100"
      }`}
    >
      {/* photo layer (transparent if the file is missing -> gradient shows) */}
      <div
        className="animate-kenburns absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${image}')` }}
      />
      {/* legibility overlay: deep blue, darker toward the edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,26,60,0.55) 0%, rgba(6,26,60,0.45) 45%, rgba(6,26,60,0.82) 100%)",
        }}
      />
      <div
        className="absolute inset-0 bg-hero-grid opacity-15"
        style={{ backgroundSize: "26px 26px" }}
      />

      {/* brand lockup */}
      <div className="animate-rise relative z-10 flex flex-col items-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur">
          <NexusMark className="h-9 w-9" />
        </div>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight drop-shadow-sm">
          Opportunity Nexus
        </h1>
        <p className="mt-2 text-white/85">Matching talent to opportunity</p>
      </div>

      {/* loading bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="mx-auto mb-16 h-1 w-56 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white"
            style={{ animation: `loadbar ${duration}ms linear forwards` }}
          />
        </div>
        <p className="pb-6 text-center text-xs text-white/60">Click anywhere to skip</p>
      </div>
    </div>
  );
}
