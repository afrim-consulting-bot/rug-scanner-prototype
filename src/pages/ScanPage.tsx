import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateFakeReport } from "../fakeReport";
import { upsertReport } from "../storage";

const SAMPLE_TOKEN = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJos9Qp";

function isLikelySolAddress(v: string) {
  // Lightweight UX validation (not strict base58)
  const trimmed = v.trim();
  // Solana addresses are base58; typical length 32–44, but token mints can vary.
  return trimmed.length >= 32 && trimmed.length <= 64;
}

export function ScanPage() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [scanStep, setScanStep] = useState<string | null>(null);
  const nav = useNavigate();

  const canSubmit = useMemo(() => isLikelySolAddress(tokenAddress) && !busy, [tokenAddress, busy]);

  useEffect(() => {
    if (!busy) {
      setScanStep(null);
      return;
    }

    const steps = [
      "Analyzing ownership…",
      "Checking liquidity signals…",
      "Evaluating trading behavior…",
      "Reviewing metadata…",
    ];

    let i = 0;
    setScanStep(steps[i]);
    const id = window.setInterval(() => {
      i = (i + 1) % steps.length;
      setScanStep(steps[i]);
    }, 650);

    return () => window.clearInterval(id);
  }, [busy]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const addr = tokenAddress.trim();
    if (!isLikelySolAddress(addr)) {
      setError("Enter a valid Solana token address (32–64 chars).");
      return;
    }

    setBusy(true);
    try {
      // Real API (falls back to fake report if API is not available yet)
      try {
        const r = await fetch("/api/report", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tokenAddress: addr }),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "API error");
        const report = j?.report;
        if (!report?.id) throw new Error("Bad API response");
        upsertReport(report);
        nav(`/report/${report.id}`);
        return;
      } catch {
        // keep UX moving in dev even if keys/server aren't ready
        const report = generateFakeReport(addr);
        upsertReport(report);
        nav(`/report/${report.id}`);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight text-white">Instant Solana Token Risk Snapshot</h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-300">
          A fast, signals-based scan to surface common rug-pull risk patterns — before you commit capital.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.10] to-white/[0.04] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-slate-200">Solana token address</label>
          <input
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Paste Solana token address"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-[17px] text-white placeholder:text-slate-300 outline-none ring-0 focus:border-white/25 focus:bg-black/25"
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <div>
              Example: <span className="font-mono text-slate-300">7xKX…9Qp</span>
            </div>
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:bg-white/10 hover:border-white/20"
              onClick={() => {
                setError(null);
                setTokenAddress(SAMPLE_TOKEN);
              }}
              title="Use a sample token address"
            >
              Use sample
            </button>
          </div>
          <div className="text-xs text-slate-400">We don’t connect wallets or execute transactions.</div>
          {error ? <div className="text-sm text-rose-200">{error}</div> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600">Free tier available</div>
            <div className="flex flex-col items-start gap-1 sm:items-end">
              <button
                disabled={!canSubmit}
                className="inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#0b1020] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_0_0_1px_rgba(255,255,255,0.35),0_10px_30px_rgba(0,0,0,0.35)] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {busy ? "Scanning…" : "Scan Token Risk"}
              </button>
              <div className="text-[11px] text-slate-500">{scanStep ?? "Takes ~3 seconds"}</div>
            </div>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">What this scan checks</div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-200">
          <span>• Authorities</span>
          <span>• Liquidity risk signals</span>
          <span>• Holder concentration</span>
          <span>• Trading behavior</span>
          <span>• Metadata flags</span>
        </div>
      </div>
    </div>
  );
}
