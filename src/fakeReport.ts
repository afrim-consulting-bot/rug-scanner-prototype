import type { RiskReport, RiskLevel, RiskCheck } from "./types";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function riskLevelFromScore(score: number): RiskLevel {
  if (score <= 33) return "low";
  if (score <= 66) return "medium";
  return "high";
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickTopDrivers(level: RiskLevel): string[] {
  if (level === "low") {
    return [
      "Authorities appear constrained (no obvious control red flags)",
      "Holder concentration looks within a typical range",
      "Liquidity appears sufficient for typical trade sizes",
    ];
  }
  if (level === "medium") {
    return [
      "Holder concentration is elevated (top wallets hold a large share)",
      "Liquidity depth is moderate; large sells may incur high slippage",
      "Some signals are unknown—re-scan and verify before buying",
    ];
  }
  return [
    "Concentrated holders: top wallets control a very large share",
    "Liquidity appears fragile or inconsistent across pools",
    "Control/authority signals are unclear or potentially risky",
  ];
}

function makeChecks(level: RiskLevel): RiskCheck[] {
  const base: RiskCheck[] = [
    {
      key: "authorities",
      title: "Authorities",
      status: level === "high" ? "warn" : "pass",
      short: level === "high" ? "Some authority signals are unclear" : "No obvious authority red flags",
      whyItMatters:
        "If a token can be modified or constrained by privileged controls, your downside risk increases.",
      details:
        "This is a signals-based check. Always verify token authorities using a trusted explorer before buying.",
    },
    {
      key: "liquidity",
      title: "Liquidity",
      status: level === "low" ? "pass" : level === "medium" ? "warn" : "fail",
      short:
        level === "low"
          ? "Liquidity depth looks healthy"
          : level === "medium"
            ? "Liquidity depth is moderate"
            : "Liquidity looks fragile (high slippage risk)",
      whyItMatters:
        "Low or fragile liquidity can make exits difficult without taking major slippage.",
    },
    {
      key: "holders",
      title: "Holder concentration",
      status: level === "low" ? "pass" : level === "medium" ? "warn" : "fail",
      short:
        level === "low"
          ? "Top holders are not unusually concentrated"
          : level === "medium"
            ? "Top holders are fairly concentrated"
            : "Top holders are extremely concentrated",
      whyItMatters:
        "A few large wallets can dump and crash price, especially when liquidity is thin.",
    },
    {
      key: "trading",
      title: "Trading behavior",
      status: level === "high" ? "warn" : "pass",
      short: level === "high" ? "Unusual activity patterns detected" : "No obvious manipulation signals",
      whyItMatters:
        "Some rugs/manips show telltale patterns (spikes, imbalances, abnormal price impact).",
    },
    {
      key: "metadata",
      title: "Metadata / provenance",
      status: level === "low" ? "pass" : "unknown",
      short: level === "low" ? "Basic provenance signals look normal" : "Some provenance signals are unknown",
      whyItMatters:
        "Lack of provenance isn’t proof of a rug, but it increases uncertainty.",
    },
  ];
  return base;
}

export function generateFakeReport(tokenAddress: string): RiskReport {
  // deterministic-ish by address length, but still varied
  const base = clamp(tokenAddress.length * 3 + randomInt(-8, 8), 0, 99);
  const score = clamp(base, 0, 99);
  const level = riskLevelFromScore(score);

  return {
    id: crypto.randomUUID(),
    createdAtIso: new Date().toISOString(),
    chain: "solana",
    tokenAddress,
    tokenSymbol: "RUG",
    tokenName: "Rug Scanner Demo Token",
    riskScore: score,
    riskLevel: level,
    topDrivers: pickTopDrivers(level),
    checks: makeChecks(level),
  };
}
