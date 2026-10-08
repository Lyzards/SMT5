"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { KeyMetrics } from "@/components/dashboard/KeyMetrics";
import { QualityValuationScatter } from "@/components/dashboard/QualityValuationScatter";
import { LeaderboardTable } from "@/components/dashboard/LeaderboardTable";
import { ScreenerView } from "@/components/screener/ScreenerView";
import { PeerCompareView } from "@/components/compare/PeerCompareView";
import { MethodologyView } from "@/components/methodology/MethodologyView";
import { CompanyDetailModal } from "@/components/detail/CompanyDetailModal";
import { WeightSettingsModal } from "@/components/settings/WeightSettingsModal";
import { PeerAnalysis, PeerUniverseSummary, ScoringWeights } from "@/types";
import { DEFAULT_SCORING_WEIGHTS, validateWeights } from "@/lib/analytics/quality-score";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"overview" | "screener" | "compare" | "methodology">("overview");
  const [summary, setSummary] = useState<PeerUniverseSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [preferencesLoaded, setPreferencesLoaded] = useState<boolean>(false);

  // Live mode is the default; the API falls back to the fixture when no key is configured.
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Scoring weights state
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_SCORING_WEIGHTS);

  // Modals state
  const [selectedBank, setSelectedBank] = useState<PeerAnalysis | null>(null);
  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState<boolean>(false);

  // Local Watchlist
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Load stored preferences from localStorage on client mount
  useEffect(() => {
    try {
      const storedWeights = localStorage.getItem("peergap_weights");
      if (storedWeights) {
        const parsed: unknown = JSON.parse(storedWeights);
        if (
          parsed &&
          typeof parsed === "object" &&
          validateWeights(parsed as ScoringWeights).isValid
        ) {
          setWeights(parsed as ScoringWeights);
        }
      }

      const storedWatchlist = localStorage.getItem("peergap_watchlist");
      if (storedWatchlist) {
        const parsed: unknown = JSON.parse(storedWatchlist);
        if (Array.isArray(parsed)) {
          setWatchlist(parsed.filter((symbol): symbol is string => typeof symbol === "string"));
        }
      }

      const storedDemo = localStorage.getItem("peergap_demo_mode");
      if (storedDemo !== null) {
        setIsDemoMode(storedDemo === "true");
      }
    } catch {
      // Fallback cleanly to defaults
    } finally {
      setPreferencesLoaded(true);
    }
  }, []);

  // Fetch universe data
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      setIsLoading(true);
      setError(null);
      setWarning(null);
      try {
        const queryParams = new URLSearchParams({
          preferDemo: isDemoMode ? "true" : "false",
          forceRefresh: forceRefresh ? "true" : "false",
          roe: String(weights.roe),
          roa: String(weights.roa),
          cir: String(weights.cir),
        });

        const res = await fetch(`/api/banking?${queryParams.toString()}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `HTTP ${res.status}: Failed to load banking universe data`);
        }
        if (data.success && data.summary) {
          setSummary(data.summary);
          setWarning(data.status === "PARTIAL" ? data.errorMessage ?? "Some live symbols were unavailable." : null);
          // If response indicates live API key status
          if (!data.summary.metadata.isApiKeyConfigured && !isDemoMode) {
            setIsDemoMode(true);
          }
        } else {
          throw new Error(data.error || "Failed to process banking summary");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Network error";
        setError(msg);
        setWarning(null);
      } finally {
        setIsLoading(false);
      }
    },
    [isDemoMode, weights]
  );

  useEffect(() => {
    if (preferencesLoaded) fetchData();
  }, [fetchData, preferencesLoaded]);

  // Handle weight change
  const handleApplyWeights = (newWeights: ScoringWeights) => {
    setWeights(newWeights);
    localStorage.setItem("peergap_weights", JSON.stringify(newWeights));
  };

  // Toggle demo mode
  const handleToggleDemoMode = () => {
    const nextMode = !isDemoMode;
    setSummary(null);
    setError(null);
    setWarning(null);
    setIsDemoMode(nextMode);
    localStorage.setItem("peergap_demo_mode", String(nextMode));
  };

  // Toggle watchlist
  const handleToggleWatchlist = (symbol: string) => {
    setWatchlist((prev) => {
      const next = prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol];
      localStorage.setItem("peergap_watchlist", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        summary={summary}
        isLoading={isLoading}
        onRefresh={() => fetchData(true)}
        onOpenWeights={() => setIsWeightsModalOpen(true)}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-lg bg-accent-negative/10 border border-accent-negative/30 text-accent-negative text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchData(true)}
              className="underline font-mono text-[11px] hover:text-foreground"
            >
              Retry
            </button>
          </div>
        )}

        {warning && (
          <div role="status" className="p-4 rounded-lg bg-accent-warning/10 border border-accent-warning/30 text-accent-warning text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{warning}</span>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading && !summary && (
          <div className="h-96 flex flex-col items-center justify-center text-foreground-muted gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue" />
            <span className="font-mono text-xs">Loading Sectors Financial Intelligence...</span>
          </div>
        )}

        {/* Active Tab View */}
        {summary && (
          <>
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* 1. Summary Cards */}
                <KeyMetrics summary={summary} onSelectBank={setSelectedBank} />

                {/* 2. Main Visualization: Quality vs Valuation Scatter */}
                <QualityValuationScatter
                  summary={summary}
                  onSelectBank={setSelectedBank}
                  selectedSymbol={selectedBank?.normalizedSymbol}
                />

                {/* 3. Leaderboard Table */}
                <LeaderboardTable
                  summary={summary}
                  onSelectBank={setSelectedBank}
                  onOpenMethodology={() => setActiveTab("methodology")}
                />
              </div>
            )}

            {activeTab === "screener" && (
              <div className="animate-in fade-in duration-150">
                <ScreenerView
                  summary={summary}
                  onSelectBank={setSelectedBank}
                  watchlist={watchlist}
                  onToggleWatchlist={handleToggleWatchlist}
                />
              </div>
            )}

            {activeTab === "compare" && (
              <div className="animate-in fade-in duration-150">
                <PeerCompareView
                  summary={summary}
                  onSelectBank={setSelectedBank}
                />
              </div>
            )}

            {activeTab === "methodology" && (
              <div className="animate-in fade-in duration-150">
                <MethodologyView />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background-surface py-5 px-4 sm:px-6 text-xs text-foreground-muted">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
          <div>
            <span className="text-foreground font-bold">PeerGap IDX</span> — Indonesia Stock Exchange (IDX) Banking Intelligence Platform
          </div>
          <div className="text-foreground-subtle">
            Sectors Hackathon — Track 03: Market Intelligence • Data: {summary?.metadata.source ?? "Awaiting source"}
          </div>
          <div className="text-foreground-subtle min-w-0 break-words">
            Dibuat oleh tim: 1. ORANG MATIL GA PERNAH NUGAS KERJAANNYA NONGS 24/7
          </div>
        </div>
      </footer>

      {/* Slide-over / Modal: Company Detail Analysis */}
      {selectedBank && (
        <CompanyDetailModal
          bank={selectedBank}
          summary={summary}
          onClose={() => setSelectedBank(null)}
          watchlist={watchlist}
          onToggleWatchlist={handleToggleWatchlist}
        />
      )}

      {/* Modal: Adjustable Weights Settings */}
      <WeightSettingsModal
        isOpen={isWeightsModalOpen}
        onClose={() => setIsWeightsModalOpen(false)}
        currentWeights={weights}
        onApplyWeights={handleApplyWeights}
      />
    </div>
  );
}
