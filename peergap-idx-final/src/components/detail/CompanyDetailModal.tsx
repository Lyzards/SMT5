"use client";

import React from "react";
import { PeerAnalysis, PeerUniverseSummary } from "@/types";
import {
  formatCurrencyIDR,
  formatStockPrice,
  formatPercent,
  formatMultiple,
  formatScore,
  formatPeerGap,
  formatDate,
} from "@/lib/formatters";
import {
  X,
  ExternalLink,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Layers,
  BarChart2,
  Calendar,
  Building,
  CheckCircle2,
} from "lucide-react";

interface CompanyDetailModalProps {
  bank: PeerAnalysis | null;
  summary: PeerUniverseSummary | null;
  onClose: () => void;
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
}

export function CompanyDetailModal({
  bank,
  summary,
  onClose,
  watchlist,
  onToggleWatchlist,
}: CompanyDetailModalProps) {
  if (!bank) return null;

  const isStarred = watchlist.includes(bank.normalizedSymbol);
  const gap = bank.peerGapScore ?? 0;
  const isPos = gap > 0;
  const isNeg = gap < 0;

  const medians = summary?.medians;
  const fb = bank.factorBreakdown;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-background-surface border border-border rounded-xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-border bg-background-elevated flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                {bank.normalizedSymbol}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue/15 text-blue font-mono font-medium">
                IDX: {bank.symbol}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-background border border-border text-foreground-muted">
                Financials / Commercial Banks
              </span>
            </div>
            <h2 className="text-sm sm:text-base text-foreground font-semibold mt-1">
              {bank.companyName}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-foreground-muted mt-2 font-mono">
              <span>Price: <strong className="text-foreground">{formatStockPrice(bank.lastClosePrice)}</strong></span>
              <span>•</span>
              <span>Mkt Cap: <strong className="text-foreground">{formatCurrencyIDR(bank.marketCap)}</strong></span>
              <span>•</span>
              <span>As-Of: {formatDate(bank.priceDate)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWatchlist(bank.normalizedSymbol)}
              className={`p-2 rounded-lg border text-xs font-mono transition-colors ${
                isStarred
                  ? "bg-accent-warning/15 text-accent-warning border-accent-warning/40"
                  : "bg-background text-foreground-muted border-border hover:text-foreground"
              }`}
              title="Bookmark in local watchlist"
            >
              ★ {isStarred ? "Watching" : "Watch"}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-background hover:bg-background-hover text-foreground-muted hover:text-foreground border border-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs">
          {/* Analytical Scores Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Quality Score */}
            <div className="bg-background-elevated border border-border rounded-lg p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-foreground-muted uppercase tracking-wider">
                Fundamental Quality
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-foreground">
                  {formatScore(bank.qualityScore)}
                </span>
                <span className="text-xs text-foreground-subtle font-mono">/ 100</span>
              </div>
              <p className="text-[11px] text-foreground-muted mt-1">
                Weighted percentiles of ROE, ROA, and Inverse CIR.
              </p>
            </div>

            {/* 2. Valuation Percentile */}
            <div className="bg-background-elevated border border-border rounded-lg p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-foreground-muted uppercase tracking-wider">
                Valuation Percentile
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-foreground">
                  {formatScore(bank.valuationPercentile)}%
                </span>
                <span className="text-xs text-foreground-subtle font-mono">
                  {formatMultiple(bank.pb)} P/B
                </span>
              </div>
              <p className="text-[11px] text-foreground-muted mt-1">
                Relative multiple rank across the 6-bank peer group.
              </p>
            </div>

            {/* 3. PeerGap Score */}
            <div className="bg-background-elevated border border-border rounded-lg p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-foreground-muted uppercase tracking-wider">
                PeerGap Divergence
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span
                  className={`text-2xl font-bold font-mono ${
                    isPos
                      ? "text-emerald"
                      : isNeg
                      ? "text-accent-negative"
                      : "text-blue"
                  }`}
                >
                  {formatPeerGap(bank.peerGapScore)}
                </span>
                <span className="text-xs text-foreground font-mono font-bold">
                  Rank #{bank.rank ?? "N/A"}
                </span>
              </div>
              <p className="text-[11px] text-foreground-muted mt-1">
                Quality Score minus Valuation Percentile.
              </p>
            </div>
          </div>

          {/* Rule-Based Deterministic Explanation */}
          <div className="bg-background-elevated/70 border border-border/80 rounded-lg p-4">
            <h4 className="font-mono text-[11px] uppercase tracking-wider font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue" />
              <span>Divergence Analysis & Factor Narrative</span>
            </h4>
            <p className="text-foreground-muted leading-relaxed font-sans text-xs">
              {bank.explanation}
            </p>
          </div>

          {/* Fundamental Ratios & Peer Median Comparison */}
          <div className="bg-background-surface border border-border rounded-lg p-4">
            <h4 className="font-mono text-xs uppercase font-semibold text-foreground mb-3">
              Fundamental Indicators vs. Peer Universe Median
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
              {/* ROE */}
              <div className="p-3 bg-background rounded-md border border-border/60">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-foreground-muted">Return on Equity (ROE)</span>
                  <span className="font-bold text-foreground text-sm">{formatPercent(bank.roe)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-foreground-subtle">
                  <span>Peer Median: {formatPercent(medians?.roe)}</span>
                  <span>Rank: {formatScore(bank.roePercentile)}%ile</span>
                </div>
                {/* Visual Bar vs Median */}
                <div className="mt-2 w-full bg-border h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue h-full"
                    style={{ width: `${Math.min(100, (bank.roePercentile ?? 50))}%` }}
                  />
                </div>
              </div>

              {/* ROA */}
              <div className="p-3 bg-background rounded-md border border-border/60">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-foreground-muted">Return on Assets (ROA)</span>
                  <span className="font-bold text-foreground text-sm">{formatPercent(bank.roa)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-foreground-subtle">
                  <span>Peer Median: {formatPercent(medians?.roa)}</span>
                  <span>Rank: {formatScore(bank.roaPercentile)}%ile</span>
                </div>
                <div className="mt-2 w-full bg-border h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald h-full"
                    style={{ width: `${Math.min(100, (bank.roaPercentile ?? 50))}%` }}
                  />
                </div>
              </div>

              {/* CIR */}
              <div className="p-3 bg-background rounded-md border border-border/60">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-foreground-muted">Cost-to-Income (CIR)</span>
                  <span className="font-bold text-foreground text-sm">{formatPercent(bank.cir)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-foreground-subtle">
                  <span>Peer Median: {formatPercent(medians?.cir)}</span>
                  <span className="text-emerald">Inv Rank: {formatScore(bank.cirPercentile)}%ile</span>
                </div>
                <div className="mt-2 w-full bg-border h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-accent-warning h-full"
                    style={{ width: `${Math.min(100, (bank.cirPercentile ?? 50))}%` }}
                  />
                </div>
              </div>

              {/* P/B */}
              <div className="p-3 bg-background rounded-md border border-border/60">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-foreground-muted">Price-to-Book (P/B)</span>
                  <span className="font-bold text-foreground text-sm">{formatMultiple(bank.pb)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-foreground-subtle">
                  <span>Peer Median: {formatMultiple(medians?.pb)}</span>
                  <span>Valuation Rank: {formatScore(bank.valuationPercentile)}%ile</span>
                </div>
                <div className="mt-2 w-full bg-border h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-foreground-muted h-full"
                    style={{ width: `${Math.min(100, (bank.valuationPercentile ?? 50))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Factor Decomposition */}
          {fb && (
            <div className="bg-background-surface border border-border rounded-lg p-4">
              <h4 className="font-mono text-xs uppercase font-semibold text-foreground mb-2">
                Quality Score Factor Decomposition
              </h4>
              <p className="text-foreground-muted text-[11px] mb-3">
                Total Quality Score = Sum of weighted factor contributions ({formatScore(fb.totalQualityScore)} points).
              </p>

              <div className="space-y-2.5 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-foreground mb-1">
                    <span>ROE Factor (Weight: {(fb.roe.weight * 100).toFixed(0)}%, Rank: {fb.roe.percentile.toFixed(1)}%ile)</span>
                    <span className="font-bold text-blue">+{fb.roe.contribution.toFixed(1)} pts</span>
                  </div>
                  <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                    <div className="bg-blue h-full" style={{ width: `${(fb.roe.contribution / 50) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-foreground mb-1">
                    <span>ROA Factor (Weight: {(fb.roa.weight * 100).toFixed(0)}%, Rank: {fb.roa.percentile.toFixed(1)}%ile)</span>
                    <span className="font-bold text-emerald">+{fb.roa.contribution.toFixed(1)} pts</span>
                  </div>
                  <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald h-full" style={{ width: `${(fb.roa.contribution / 20) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-foreground mb-1">
                    <span>CIR Inverted Factor (Weight: {(fb.cir.weight * 100).toFixed(0)}%, Rank: {fb.cir.percentile.toFixed(1)}%ile)</span>
                    <span className="font-bold text-accent-warning">+{fb.cir.contribution.toFixed(1)} pts</span>
                  </div>
                  <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                    <div className="bg-accent-warning h-full" style={{ width: `${(fb.cir.contribution / 30) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Risk and Limitation Disclosure */}
          <div className="p-3.5 bg-background rounded-lg border border-border/70 flex items-start gap-2.5 text-foreground-muted text-[11px]">
            <ShieldAlert className="w-4 h-4 text-accent-warning shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground">Analytical Risk & Methodology Caveat:</strong> The PeerGap framework captures peer-relative profitability (ROE, ROA), cost efficiency (CIR), and relative P/B multiples. It does not incorporate asset quality (Non-Performing Loan ratios), credit cost provisions, regulatory Capital Adequacy (CAR), funding structure (CASA mix), or macroeconomic risk. A positive PeerGap indicates a relative divergence, not a guarantee of future equity returns or intrinsic undervaluation.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-border bg-background-elevated flex items-center justify-between text-xs text-foreground-muted">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-blue" />
            <span>Reporting Period: {bank.reportingPeriod}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-background hover:bg-background-hover border border-border text-foreground font-medium transition-colors"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
