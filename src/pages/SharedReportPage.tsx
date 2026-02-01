import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { findByShareId } from "../storage";
import { levelClasses, levelLabel, statusClasses, statusLabel } from "../ui";
import { SignalChips } from "../components/SignalChips";

function scorePercentile(score: number) {
  // UX-only: approximate context for the reader (not a statistical claim).
  const pct = Math.round(50 + (score / 99) * 45);
  return Math.max(50, Math.min(99, pct));
}

function formatUpdated(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function renderDriver(d: string) {
  const idx = d.indexOf(":");
  if (idx === -1) return <span>{d}</span>;
  const head = d.slice(0, idx + 1);
  const tail = d.slice(idx + 1).trimStart();
  return (
    <>
      <span className="font-semibold text-slate-100">{head}</span> {tail}
    </>
  );
}

export function SharedReportPage() {
  const { shareId } = useParams();
  const [expanded, setExpanded] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  const report = useMemo(() => (shareId ? findByShareId(shareId) : undefined), [shareId]);

  if (!report) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-white">Shared report not found (or not shared yet).</div>
        <Link className="mt-4 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0b1020]" to="/">
          Run your own Risk Report
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Rug Scanner</div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-2xl font-semibold text-white">Shared Risk Report</div>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
                unlisted
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
              <div>
                Token: <span className="font-mono text-slate-200 break-all">{report.tokenAddress}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTokenCopied(true);
                  setTimeout(() => setTokenCopied(false), 900);
                  void navigator.clipboard.writeText(report.tokenAddress).catch(() => {
                    // ignore
                  });
                }}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:bg-white/10 hover:border-white/20"
                title="Copy token address"
              >
                {tokenCopied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${levelClasses(report.riskLevel)}`}>
                {levelLabel(report.riskLevel)} risk
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
                signals-based snapshot
              </span>
            </div>

            <div className="flex items-end gap-3">
              <div className="text-5xl font-semibold tracking-tight text-white tabular-nums">{report.riskScore}</div>
              <div className="pb-1 text-sm text-slate-300">/ 99</div>
            </div>
            <div className="text-xs text-slate-400">Higher than ~{scorePercentile(report.riskScore)}% of scanned tokens</div>

            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Signals checked</div>
              <SignalChips checks={report.checks} />
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Top drivers</div>
              <ul className="mt-2 space-y-1 text-sm text-slate-200">
                {report.topDrivers.map((d) => (
                  <li key={d}>• {renderDriver(d)}</li>
                ))}
              </ul>
              <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">What this means</div>
                <div className="mt-1">
                  This token shows multiple risk patterns often associated with rug pulls or rapid liquidity exits. Caution is warranted.
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400">Updated: {formatUpdated(report.createdAtIso)} • Data can change — run your own scan</div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0b1020]"
            >
              Run your own Risk Report
            </Link>
            <div className="text-xs text-slate-400">Free: 3 scans/day</div>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
            >
              {expanded ? "Hide details" : "Expand details"}
            </button>
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="space-y-3">
          {report.checks.map((c) => (
            <details
              key={c.key}
              className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 shadow-[0_10px_28px_rgba(0,0,0,0.28)] transition hover:border-white/20 hover:bg-white/[0.04]"
            >
              <summary className="-mx-2 flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-2 py-1 transition hover:bg-white/5">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-white">{c.title}</div>
                  <div className={`text-xs ${statusClasses(c.status)}`}>{statusLabel(c.status)} — {c.short}</div>
                </div>
                <div className="text-slate-400 group-open:rotate-180 transition">▾</div>
              </summary>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <div>
                  <span className="text-slate-200 font-semibold">Why it matters:</span> {c.whyItMatters}
                </div>
                {c.details ? <div className="text-slate-400">{c.details}</div> : null}
              </div>
            </details>
          ))}
        </div>
      ) : null}

    </div>
  );
}
