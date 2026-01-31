import { Link, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1020] via-[#0b1020] to-[#070a14]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b1020]/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/brand/rugscanner-logo.png"
              alt="Rug Scanner"
              className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10"
            />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide text-white">Rug Scanner</div>
              <div className="text-xs text-slate-300">Risk Report (prototype)</div>
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

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-slate-400">
          <div className="flex flex-col gap-2">
            <div>
              <strong className="text-slate-200">Disclaimer:</strong> signals-based risk snapshot — not a code audit. Educational content only; not investment advice.
            </div>
            <div>Risk can change quickly — re-scan before buying.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
