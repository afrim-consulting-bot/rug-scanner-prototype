import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { enableShare, findById, upsertReport } from "../storage";
import { levelClasses, levelLabel, statusClasses, statusLabel } from "../ui";
import { generateFakeReport } from "../fakeReport";
import { SignalChips } from "../components/SignalChips";

export function ReportPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyOk, setCopyOk] = useState(true);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

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
    setShareUrl(url);

    // Show immediate feedback, even if clipboard permissions are slow/blocked.
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);

    setCopyOk(true);
    void navigator.clipboard.writeText(url).catch(() => {
      // Clipboard can fail in some contexts (permissions, non-secure, automation).
      // Still show the URL so the user can copy it manually.
      setCopyOk(false);
    });
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
        <h1 className="text-4xl font-semibold tracking-tight text-white">Risk Report</h1>
        <div className="text-sm text-slate-300">
          Token: <span className="font-mono text-slate-200">{r.tokenAddress}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${levelClasses(r.riskLevel)}`}>
                {levelLabel(r.riskLevel)}
              </span>
              <span className="text-sm text-slate-300">
                Risk Score: <span className="text-white font-semibold tabular-nums">{r.riskScore}</span> / 99
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold text-white">Signals checked</div>
              <SignalChips checks={r.checks} />
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
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0b1020] transition hover:bg-slate-100"
              >
                {copied ? (copyOk ? "Link copied" : "Link ready") : "Share Risk Report"}
              </button>
              <button
                onClick={onRescan}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Re-scan
              </button>
            </div>

            {shareUrl ? (
              <div className="flex flex-col items-start gap-1 sm:items-end">
                <a
                  href={shareUrl}
                  className="text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
                >
                  Open shared report
                </a>
                {!copyOk ? (
                  <div className="text-xs text-slate-400">Clipboard blocked — copy the link from the address bar.</div>
                ) : null}
              </div>
            ) : null}

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
              className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 shadow-[0_10px_28px_rgba(0,0,0,0.28)]"
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
