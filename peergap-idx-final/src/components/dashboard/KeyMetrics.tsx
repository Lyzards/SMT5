"use client";

import React from "react";
import { PeerUniverseSummary, PeerAnalysis } from "@/types";
import { formatScore, formatPeerGap, formatPercent, formatMultiple } from "@/lib/formatters";
import { Building2, Award, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

interface KeyMetricsProps {
  summary: PeerUniverseSummary | null;
  onSelectBank: (bank: PeerAnalysis) => void;
}

export function KeyMetrics({ summary, onSelectBank }: KeyMetricsProps) {
  if (!summary) return null;

  const {
    totalBanks,
    eligibleBanksCount,
    highestQualityBank,
    largestPositiveGapBank,
    largestNegativeGapBank,
  } = summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Universe Coverage */}
      <div className="bg-background-surface border border-border rounded-lg p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-foreground-muted mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Comparable Universe</span>
          <Building2 className="w-4 h-4 text-blue" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {eligibleBanksCount}
            </span>
            <span className="text-xs text-foreground-muted font-mono">
              / {totalBanks} Banks Eligible
            </span>
          </div>
          <p className="text-[11px] text-foreground-muted mt-1">
            Commercial banking peer group with complete audited financial data.
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-border/50 text-[11px] font-mono text-foreground-subtle">
          Sample: Large-Cap IDX Financials
        </div>
      </div>

      {/* 2. Highest Quality Score */}
      <div className="bg-background-surface border border-border rounded-lg p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-foreground-muted mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Highest Quality Score</span>
          <Award className="w-4 h-4 text-emerald" />
        </div>
        <div>
          {highestQualityBank ? (
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-foreground">
                  {formatScore(highestQualityBank.qualityScore)}
                </span>
                <button
                  onClick={() => onSelectBank(highestQualityBank)}
                  className="text-xs font-mono font-bold text-emerald hover:underline flex items-center gap-0.5"
                >
                  {highestQualityBank.normalizedSymbol}
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[11px] text-foreground-muted mt-1 truncate" title={highestQualityBank.companyName}>
                {highestQualityBank.companyName}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-foreground-muted">
                <span>ROE: {formatPercent(highestQualityBank.roe)}</span>
                <span>•</span>
                <span>CIR: {formatPercent(highestQualityBank.cir)}</span>
              </div>
            </div>
          ) : (
            <span className="text-sm text-foreground-muted">No data</span>
          )}
        </div>
        <div className="mt-3 pt-2 border-t border-border/50 text-[11px] font-mono text-foreground-subtle">
          Combined ROE / ROA / Inverse CIR
        </div>
      </div>

      {/* 3. Largest Positive PeerGap */}
      <div className="bg-background-surface border border-border rounded-lg p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-foreground-muted mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Largest Positive Gap</span>
          <TrendingUp className="w-4 h-4 text-accent-positive" />
        </div>
        <div>
          {largestPositiveGapBank && (largestPositiveGapBank.peerGapScore ?? 0) > 0 ? (
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-accent-positive">
                  {formatPeerGap(largestPositiveGapBank.peerGapScore)}
                </span>
                <button
                  onClick={() => onSelectBank(largestPositiveGapBank)}
                  className="text-xs font-mono font-bold text-accent-positive hover:underline flex items-center gap-0.5"
                >
                  {largestPositiveGapBank.normalizedSymbol}
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[11px] text-foreground-muted mt-1 truncate" title={largestPositiveGapBank.companyName}>
                {largestPositiveGapBank.companyName}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-foreground-muted">
                <span>P/B: {formatMultiple(largestPositiveGapBank.pb)}</span>
                <span>•</span>
                <span>Quality Rank #{largestPositiveGapBank.rank}</span>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-sm font-mono text-foreground-muted">None Divergent</span>
              <p className="text-[11px] text-foreground-muted mt-1">
                All banks priced in alignment with quality.
              </p>
            </div>
          )}
        </div>
        <div className="mt-3 pt-2 border-t border-border/50 text-[11px] font-mono text-foreground-subtle">
          Fundamental Quality Exceeds P/B Rank
        </div>
      </div>

      {/* 4. Largest Negative PeerGap */}
      <div className="bg-background-surface border border-border rounded-lg p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-foreground-muted mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Largest Negative Gap</span>
          <TrendingDown className="w-4 h-4 text-accent-negative" />
        </div>
        <div>
          {largestNegativeGapBank && (largestNegativeGapBank.peerGapScore ?? 0) < 0 ? (
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-accent-negative">
                  {formatPeerGap(largestNegativeGapBank.peerGapScore)}
                </span>
                <button
                  onClick={() => onSelectBank(largestNegativeGapBank)}
                  className="text-xs font-mono font-bold text-accent-negative hover:underline flex items-center gap-0.5"
                >
                  {largestNegativeGapBank.normalizedSymbol}
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[11px] text-foreground-muted mt-1 truncate" title={largestNegativeGapBank.companyName}>
                {largestNegativeGapBank.companyName}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-foreground-muted">
                <span>P/B: {formatMultiple(largestNegativeGapBank.pb)}</span>
                <span>•</span>
                <span>Val. Pct: {formatScore(largestNegativeGapBank.valuationPercentile)}%</span>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-sm font-mono text-foreground-muted">None Divergent</span>
              <p className="text-[11px] text-foreground-muted mt-1">
                No bank with valuation rank exceeding quality.
              </p>
            </div>
          )}
        </div>
        <div className="mt-3 pt-2 border-t border-border/50 text-[11px] font-mono text-foreground-subtle">
          Valuation Multiples Positioned Ahead
        </div>
      </div>
    </div>
  );
}
