import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { findByShareId } from "../storage";
import { levelClasses, levelLabel, statusClasses, statusLabel } from "../ui";

export function SharedReportPage() {
  const { shareId } = useParams();
  const [expanded, setExpanded] = useState(false);

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
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-slate-400">Rug Scanner — Shared</div>
            <div className="text-2xl font-semibold text-white">Risk Report</div>
            <div className="text-sm text-slate-300">
              Token: <span className="text-slate-200">{report.tokenAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${levelClasses(report.riskLevel)}`}>
                {levelLabel(report.riskLevel)}
              </span>
              <span className="text-sm text-slate-300">
                Score: <span className="text-white font-semibold">{report.riskScore}</span> / 99
              </span>
            </div>

            <div>
              <div className="text-sm font-semibold text-white">Top drivers</div>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                {report.topDrivers.map((d) => (
                  <li key={d}>• {d}</li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-slate-400">Updated: {new Date(report.createdAtIso).toLocaleString()}</div>
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
              className="group rounded-2xl border border-white/10 bg-white/5 p-4"
              open
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
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

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-400">
        <div>
          <strong className="text-slate-200">Disclaimer:</strong> signals-based risk snapshot — not a code audit. Educational content only; not investment advice.
        </div>
      </div>
    </div>
  );
}
