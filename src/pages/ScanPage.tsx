import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateFakeReport } from "../fakeReport";
import { upsertReport } from "../storage";

function isLikelySolAddress(v: string) {
  // Lightweight UX validation (not strict base58)
  const trimmed = v.trim();
  return trimmed.length >= 32 && trimmed.length <= 64;
}

export function ScanPage() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const canSubmit = useMemo(() => isLikelySolAddress(tokenAddress) && !busy, [tokenAddress, busy]);

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
      // fake network delay for realism
      await new Promise((r) => setTimeout(r, 450));
      const report = generateFakeReport(addr);
      upsertReport(report);
      nav(`/report/${report.id}`);
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
            placeholder="Paste Solana token address (e.g. 7xKX…9Qp)"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-base text-white placeholder:text-slate-500 outline-none ring-0 focus:border-white/25 focus:bg-black/25"
          />
          <div className="text-xs text-slate-400">We don’t connect wallets or execute transactions.</div>
          {error ? <div className="text-sm text-rose-200">{error}</div> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              Free tier: <span className="text-slate-300">3 scans/day</span>
            </div>
            <div className="flex flex-col items-start gap-1 sm:items-end">
              <button
                disabled={!canSubmit}
                className="inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0b1020] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {busy ? "Scanning…" : "Scan Token Risk"}
              </button>
              <div className="text-[11px] text-slate-500">Takes ~3 seconds</div>
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
