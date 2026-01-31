export type RiskLevel = "low" | "medium" | "high";
export type CheckStatus = "pass" | "warn" | "fail" | "unknown";

export type RiskCheck = {
  key: string;
  title: string;
  status: CheckStatus;
  short: string;
  whyItMatters: string;
  details?: string;
};

export type RiskReport = {
  id: string; // internal id
  shareId?: string; // unguessable id for public view
  createdAtIso: string;
  chain: "solana";
  tokenAddress: string;
  tokenSymbol?: string;
  tokenName?: string;
  riskScore: number; // 0–99
  riskLevel: RiskLevel;
  topDrivers: string[];
  checks: RiskCheck[];
};
