"use client";

import React, { useState, useMemo } from "react";
import { PeerAnalysis, PeerUniverseSummary } from "@/types";
import {
  formatPercent,
  formatMultiple,
  formatScore,
  formatPeerGap,
  formatCurrencyIDR,
} from "@/lib/formatters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ReferenceLine,
  Cell,
} from "recharts";
import { Check, Info, Scale, ArrowRight, ShieldAlert } from "lucide-react";

interface PeerCompareViewProps {
  summary: PeerUniverseSummary | null;
  onSelectBank: (bank: PeerAnalysis) => void;
}

export function PeerCompareView({ summary, onSelectBank }: PeerCompareViewProps) {
  const banks = summary?.banks ?? [];

  // Default selection: Top 2 banks by rank
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(() => {
    return banks.slice(0, 2).map((b) => b.normalizedSymbol);
  });

  const toggleSelect = (sym: string) => {
    if (selectedSymbols.includes(sym)) {
      if (selectedSymbols.length <= 2) return; // Keep at least 2 banks
      setSelectedSymbols(selectedSymbols.filter((s) => s !== sym));
    } else {
      if (selectedSymbols.length >= 4) return; // Maximum 4 banks
      setSelectedSymbols([...selectedSymbols, sym]);
    }
  };

  const selectedBanks = useMemo(() => {
    return banks.filter((b) => selectedSymbols.includes(b.normalizedSymbol));
  }, [banks, selectedSymbols]);

  // Generate Comparison Summary text (deterministic rule-based)
  const comparisonSummaryText = useMemo(() => {
    if (selectedBanks.length < 2) return "";

    // Highest ROE
    const bestRoe = [...selectedBanks].sort((a, b) => (b.roe ?? 0) - (a.roe ?? 0))[0];
    // Lowest CIR (best cost efficiency)
    const bestCir = [...selectedBanks].sort((a, b) => (a.cir ?? 1) - (b.cir ?? 1))[0];
    // Highest Quality
    const bestQuality = [...selectedBanks].sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0))[0];
    // Highest P/B multiple
    const highestVal = [...selectedBanks].sort((a, b) => (b.pb ?? 0) - (a.pb ?? 0))[0];
    const lowestVal = [...selectedBanks].sort((a, b) => (a.pb ?? 99) - (b.pb ?? 99))[0];
    // Largest PeerGap
    const bestGap = [...selectedBanks].sort((a, b) => (b.peerGapScore ?? -99) - (a.peerGapScore ?? -99))[0];

    const lines: string[] = [];

    lines.push(
      `Among the ${selectedBanks.length} compared banks, ${bestQuality.normalizedSymbol} delivers the strongest overall fundamental quality score (${formatScore(bestQuality.qualityScore)}), led by ROE of ${formatPercent(bestRoe.roe)} and Cost-to-Income Ratio of ${formatPercent(bestCir.cir)}.`
    );

    if (highestVal.normalizedSymbol !== lowestVal.normalizedSymbol) {
      lines.push(
        `On market valuation, ${highestVal.normalizedSymbol} commands the highest valuation multiple (${formatMultiple(highestVal.pb)} P/B), while ${lowestVal.normalizedSymbol} trades at the lowest multiple (${formatMultiple(lowestVal.pb)} P/B).`
      );
    }

    if (bestGap.peerGapScore !== null) {
      lines.push(
        `${bestGap.normalizedSymbol} exhibits the most favorable quality–valuation profile with a PeerGap of ${formatPeerGap(bestGap.peerGapScore)}, reflecting normalized operating quality positioned ahead of its peer P/B percentile rank.`
      );
    }

    return lines.join(" ");
  }, [selectedBanks]);

  // Chart data for fundamental ratios
  const fundamentalChartData = useMemo(() => {
    return selectedBanks.map((b) => ({
      name: b.normalizedSymbol,
      ROE: b.roe !== null ? Number((b.roe * 100).toFixed(2)) : 0,
      ROA: b.roa !== null ? Number((b.roa * 100).toFixed(2)) : 0,
      CIR: b.cir !== null ? Number((b.cir * 100).toFixed(2)) : 0,
    }));
  }, [selectedBanks]);

  // Factor breakdown stacked chart data
  const decompositionChartData = useMemo(() => {
    return selectedBanks.map((b) => {
      const fb = b.factorBreakdown;
      return {
        name: b.normalizedSymbol,
        "ROE Contribution": fb?.roe.contribution ?? 0,
        "ROA Contribution": fb?.roa.contribution ?? 0,
        "CIR Contribution (Inverted)": fb?.cir.contribution ?? 0,
        TotalScore: b.qualityScore ?? 0,
      };
    });
  }, [selectedBanks]);

  return (
    <div className="space-y-6">
      {/* Peer Selector Bar */}
      <div className="bg-background-surface border border-border rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue" />
              <span>Select Banks to Compare</span>
              <span className="text-xs font-normal text-foreground-muted">
                (Pick between 2 and 4 banks)
              </span>
            </h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              Comparative scoring preserves the full 6-bank reference universe as the normative baseline.
            </p>
          </div>

          <div className="text-xs font-mono text-foreground-muted">
            Selected: <span className="text-foreground font-bold">{selectedSymbols.length} / 4</span>
          </div>
        </div>

        {/* Bank Selection Pills */}
        <div className="flex flex-wrap gap-2">
          {banks.map((bank) => {
            const isSelected = selectedSymbols.includes(bank.normalizedSymbol);
            const canToggle = isSelected ? selectedSymbols.length > 2 : selectedSymbols.length < 4;

            return (
              <button
                key={bank.normalizedSymbol}
                disabled={!canToggle}
                onClick={() => toggleSelect(bank.normalizedSymbol)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono flex items-center gap-2 transition-colors border ${
                  isSelected
                    ? "bg-blue/15 text-blue border-blue/40 font-bold"
                    : canToggle
                    ? "bg-background text-foreground-muted border-border hover:text-foreground hover:bg-background-hover"
                    : "opacity-40 cursor-not-allowed bg-background border-border text-foreground-subtle"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                    isSelected ? "bg-blue border-blue text-white" : "border-border"
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5" />}
                </div>
                <span>{bank.normalizedSymbol}</span>
                <span className="text-[10px] text-foreground-subtle">
                  ({formatMultiple(bank.pb)} P/B)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Summary Callout */}
      <div className="bg-background-elevated border border-border/80 rounded-lg p-4 text-xs">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-foreground mb-1 font-mono uppercase tracking-wider text-[11px]">
              Comparative Synthesis & Divergence Findings
            </div>
            <p className="text-foreground-muted leading-relaxed font-sans">
              {comparisonSummaryText}
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="bg-background-surface border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-background-elevated/50">
          <h4 className="text-xs font-mono font-semibold uppercase text-foreground">
            Side-by-Side Financial & Divergence Metrics
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-foreground-muted font-mono uppercase text-[11px]">
                <th className="py-2.5 px-4 w-44">Metric Indicator</th>
                {selectedBanks.map((b) => (
                  <th key={b.normalizedSymbol} className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => onSelectBank(b)}
                      className="text-blue hover:underline font-bold text-sm"
                    >
                      {b.normalizedSymbol}
                    </button>
                    <div className="text-[10px] text-foreground-subtle font-sans truncate max-w-[140px] ml-auto">
                      {b.companyName}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono">
              {/* Quality Score */}
              <tr className="bg-background/40">
                <td className="py-2.5 px-4 font-semibold text-foreground">Quality Score (0-100)</td>
                {selectedBanks.map((b) => (
                  <td key={b.normalizedSymbol} className="py-2.5 px-4 text-right font-bold text-foreground">
                    {formatScore(b.qualityScore)}
                  </td>
                ))}
              </tr>

              {/* Valuation Percentile */}
              <tr>
                <td className="py-2.5 px-4 text-foreground-muted">Valuation Percentile (P/B)</td>
                {selectedBanks.map((b) => (
                  <td key={b.normalizedSymbol} className="py-2.5 px-4 text-right text-foreground">
                    {formatScore(b.valuationPercentile)}%
                  </td>
                ))}
              </tr>

              {/* PeerGap Score */}
              <tr className="bg-background/40">
                <td className="py-2.5 px-4 font-bold text-foreground">PeerGap Score</td>
                {selectedBanks.map((b) => {
                  const gap = b.peerGapScore ?? 0;
                  return (
                    <td key={b.normalizedSymbol} className="py-2.5 px-4 text-right font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${
                          gap > 0
                            ? "bg-emerald-muted text-emerald"
                            : gap < 0
                            ? "bg-accent-negative/15 text-accent-negative"
                            : "bg-border text-foreground-muted"
                        }`}
                      >
                        {formatPeerGap(b.peerGapScore)}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* P/B Multiple */}
              <tr>
                <td className="py-2.5 px-4 text-foreground-muted">P/B Multiple</td>
                {selectedBanks.map((b) => (
                  <td key={b.normalizedSymbol} className="py-2.5 px-4 text-right text-foreground">
                    {formatMultiple(b.pb)}
                  </td>
                ))}
              </tr>

              {/* ROE */}
              <tr>
                <td className="py-2.5 px-4 text-foreground-muted">Return on Equity (ROE)</td>
                {selectedBanks.map((b) => (
                  <td key={b.normalizedSymbol} className="py-2.5 px-4 text-right text-foreground">
                    {formatPercent(b.roe)} ({formatScore(b.roePercentile)}%ile)
                  </td>
                ))}
              </tr>

              {/* ROA */}
              <tr>
                <td className="py-2.5 px-4 text-foreground-muted">Return on Assets (ROA)</td>
                {selectedBanks.map((b) => (
                  <td key={b.normalizedSymbol} className="py-2.5 px-4 text-right text-foreground">
                    {formatPercent(b.roa)} ({formatScore(b.roaPercentile)}%ile)
                  </td>
                ))}
              </tr>

              {/* CIR */}
              <tr>
                <td className="py-2.5 px-4 text-foreground-muted">
                  Cost-to-Income (CIR) <span className="text-[10px] text-emerald">(lower is better)</span>
                </td>
                {selectedBanks.map((b) => (
                  <td key={b.normalizedSymbol} className="py-2.5 px-4 text-right text-foreground">
                    {formatPercent(b.cir)} ({formatScore(b.cirPercentile)}%ile)
                  </td>
                ))}
              </tr>

              {/* Market Cap */}
              <tr>
                <td className="py-2.5 px-4 text-foreground-muted">Market Capitalization</td>
                {selectedBanks.map((b) => (
                  <td key={b.normalizedSymbol} className="py-2.5 px-4 text-right text-foreground-muted">
                    {formatCurrencyIDR(b.marketCap)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Fundamental Metrics Comparison */}
        <div className="bg-background-surface border border-border rounded-lg p-4 sm:p-5">
          <div className="mb-3">
            <h4 className="text-xs font-mono font-semibold uppercase text-foreground">
              Fundamental Profitability & Efficiency Ratios (%)
            </h4>
            <p className="text-[11px] text-foreground-muted">
              Direct comparison of ROE, ROA, and CIR. Note that a lower CIR indicates greater efficiency.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fundamentalChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#627584" tick={{ fill: "#93A4AF", fontSize: 11 }} />
                <YAxis stroke="#627584" tick={{ fill: "#93A4AF", fontSize: 11 }} unit="%" />
                <Tooltip
                  formatter={(val: number) => [`${val}%`]}
                  contentStyle={{ backgroundColor: "#16232D", borderColor: "#263541", fontSize: "11px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="ROE" fill="#3B82F6" name="ROE (%)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="ROA" fill="#22C55E" name="ROA (%)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="CIR" fill="#F59E0B" name="Cost-to-Income (%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Score Factor Decomposition */}
        <div className="bg-background-surface border border-border rounded-lg p-4 sm:p-5">
          <div className="mb-3">
            <h4 className="text-xs font-mono font-semibold uppercase text-foreground">
              Quality Score Decomposition (Weighted Factor Contribution)
            </h4>
            <p className="text-[11px] text-foreground-muted">
              Points contributed to Quality Score by ROE (50%), ROA (20%), and Inverse CIR (30%).
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={decompositionChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#627584" tick={{ fill: "#93A4AF", fontSize: 11 }} />
                <YAxis stroke="#627584" tick={{ fill: "#93A4AF", fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  formatter={(val: number) => [`${val.toFixed(1)} pts`]}
                  contentStyle={{ backgroundColor: "#16232D", borderColor: "#263541", fontSize: "11px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="ROE Contribution" stackId="a" fill="#3B82F6" name="ROE (50% wt)" />
                <Bar dataKey="ROA Contribution" stackId="a" fill="#22C55E" name="ROA (20% wt)" />
                <Bar dataKey="CIR Contribution (Inverted)" stackId="a" fill="#F59E0B" name="CIR (30% wt)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Universe Consistency Notice */}
      <div className="p-3 bg-background rounded-lg border border-border/80 flex items-center gap-2 text-xs text-foreground-muted">
        <ShieldAlert className="w-4 h-4 text-blue shrink-0" />
        <span>
          <strong>Methodological note:</strong> Scores displayed in this comparison view remain normalized against the full 6-bank reference universe. They are not recalculated over only the highlighted selection, preventing artificial rank distortion.
        </span>
      </div>
    </div>
  );
}
