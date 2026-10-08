"use client";

import React from "react";
import {
  Layers,
  Search,
  Scale,
  BookOpen,
  RefreshCw,
  Sliders,
  CheckCircle,
  AlertCircle,
  Database,
  Calendar,
} from "lucide-react";
import { PeerUniverseSummary, ScoringWeights } from "@/types";
import { formatDate } from "@/lib/formatters";

interface HeaderProps {
  activeTab: "overview" | "screener" | "compare" | "methodology";
  setActiveTab: (tab: "overview" | "screener" | "compare" | "methodology") => void;
  summary: PeerUniverseSummary | null;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenWeights: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  summary,
  isLoading,
  onRefresh,
  onOpenWeights,
  isDemoMode,
  onToggleDemoMode,
}: HeaderProps) {
  const metadata = summary?.metadata;
  const weights = summary?.weights;

  return (
    <header className="border-b border-border bg-background-surface sticky top-0 z-40">
      {/* Top Banner: Provenance & Status */}
      <div className="bg-background-elevated border-b border-border/60 px-4 sm:px-6 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-foreground-muted">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue" />
            <span>Data Provider:</span>
            <span className="text-foreground font-medium">
              {metadata?.dataSourceMode === "DEMO_FIXTURE" ? "Offline benchmark fixture" : "Sectors Financial API v2"}
            </span>
          </span>

          <span className="hidden sm:inline text-border">•</span>

          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald" />
            <span>Reporting As-Of:</span>
            <span className="text-foreground font-mono">
              {formatDate(metadata?.financialReportDate) || "Audited FY2024"}
            </span>
          </span>

          <span className="hidden md:inline text-border">•</span>

          <span className="hidden md:flex items-center gap-1.5">
            <span>Market Price Data Through:</span>
            <span className="text-foreground font-mono">
              {formatDate(metadata?.marketPriceDate) || "Latest Available"}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Demo Mode Toggle Badge */}
          <button
            onClick={onToggleDemoMode}
            disabled={metadata?.isApiKeyConfigured !== true}
            className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 transition-colors border ${
              isDemoMode
                ? "bg-accent-warning/15 text-accent-warning border-accent-warning/40 hover:bg-accent-warning/25"
                : "bg-emerald-muted text-emerald border-emerald/40 hover:bg-emerald/20"
            }`}
            title={metadata?.isApiKeyConfigured === true
              ? "Switch between live Sectors API and benchmark fixture mode"
              : "Live mode is unavailable because SECTORS_API_KEY is not configured"}
          >
            {isDemoMode ? (
              <>
                <AlertCircle className="w-3 h-3" />
                <span>{metadata?.isApiKeyConfigured === false ? "FIXTURE MODE · NO API KEY" : "BENCHMARK FIXTURE MODE"}</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3" />
                <span>LIVE SECTORS API</span>
              </>
            )}
          </button>

          {/* Active Weights Pill */}
          {weights && (
            <button
              onClick={onOpenWeights}
              className="px-2 py-0.5 rounded bg-background hover:bg-background-hover text-foreground-muted border border-border text-[11px] font-mono flex items-center gap-1.5 transition-colors"
              title="Click to adjust scoring weights"
            >
              <Sliders className="w-3 h-3 text-blue" />
              <span>Weights: {weights.roe}/{weights.roa}/{weights.cir}</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1 rounded hover:bg-background-hover text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh latest data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue/15 border border-blue/40 flex items-center justify-center text-blue font-bold tracking-tight text-base font-mono">
            PG
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-foreground font-mono">
                PeerGap IDX
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-border text-foreground-muted tracking-wider">
                Banking
              </span>
            </div>
            <p className="text-xs text-foreground-muted">
              Quality–Valuation Divergence Intelligence for Indonesian Listed Banks
            </p>
          </div>
        </div>

        {/* Tab Links */}
        <nav className="w-full sm:w-auto max-w-full flex flex-wrap items-center gap-1 bg-background p-1 rounded-md border border-border">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "overview"
                ? "bg-background-elevated text-foreground shadow-sm border border-border"
                : "text-foreground-muted hover:text-foreground hover:bg-background-hover"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("screener")}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "screener"
                ? "bg-background-elevated text-foreground shadow-sm border border-border"
                : "text-foreground-muted hover:text-foreground hover:bg-background-hover"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Screener</span>
          </button>

          <button
            onClick={() => setActiveTab("compare")}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "compare"
                ? "bg-background-elevated text-foreground shadow-sm border border-border"
                : "text-foreground-muted hover:text-foreground hover:bg-background-hover"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Peer Compare</span>
          </button>

          <button
            onClick={() => setActiveTab("methodology")}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "methodology"
                ? "bg-background-elevated text-foreground shadow-sm border border-border"
                : "text-foreground-muted hover:text-foreground hover:bg-background-hover"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Methodology</span>
          </button>
        </nav>
      </div>

      {/* Universe Sub-header */}
      <div className="bg-background/80 px-4 sm:px-6 py-1.5 border-t border-border/40 text-[11px] text-foreground-muted flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-foreground-subtle">Target Universe:</span>
          <span className="font-mono text-foreground font-medium">
            BBCA • BBRI • BMRI • BBNI • BNGA • MEGA
          </span>
          <span className="text-foreground-subtle text-[10px]">
            (6 Top Indonesian Commercial Banks)
          </span>
        </div>

        <div className="flex items-center gap-2 text-foreground-subtle">
          <span>Framework:</span>
          <span className="text-blue font-mono font-medium">Quality–Valuation Divergence (P/B)</span>
        </div>
      </div>
    </header>
  );
}
