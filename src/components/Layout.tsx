import { Link, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1020] via-[#0b1020] to-[#070a14]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b1020]/75 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3" aria-label="Rug Scanner">
            <img
              src="/brand/rugscanner-logo.png"
              alt=""
              aria-hidden="true"
              className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10"
            />
            <div className="leading-tight">
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white">
                Rug Scanner
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200 ring-1 ring-white/10">
                  Beta
                </span>
              </div>
              <div className="text-xs text-slate-300">Solana Risk Report</div>
            </div>
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link className="text-slate-300 hover:text-white" to="/">
              Scan
            </Link>
            <a
              className="text-slate-300 hover:text-white"
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-slate-500">
          <div className="flex flex-col gap-2">
            <div>
              Educational signals only. Not a code audit or investment advice.
            </div>
            <div>
              Risk can change quickly — re-scan before buying.
            </div>
            <div className="text-slate-600">Built by Vault6 Media.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
