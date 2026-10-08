"use client";

import React, { useState, useMemo } from "react";
import { PeerAnalysis, PeerUniverseSummary } from "@/types";
import {
  formatPercent,
  formatMultiple,
  formatScore,
  formatPeerGap,
} from "@/lib/formatters";
import { generatePeerGapCSV, downloadCSV } from "@/lib/export/csv";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

interface ScreenerViewProps {
  summary: PeerUniverseSummary | null;
  onSelectBank: (bank: PeerAnalysis) => void;
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
}

type SortField =
  | "normalizedSymbol"
  | "companyName"
  | "roe"
  | "roa"
  | "cir"
  | "pb"
  | "qualityScore"
  | "peerGapScore"
  | "dataStatus";

type SortDirection = "asc" | "desc";

export function ScreenerView({
  summary,
  onSelectBank,
  watchlist,
  onToggleWatchlist,
}: ScreenerViewProps) {
  const [search, setSearch] = useState("");
  const [minQuality, setMinQuality] = useState<number>(0);
  const [gapFilter, setGapFilter] = useState<"ALL" | "POSITIVE" | "NEGATIVE" | "ALIGNED">("ALL");
  const [onlyWatchlist, setOnlyWatchlist] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortField>("peerGapScore");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const banks = summary?.banks ?? [];

  // Sorting helper
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      // Sensible defaults
      if (field === "cir") {
        setSortDir("asc"); // lower CIR is better
      } else {
        setSortDir("desc");
      }
    }
  };

  const resetFilters = () => {
    setSearch("");
    setMinQuality(0);
    setGapFilter("ALL");
    setOnlyWatchlist(false);
    setSortField("peerGapScore");
    setSortDir("desc");
  };

  // Filter & Sort logic
  const filteredAndSortedBanks = useMemo(() => {
    return banks
      .filter((bank) => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchSym = bank.normalizedSymbol.toLowerCase().includes(q);
          const matchName = bank.companyName.toLowerCase().includes(q);
          if (!matchSym && !matchName) return false;
        }

        // Watchlist filter
        if (onlyWatchlist && !watchlist.includes(bank.normalizedSymbol)) {
          return false;
        }

        // Min Quality Score filter
        if (minQuality > 0) {
          if (bank.qualityScore === null || bank.qualityScore < minQuality) {
            return false;
          }
        }

        // PeerGap filter
        if (gapFilter === "POSITIVE") {
          if (bank.peerGapScore === null || bank.peerGapScore < 5) return false;
        } else if (gapFilter === "NEGATIVE") {
          if (bank.peerGapScore === null || bank.peerGapScore > -5) return false;
        } else if (gapFilter === "ALIGNED") {
          if (
            bank.peerGapScore === null ||
            bank.peerGapScore <= -5 ||
            bank.peerGapScore >= 5
          )
            return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Put nulls at the end regardless of direction
        if (valA === null && valB === null) return 0;
        if (valA === null) return 1;
        if (valB === null) return -1;

        if (typeof valA === "string" && typeof valB === "string") {
          return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        const numA = Number(valA);
        const numB = Number(valB);
        return sortDir === "asc" ? numA - numB : numB - numA;
      });
  }, [banks, search, minQuality, gapFilter, onlyWatchlist, sortField, sortDir, watchlist]);

  // CSV export handler
  const handleExportCSV = () => {
    if (!summary) return;
    const csv = generatePeerGapCSV({
      banks: filteredAndSortedBanks,
      weights: summary.weights,
      source: summary.metadata.source,
      reportDate: summary.metadata.financialReportDate,
      priceDate: summary.metadata.marketPriceDate,
      mode: summary.metadata.dataSourceMode,
    });
    downloadCSV(csv, `peergap-idx-screener-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-border opacity-50 inline-block ml-1" />;
    }
    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 text-blue inline-block ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue inline-block ml-1" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="bg-background-surface border border-border rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search bank ticker or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-blue font-mono"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Min Quality */}
            <div className="flex items-center gap-1.5 text-xs bg-background border border-border px-2.5 py-1 rounded-md">
              <span className="text-foreground-muted font-mono">Min Quality:</span>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={minQuality}
                onChange={(e) => setMinQuality(Number(e.target.value))}
                className="w-20 accent-blue cursor-pointer"
              />
              <span className="font-mono text-foreground font-semibold min-w-[24px]">
                {minQuality > 0 ? `${minQuality}` : "Off"}
              </span>
            </div>

            {/* Gap Categorization Filter */}
            <div className="flex items-center bg-background border border-border rounded-md p-0.5 text-xs font-mono">
              <button
                onClick={() => setGapFilter("ALL")}
                className={`px-2 py-1 rounded text-[11px] ${
                  gapFilter === "ALL" ? "bg-background-elevated text-foreground font-bold" : "text-foreground-muted hover:text-foreground"
                }`}
              >
                All Gaps
              </button>
              <button
                onClick={() => setGapFilter("POSITIVE")}
                className={`px-2 py-1 rounded text-[11px] ${
                  gapFilter === "POSITIVE" ? "bg-emerald-muted text-emerald font-bold" : "text-foreground-muted hover:text-foreground"
                }`}
              >
                Positive (+5)
              </button>
              <button
                onClick={() => setGapFilter("ALIGNED")}
                className={`px-2 py-1 rounded text-[11px] ${
                  gapFilter === "ALIGNED" ? "bg-blue/15 text-blue font-bold" : "text-foreground-muted hover:text-foreground"
                }`}
              >
                Aligned (-5, +5)
              </button>
              <button
                onClick={() => setGapFilter("NEGATIVE")}
                className={`px-2 py-1 rounded text-[11px] ${
                  gapFilter === "NEGATIVE" ? "bg-accent-negative/15 text-accent-negative font-bold" : "text-foreground-muted hover:text-foreground"
                }`}
              >
                Negative (-5)
              </button>
            </div>

            {/* Watchlist Filter */}
            <button
              onClick={() => setOnlyWatchlist(!onlyWatchlist)}
              className={`px-2.5 py-1.5 rounded-md border text-xs font-mono flex items-center gap-1.5 transition-colors ${
                onlyWatchlist
                  ? "bg-blue/15 text-blue border-blue/40"
                  : "bg-background text-foreground-muted border-border hover:text-foreground"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Watchlist ({watchlist.length})</span>
            </button>

            {/* Reset */}
            <button
              onClick={resetFilters}
              className="p-1.5 rounded-md bg-background border border-border text-foreground-muted hover:text-foreground hover:bg-background-hover transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* CSV Export */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-md bg-blue/15 hover:bg-blue/25 text-blue border border-blue/40 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-2.5 pt-2 border-t border-border/50 text-[11px] text-foreground-muted flex items-center justify-between">
          <span>
            Showing <strong className="text-foreground">{filteredAndSortedBanks.length}</strong> of{" "}
            <strong className="text-foreground">{banks.length}</strong> banks in universe
          </span>
          <span className="text-foreground-subtle">
            Tip: Click any column header to sort ascending or descending
          </span>
        </div>
      </div>

      {/* Main Screener Table */}
      <div className="bg-background-surface border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-background-elevated border-b border-border text-foreground-muted font-mono uppercase text-[11px]">
                <th className="py-2.5 px-3 w-10 text-center">★</th>
                <th
                  onClick={() => handleSort("normalizedSymbol")}
                  className="py-2.5 px-3 cursor-pointer hover:text-foreground"
                >
                  Ticker {renderSortIndicator("normalizedSymbol")}
                </th>
                <th
                  onClick={() => handleSort("companyName")}
                  className="py-2.5 px-3 cursor-pointer hover:text-foreground"
                >
                  Company Name {renderSortIndicator("companyName")}
                </th>
                <th
                  onClick={() => handleSort("roe")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground"
                >
                  ROE (%) {renderSortIndicator("roe")}
                </th>
                <th
                  onClick={() => handleSort("roa")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground"
                >
                  ROA (%) {renderSortIndicator("roa")}
                </th>
                <th
                  onClick={() => handleSort("cir")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground"
                  title="Cost-to-Income Ratio (Lower is better)"
                >
                  CIR (%) {renderSortIndicator("cir")}
                </th>
                <th
                  onClick={() => handleSort("pb")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground"
                >
                  P/B Multiple {renderSortIndicator("pb")}
                </th>
                <th
                  onClick={() => handleSort("qualityScore")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground"
                >
                  Quality Score {renderSortIndicator("qualityScore")}
                </th>
                <th
                  onClick={() => handleSort("peerGapScore")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground font-bold"
                >
                  PeerGap {renderSortIndicator("peerGapScore")}
                </th>
                <th className="py-2.5 px-3">Period</th>
                <th
                  onClick={() => handleSort("dataStatus")}
                  className="py-2.5 px-3 text-center cursor-pointer hover:text-foreground"
                >
                  Status {renderSortIndicator("dataStatus")}
                </th>
                <th className="py-2.5 px-3 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredAndSortedBanks.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-foreground-muted">
                    No banks match your current search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAndSortedBanks.map((bank) => {
                  const isStarred = watchlist.includes(bank.normalizedSymbol);
                  const gap = bank.peerGapScore ?? 0;
                  const isPos = gap > 0;
                  const isNeg = gap < 0;

                  return (
                    <tr
                      key={bank.normalizedSymbol}
                      className="hover:bg-background-hover/70 transition-colors group cursor-pointer"
                    >
                      {/* Watchlist Star */}
                      <td
                        className="py-3 px-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(bank.normalizedSymbol);
                        }}
                      >
                        <button
                          className={`p-1 rounded transition-colors ${
                            isStarred
                              ? "text-accent-warning"
                              : "text-border hover:text-foreground-muted"
                          }`}
                          title={isStarred ? "Remove from watchlist" : "Add to watchlist"}
                        >
                          {isStarred ? (
                            <BookmarkCheck className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>

                      {/* Ticker */}
                      <td
                        onClick={() => onSelectBank(bank)}
                        className="py-3 px-3 font-mono font-bold text-foreground"
                      >
                        <span className="text-blue group-hover:underline">
                          {bank.normalizedSymbol}
                        </span>
                      </td>

                      {/* Company Name */}
                      <td
                        onClick={() => onSelectBank(bank)}
                        className="py-3 px-3 text-foreground font-medium max-w-xs truncate"
                      >
                        {bank.companyName}
                      </td>

                      {/* ROE */}
                      <td
                        onClick={() => onSelectBank(bank)}
                        className="py-3 px-3 text-right font-mono text-foreground"
                      >
                        {formatPercent(bank.roe)}
                      </td>

                      {/* ROA */}
                      <td
                        onClick={() => onSelectBank(bank)}
                        className="py-3 px-3 text-right font-mono text-foreground"
                      >
                        {formatPercent(bank.roa)}
                      </td>

                      {/* CIR */}
                      <td
                        onClick={() => onSelectBank(bank)}
                        className="py-3 px-3 text-right font-mono text-foreground"
                      >
                        {formatPercent(bank.cir)}
                      </td>

                      {/* P/B */}
                      <td
                        onClick={() => onSelectBank(bank)}
                        className="py-3 px-3 text-right font-mono text-foreground-muted"
                      >
                        {formatMultiple(bank.pb)}
                      </td>

                      {/* Quality Score */}
                      <td
                        onClick={() => onSelectBank(bank)}
                        className="py-3 px-3 text-right font-mono font-bold text-foreground"
                      >
                        {formatScore(bank.qualityScore)}
                      </td>

                      {/* PeerGap Score */}
                      <td
                        onClick={() => onSelectBank(bank)}
                        className="py-3 px-3 text-right font-mono font-bold"
                      >
                        {bank.isEligible ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded ${
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
                            N/A
                          </span>
                        )}
                      </td>

                      {/* Period */}
                      <td
                        onClick={() => onSelectBank(bank)}
                        className="py-3 px-3 text-foreground-muted font-mono text-[11px]"
                      >
                        {bank.reportingPeriod}
                      </td>

                      {/* Data Status */}
                      <td
                        onClick={() => onSelectBank(bank)}
                        className="py-3 px-3 text-center"
                      >
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            bank.dataStatus === "VALID"
                              ? "bg-emerald/10 text-emerald"
                              : bank.dataStatus === "PARTIAL"
                              ? "bg-accent-warning/10 text-accent-warning"
                              : "bg-accent-negative/10 text-accent-negative"
                          }`}
                        >
                          {bank.dataStatus}
                        </span>
                      </td>

                      {/* Action */}
                      <td
                        onClick={() => onSelectBank(bank)}
                        className="py-3 px-3 text-center text-foreground-muted group-hover:text-blue"
                      >
                        <ChevronRight className="w-4 h-4 inline-block transition-transform group-hover:translate-x-0.5" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
