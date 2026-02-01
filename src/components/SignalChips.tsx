import type { CheckStatus, RiskCheck } from "../types";

function chipClasses(status: CheckStatus) {
  switch (status) {
    case "pass":
      return "bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-400/25";
    case "warn":
      return "bg-amber-500/10 text-amber-200 ring-1 ring-amber-400/25";
    case "fail":
      return "bg-rose-500/10 text-rose-200 ring-1 ring-rose-400/25";
    default:
      return "bg-slate-500/10 text-slate-200 ring-1 ring-slate-400/20";
  }
}

export function SignalChips({ checks }: { checks: RiskCheck[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {checks.map((c) => (
        <span
          key={c.key}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${chipClasses(
            c.status
          )}`}
          title={`${c.title}: ${c.status}`}
        >
          {c.title}
        </span>
      ))}
    </div>
  );
}
