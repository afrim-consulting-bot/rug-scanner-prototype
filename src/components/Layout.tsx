import { Link, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1020] via-[#0b1020] to-[#070a14]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b1020]/85 shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2 sm:py-3">
          <Link to="/" className="flex items-center gap-3" aria-label="Rug Scanner">
            <img
              src="/brand/rugscanner-horizontal.png"
              alt="RugScanner.net"
              className="h-8 w-auto select-none sm:h-9"
              draggable={false}
            />
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200 ring-1 ring-white/10">
              Beta
            </span>
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link className="text-slate-200 hover:text-white" to="/">
              Scan
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-6 text-xs leading-relaxed text-slate-600">
          <div className="flex flex-col gap-1.5">
            <div>
              Signals-based risk snapshot. Not a code audit or investment advice.
            </div>
            <div>
              Re-scan before buying.
            </div>
            <div className="text-slate-600">Built by Vault6 Media.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
