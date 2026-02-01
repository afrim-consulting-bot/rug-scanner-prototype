import type { RiskLevel, CheckStatus } from "./types";

export function levelLabel(level: RiskLevel) {
  return level === "low" ? "Low" : level === "medium" ? "Medium" : "Elevated";
}

export function levelClasses(level: RiskLevel) {
  if (level === "low") return "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30";
  if (level === "medium") return "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30";
  return "bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/30";
}

export function statusClasses(status: CheckStatus) {
  if (status === "pass") return "text-emerald-200";
  if (status === "warn") return "text-amber-200";
  if (status === "fail") return "text-rose-200";
  return "text-slate-300";
}

export function statusLabel(status: CheckStatus) {
  if (status === "pass") return "Pass";
  if (status === "warn") return "Warn";
  if (status === "fail") return "Fail";
  return "Unknown";
}
