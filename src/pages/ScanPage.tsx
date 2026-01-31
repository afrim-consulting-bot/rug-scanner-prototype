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
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Generate a Risk Report</h1>
        <p className="max-w-2xl text-slate-300">
          Fast, explainable Solana token risk snapshots you can share. This prototype uses <span className="text-slate-200">fake data</span> to polish UX.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-slate-200">Solana token address</label>
          <input
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Paste token address…"
            className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none ring-0 focus:border-white/20"
          />
          {error ? <div className="text-sm text-rose-200">{error}</div> : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-400">
              Free tier: <span className="text-slate-200">3 scans/day</span> (prototype does not enforce limits).
            </div>
            <button
              disabled={!canSubmit}
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0b1020] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Scanning…" : "Generate Risk Report"}
            </button>
          </div>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-white">Summary first</div>
          <div className="mt-1 text-sm text-slate-300">The share page shows a clean summary with optional expand.</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-white">0–99 score</div>
          <div className="mt-1 text-sm text-slate-300">Avoids “100 = guarantee” vibes.</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-white">Unguessable share links</div>
          <div className="mt-1 text-sm text-slate-300">Public, unlisted URLs for virality.</div>
        </div>
      </div>
    </div>
  );
}
