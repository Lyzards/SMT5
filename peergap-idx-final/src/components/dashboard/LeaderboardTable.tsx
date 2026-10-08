"use client";

import React from "react";
import { PeerAnalysis, PeerUniverseSummary } from "@/types";
import { formatScore, formatMultiple, formatPeerGap } from "@/lib/formatters";
import { ArrowRight, ChevronRight, HelpCircle } from "lucide-react";

interface LeaderboardTableProps {
  summary: PeerUniverseSummary | null;
  onSelectBank: (bank: PeerAnalysis) => void;
  onOpenMethodology: () => void;
}

export function LeaderboardTable({
  summary,
  onSelectBank,
  onOpenMethodology,
}: LeaderboardTableProps) {
  if (!summary) return null;

  return (
    <div className="bg-background-surface border border-border rounded-lg p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>PeerGap Leaderboard</span>
            <span className="text-xs font-normal text-foreground-muted">
              (Ranked by Quality–Valuation Divergence)
            </span>
          </h3>
          <p className="text-xs text-foreground-muted mt-0.5">
            Click any row to open the detailed factor decomposition and narrative analysis.
          </p>
        </div>

        <button
          onClick={onOpenMethodology}
          className="text-xs text-foreground-muted hover:text-foreground flex items-center gap-1 font-mono transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue" />
          <span>Scoring Formula</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border text-foreground-muted font-mono uppercase text-[11px]">
              <th className="py-2.5 px-3 w-12 text-center">Rank</th>
              <th className="py-2.5 px-3">Ticker</th>
              <th className="py-2.5 px-3">Bank Name</th>
              <th className="py-2.5 px-3 text-right">Quality Score</th>
              <th className="py-2.5 px-3 text-right">P/B Multiple</th>
              <th className="py-2.5 px-3 text-right">Valuation %ile</th>
              <th className="py-2.5 px-3 text-right font-semibold">PeerGap Score</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {summary.banks.map((bank) => {
              const gap = bank.peerGapScore ?? 0;
              const isEligible = bank.isEligible;
              const isPos = gap > 0;
              const isNeg = gap < 0;

              return (
                <tr
                  key={bank.normalizedSymbol}
                  onClick={() => onSelectBank(bank)}
                  className="hover:bg-background-hover/70 cursor-pointer transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-3 px-3 text-center font-mono font-bold text-foreground">
                    {isEligible ? (
                      <span className="w-6 h-6 inline-flex items-center justify-center rounded bg-background border border-border">
                        {bank.rank}
                      </span>
                    ) : (
                      <span className="text-foreground-subtle">—</span>
                    )}
                  </td>

                  {/* Ticker */}
                  <td className="py-3 px-3 font-mono font-bold text-foreground flex items-center gap-1.5">
                    <span className="text-blue group-hover:underline">
                      {bank.normalizedSymbol}
                    </span>
                    <span className="text-[10px] text-foreground-subtle">
                      .JK
                    </span>
                  </td>

                  {/* Company Name */}
                  <td className="py-3 px-3 text-foreground font-medium max-w-xs truncate">
                    {bank.companyName}
                  </td>

                  {/* Quality Score */}
                  <td className="py-3 px-3 text-right font-mono font-semibold text-foreground">
                    {formatScore(bank.qualityScore)}
                  </td>

                  {/* P/B */}
                  <td className="py-3 px-3 text-right font-mono text-foreground-muted">
                    {formatMultiple(bank.pb)}
                  </td>

                  {/* Valuation Percentile */}
                  <td className="py-3 px-3 text-right font-mono text-foreground-muted">
                    {formatScore(bank.valuationPercentile)}%
                  </td>

                  {/* PeerGap Score */}
                  <td className="py-3 px-3 text-right font-mono font-bold">
                    {isEligible ? (
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${
                          isPos
                            ? "bg-emerald-muted text-emerald"
                            : isNeg
                            ? "bg-accent-negative/15 text-accent-negative"
                            : "bg-border text-foreground-muted"
                        }`}
                      >
                        {formatPeerGap(bank.peerGapScore)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-accent-warning font-sans">
                        Ineligible
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-center text-foreground-muted group-hover:text-blue transition-colors">
                    <ChevronRight className="w-4 h-4 inline-block transition-transform group-hover:translate-x-0.5" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center justify-between text-[11px] text-foreground-muted">
        <div>
          <span className="font-mono text-emerald">+ Positive PeerGap:</span> Fundamental Quality Percentile exceeds P/B Rank.
        </div>
        <div>
          <span className="font-mono text-accent-negative">- Negative PeerGap:</span> Relative P/B Rank exceeds Fundamental Quality Score.
        </div>
      </div>
    </div>
  );
}
