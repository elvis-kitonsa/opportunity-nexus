interface Props {
  score: number;
  size?: "sm" | "md";
}

/** Colour-coded match percentage badge with a status dot. */
export function MatchBadge({ score, size = "sm" }: Props) {
  const { chip, dot } =
    score >= 70
      ? { chip: "bg-green-100 text-green-800", dot: "bg-green-500" }
      : score >= 40
        ? { chip: "bg-amber-100 text-amber-800", dot: "bg-amber-500" }
        : { chip: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };

  const sizing = size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <span className={`chip font-semibold ${chip} ${sizing}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {Math.round(score)}% match
    </span>
  );
}
