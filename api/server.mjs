import http from "node:http";
import { URL } from "node:url";
import dotenv from "dotenv";

// Load local dev env (Vite uses .env* for client; Node needs explicit load)
// We intentionally keep secrets in .env.local and never commit it.
dotenv.config({ path: ".env.local" });

const PORT = process.env.API_PORT ? Number(process.env.API_PORT) : 8789;
const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type, x-api-key",
  });
  res.end(payload);
}

async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

async function solanaRpc(method, params) {
  if (!SOLANA_RPC_URL) throw new Error("SOLANA_RPC_URL missing");
  const r = await fetch(SOLANA_RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await r.json();
  if (j?.error) throw new Error(j.error?.message || "RPC error");
  return j.result;
}

async function birdeye(path) {
  if (!BIRDEYE_API_KEY) throw new Error("BIRDEYE_API_KEY missing");
  const r = await fetch(`https://public-api.birdeye.so${path}`, {
    headers: { "X-API-KEY": BIRDEYE_API_KEY },
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.message || `Birdeye HTTP ${r.status}`);
  return j;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function riskLevel(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function makeId() {
  return crypto.randomUUID();
}

function nowIso() {
  return new Date().toISOString();
}

function safeNum(x) {
  const n = typeof x === "number" ? x : Number(x);
  return Number.isFinite(n) ? n : null;
}

function formatUsd(n) {
  if (n == null) return null;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${Math.round(n).toLocaleString()}`;
  }
}

async function buildReport(tokenAddress) {
  // 1) Birdeye overview (price, liquidity, market cap, etc.)
  let overview = null;
  let oErr = null;
  try {
    // Birdeye: token_overview endpoint
    overview = await birdeye(`/defi/token_overview?address=${encodeURIComponent(tokenAddress)}`);
  } catch (e) {
    oErr = String(e?.message || e);
  }

  // 2) Solana RPC: supply + largest accounts (for holder concentration)
  let supply = null;
  let largest = null;
  let rErr = null;
  try {
    supply = await solanaRpc("getTokenSupply", [tokenAddress]);
    largest = await solanaRpc("getTokenLargestAccounts", [tokenAddress]);
  } catch (e) {
    rErr = String(e?.message || e);
  }

  // Extract some numbers (best-effort; schemas vary)
  const o = overview?.data || overview?.result || overview;
  const price = safeNum(o?.price);
  const liquidity = safeNum(o?.liquidity);
  const fdv = safeNum(o?.fdv);
  const mc = safeNum(o?.mc);
  const vol24h = safeNum(o?.v24h || o?.volume24h);

  // Holder concentration heuristic
  let top10Pct = null;
  try {
    const totalUi = safeNum(supply?.value?.uiAmount);
    const accounts = Array.isArray(largest?.value) ? largest.value : [];
    if (totalUi && accounts.length) {
      const top10 = accounts.slice(0, 10).reduce((sum, a) => sum + (safeNum(a?.uiAmount) || 0), 0);
      top10Pct = clamp((top10 / totalUi) * 100, 0, 100);
    }
  } catch {
    // ignore
  }

  // Risk scoring (simple, explainable)
  let score = 0;
  const drivers = [];
  const checks = [];

  // Liquidity
  if (liquidity == null) {
    checks.push({
      key: "liquidity",
      title: "Liquidity depth",
      status: oErr ? "unknown" : "unknown",
      short: "Liquidity data unavailable",
      whyItMatters: "Low liquidity makes it easier to rug or manipulate price.",
      details: oErr ? `Birdeye: ${oErr}` : undefined,
    });
    score += 10;
  } else if (liquidity < 20000) {
    checks.push({
      key: "liquidity",
      title: "Liquidity depth",
      status: "fail",
      short: "Very low liquidity",
      whyItMatters: "Low liquidity makes it easier to rug or manipulate price.",
      details: `Liquidity ~${formatUsd(liquidity)} (rule-of-thumb: < $20k is fragile).`,
    });
    score += 35;
    drivers.push(`Liquidity: very low (~${formatUsd(liquidity)})`);
  } else if (liquidity < 100000) {
    checks.push({
      key: "liquidity",
      title: "Liquidity depth",
      status: "warn",
      short: "Low-to-moderate liquidity",
      whyItMatters: "Thin liquidity increases slippage and exit risk.",
      details: `Liquidity ~${formatUsd(liquidity)} (rule-of-thumb: < $100k is thin).`,
    });
    score += 18;
    drivers.push(`Liquidity: thin (~${formatUsd(liquidity)})`);
  } else {
    checks.push({
      key: "liquidity",
      title: "Liquidity depth",
      status: "pass",
      short: "Liquidity looks decent",
      whyItMatters: "Deeper liquidity reduces rug/exit risk and slippage.",
      details: `Liquidity ~${formatUsd(liquidity)}.`,
    });
    score += 5;
  }

  // Holder concentration
  if (top10Pct == null) {
    checks.push({
      key: "holders",
      title: "Holder concentration",
      status: rErr ? "unknown" : "unknown",
      short: "Holder data unavailable",
      whyItMatters: "High concentration can enable coordinated dumps or sudden liquidity exits.",
      details: rErr ? `RPC: ${rErr}` : undefined,
    });
    score += 10;
  } else if (top10Pct >= 60) {
    checks.push({
      key: "holders",
      title: "Holder concentration",
      status: "fail",
      short: "Very concentrated",
      whyItMatters: "A small group controlling supply can dump quickly.",
      details: `Top 10 holders control ~${top10Pct.toFixed(1)}% of supply (heuristic).`,
    });
    score += 30;
    drivers.push(`Holders: top 10 control ~${top10Pct.toFixed(0)}%`);
  } else if (top10Pct >= 35) {
    checks.push({
      key: "holders",
      title: "Holder concentration",
      status: "warn",
      short: "Moderately concentrated",
      whyItMatters: "Higher concentration increases dump risk.",
      details: `Top 10 holders control ~${top10Pct.toFixed(1)}% of supply (heuristic).`,
    });
    score += 16;
    drivers.push(`Holders: top 10 ~${top10Pct.toFixed(0)}%`);
  } else {
    checks.push({
      key: "holders",
      title: "Holder concentration",
      status: "pass",
      short: "Distribution looks okay",
      whyItMatters: "Broader distribution can reduce coordinated dump risk.",
      details: `Top 10 holders control ~${top10Pct.toFixed(1)}% of supply (heuristic).`,
    });
    score += 6;
  }

  // Volume sanity
  if (vol24h != null && liquidity != null && liquidity > 0) {
    const turnover = vol24h / liquidity;
    if (turnover > 8) {
      checks.push({
        key: "turnover",
        title: "Trading turnover vs liquidity",
        status: "warn",
        short: "High turnover",
        whyItMatters: "Very high turnover can indicate churn or wash trading on thin pools.",
        details: `24h volume ~${formatUsd(vol24h)} vs liquidity ~${formatUsd(liquidity)} (turnover ~${turnover.toFixed(1)}x).`,
      });
      score += 10;
      drivers.push("Trading: unusually high turnover vs liquidity");
    } else {
      checks.push({
        key: "turnover",
        title: "Trading turnover vs liquidity",
        status: "pass",
        short: "Turnover looks normal",
        whyItMatters: "Helps spot extreme churn on thin liquidity.",
        details: `24h volume ~${formatUsd(vol24h)} vs liquidity ~${formatUsd(liquidity)} (turnover ~${turnover.toFixed(1)}x).`,
      });
      score += 3;
    }
  } else {
    checks.push({
      key: "turnover",
      title: "Trading turnover vs liquidity",
      status: "unknown",
      short: "Not enough data",
      whyItMatters: "Helps spot extreme churn on thin liquidity.",
    });
    score += 5;
  }

  // Metadata placeholder (until we parse mint + authorities properly)
  checks.push({
    key: "authorities",
    title: "Authorities / mint control",
    status: "unknown",
    short: "Not yet implemented",
    whyItMatters: "Active mint/freeze authority can enable unexpected supply or transfer restrictions.",
    details: "Next step: parse mint account and confirm mint/freeze authority status.",
  });
  score += 8;

  score = clamp(Math.round(score), 0, 99);

  // Top drivers: cap to 3, fill if needed
  const topDrivers = drivers.slice(0, 3);
  while (topDrivers.length < 3) topDrivers.push("Data still loading into MVP checks");

  return {
    id: makeId(),
    createdAtIso: nowIso(),
    chain: "solana",
    tokenAddress,
    tokenName: o?.name || undefined,
    tokenSymbol: o?.symbol || undefined,
    riskScore: score,
    riskLevel: riskLevel(score),
    topDrivers,
    checks,
  };
}

const server = http.createServer(async (req, res) => {
  try {
    // Preflight
    if (req.method === "OPTIONS") return json(res, 204, { ok: true });

    const u = new URL(req.url || "/", `http://${req.headers.host}`);

    if (u.pathname === "/health") {
      return json(res, 200, {
        ok: true,
        hasBirdeye: Boolean(BIRDEYE_API_KEY),
        hasRpc: Boolean(SOLANA_RPC_URL),
      });
    }

    if (u.pathname === "/api/report" && req.method === "POST") {
      const body = await readJson(req);
      const tokenAddress = String(body?.tokenAddress || "").trim();
      if (!tokenAddress) return json(res, 400, { error: "tokenAddress required" });

      const report = await buildReport(tokenAddress);
      return json(res, 200, { report });
    }

    return json(res, 404, { error: "not found" });
  } catch (e) {
    return json(res, 500, { error: String(e?.message || e) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[api] listening on http://127.0.0.1:${PORT}`);
});
