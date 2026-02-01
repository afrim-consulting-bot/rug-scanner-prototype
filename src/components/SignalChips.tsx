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

function dotClasses(status: CheckStatus) {
  switch (status) {
    case "pass":
      return "bg-emerald-300";
    case "warn":
      return "bg-amber-300";
    case "fail":
      return "bg-rose-300";
    default:
      return "bg-slate-300";
  }
}

function shortTitle(c: RiskCheck) {
  switch (c.key) {
    case "authorities":
      return "Authorities";
    case "liquidity":
      return "Liquidity";
    case "holders":
      return "Holders";
    case "trading":
      return "Trading";
    case "metadata":
      return "Metadata";
    default:
      return c.title;
  }
}

export function SignalChips({ checks }: { checks: RiskCheck[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {checks.map((c) => (
        <span
          key={c.key}
          className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${chipClasses(
            c.status
          )}`}
          title={`${c.title}: ${c.status}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dotClasses(c.status)}`} aria-hidden="true" />
          <span className="leading-none">{shortTitle(c)}</span>
        </span>
      ))}
    </div>
  );
}
