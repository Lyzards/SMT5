import { PeerAnalysis, ScoringWeights } from "@/types";

export interface CSVExportOptions {
  banks: PeerAnalysis[];
  weights: ScoringWeights;
  source: string;
  reportDate: string | null;
  priceDate: string | null;
  mode: string;
}

/**
 * Generates RFC 4180 compliant CSV content for PeerGap dataset.
 */
export function generatePeerGapCSV(options: CSVExportOptions): string {
  const { banks, weights, source, reportDate, priceDate, mode } = options;

  const metadataLines = [
    `# PeerGap IDX - Indonesian Banking Intelligence Export`,
    `# Export Generated: ${new Date().toISOString()}`,
    `# Data Source: ${source}`,
    `# Data Mode: ${mode}`,
    `# Financial Reporting Date: ${reportDate ?? "Unavailable"}`,
    `# Market Price Date: ${priceDate ?? "Unavailable"}`,
    `# Applied Scoring Weights: ROE=${weights.roe}%, ROA=${weights.roa}%, CIR=${weights.cir}%`,
    `# Reference Universe: ${banks.map((b) => b.normalizedSymbol).join(", ")}`,
    `# Disclaimer: Research discovery tool only. Not investment advice.`,
    ``,
  ];

  const headers = [
    "Rank",
    "Ticker",
    "Bank Name",
    "ROE (%)",
    "ROE Percentile",
    "ROA (%)",
    "ROA Percentile",
    "CIR (%)",
    "CIR Percentile (Inverted)",
    "P/B Multiple",
    "Valuation Percentile (P/B)",
    "Quality Score",
    "PeerGap Score",
    "Status",
    "Market Cap (IDR)",
    "Last Price (IDR)",
    "Reporting Period",
    "Explanation",
  ];

  const escapeCSV = (str: string | number | null | undefined): string => {
    if (str === null || str === undefined) return "";
    const s = String(str);
    if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = banks.map((b) => [
    b.rank ?? "N/A",
    b.symbol,
    escapeCSV(b.companyName),
    b.roe !== null ? (b.roe * 100).toFixed(2) : "N/A",
    b.roePercentile !== null ? b.roePercentile.toFixed(1) : "N/A",
    b.roa !== null ? (b.roa * 100).toFixed(2) : "N/A",
    b.roaPercentile !== null ? b.roaPercentile.toFixed(1) : "N/A",
    b.cir !== null ? (b.cir * 100).toFixed(2) : "N/A",
    b.cirPercentile !== null ? b.cirPercentile.toFixed(1) : "N/A",
    b.pb !== null ? b.pb.toFixed(2) : "N/A",
    b.valuationPercentile !== null ? b.valuationPercentile.toFixed(1) : "N/A",
    b.qualityScore !== null ? b.qualityScore.toFixed(1) : "N/A",
    b.peerGapScore !== null ? (b.peerGapScore > 0 ? `+${b.peerGapScore.toFixed(1)}` : b.peerGapScore.toFixed(1)) : "N/A",
    b.dataStatus,
    b.marketCap ?? "N/A",
    b.lastClosePrice ?? "N/A",
    escapeCSV(b.reportingPeriod),
    escapeCSV(b.explanation),
  ]);

  const csvContent = [
    ...metadataLines,
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\r\n");

  return csvContent;
}

/**
 * Triggers a client-side download of a generated CSV file.
 */
export function downloadCSV(content: string, filename = "peergap-idx-report.csv"): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
