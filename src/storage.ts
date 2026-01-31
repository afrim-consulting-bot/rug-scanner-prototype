import type { RiskReport } from "./types";

const KEY = "rug-scanner:reports:v1";

export function loadReports(): RiskReport[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RiskReport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReports(reports: RiskReport[]) {
  localStorage.setItem(KEY, JSON.stringify(reports));
}

export function upsertReport(report: RiskReport) {
  const all = loadReports();
  const idx = all.findIndex((r) => r.id === report.id);
  if (idx >= 0) all[idx] = report;
  else all.unshift(report);
  saveReports(all);
}

export function findByShareId(shareId: string): RiskReport | undefined {
  return loadReports().find((r) => r.shareId === shareId);
}

export function findById(id: string): RiskReport | undefined {
  return loadReports().find((r) => r.id === id);
}

export function enableShare(id: string): RiskReport | undefined {
  const all = loadReports();
  const idx = all.findIndex((r) => r.id === id);
  if (idx < 0) return undefined;
  const existing = all[idx];
  const shareId = existing.shareId ?? crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().slice(0, 8);
  const updated: RiskReport = { ...existing, shareId };
  all[idx] = updated;
  saveReports(all);
  return updated;
}
