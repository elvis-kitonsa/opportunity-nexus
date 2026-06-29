interface Props {
  score: number;
}

/** Colour-coded match percentage badge. */
export function MatchBadge({ score }: Props) {
  const tone =
    score >= 70
      ? "bg-green-100 text-green-800"
      : score >= 40
        ? "bg-amber-100 text-amber-800"
        : "bg-slate-100 text-slate-600";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {Math.round(score)}% match
    </span>
  );
}
