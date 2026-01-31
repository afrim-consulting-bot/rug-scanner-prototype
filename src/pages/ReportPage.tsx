import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { enableShare, findById, upsertReport } from "../storage";
import { levelClasses, levelLabel, statusClasses, statusLabel } from "../ui";
import { generateFakeReport } from "../fakeReport";

export function ReportPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const report = useMemo(() => (id ? findById(id) : undefined), [id]);

  if (!report) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-white">Report not found.</div>
        <button
          className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0b1020]"
          onClick={() => nav("/")}
        >
          Back to Scan
        </button>
      </div>
    );
  }

  // Narrow for TS across callbacks
  const r = report;

  async function onShare() {
    const updated = enableShare(r.id);
    if (!updated?.shareId) return;
    const url = `${window.location.origin}/r/${updated.shareId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  async function onRescan() {
    const next = generateFakeReport(r.tokenAddress);
    // keep same id so user feels it updated
    const updated = { ...next, id: r.id, shareId: r.shareId };
    upsertReport(updated);
    // cheap way to refresh
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="text-xs uppercase tracking-wider text-slate-400">Rug Scanner</div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Risk Report</h1>
        <div className="text-sm text-slate-300">
          Token: <span className="text-slate-200">{r.tokenAddress}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${levelClasses(r.riskLevel)}`}>
                {levelLabel(r.riskLevel)}
              </span>
              <span className="text-sm text-slate-300">
                Risk Score: <span className="text-white font-semibold">{r.riskScore}</span> / 99
              </span>
            </div>

            <div>
              <div className="text-sm font-semibold text-white">Top drivers</div>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                {r.topDrivers.map((d) => (
                  <li key={d}>• {d}</li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-slate-400">Updated: {new Date(r.createdAtIso).toLocaleString()}</div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex gap-2">
              <button
                onClick={onShare}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0b1020]"
              >
                {copied ? "Copied" : "Share Risk Report"}
              </button>
              <button
                onClick={onRescan}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Re-scan
              </button>
            </div>
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
          {r.checks.map((c) => (
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

    </div>
  );
}
