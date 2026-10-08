"use client";

import React from "react";
import { BookOpen, ShieldAlert, Database, Calculator, HelpCircle, Layers } from "lucide-react";

export function MethodologyView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 text-xs leading-relaxed text-foreground-muted pb-12">
      {/* Title */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-blue font-mono text-xs uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>PeerGap Analytical Specification</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-mono text-foreground">
          The PeerGap Quality–Valuation Divergence Framework
        </h2>
        <p className="text-sm text-foreground-muted mt-1 font-sans">
          Mathematical formulation, ranking mechanics, weight hypotheses, and analytical limitations for Indonesian equity intelligence.
        </p>
      </div>

      {/* 1. Research Problem */}
      <section className="bg-background-surface border border-border rounded-lg p-5 space-y-3">
        <h3 className="text-sm font-semibold font-mono text-foreground flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-blue/15 text-blue inline-flex items-center justify-center text-xs">1</span>
          <span>The Research Problem</span>
        </h3>
        <p>
          Traditional stock screeners present disconnected raw financial metrics (such as a 20% ROE or a 2.5x P/B). However, financial ratios have little independent meaning in equity research without benchmark context: a 2.0x P/B multiple may represent an aggressive premium for a sluggish bank, or a marked discount for a premier franchise generating 22% ROE at 33% Cost-to-Income efficiency.
        </p>
        <p>
          <strong>PeerGap IDX</strong> resolves this by establishing an explicit, peer-relative framework that quantifies whether an Indonesian bank's normalized fundamental quality aligns with, lags, or exceeds its relative market valuation rank.
        </p>
      </section>

      {/* 2. Peer Universe Definition */}
      <section className="bg-background-surface border border-border rounded-lg p-5 space-y-3">
        <h3 className="text-sm font-semibold font-mono text-foreground flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-blue/15 text-blue inline-flex items-center justify-center text-xs">2</span>
          <span>Target Peer Universe (IDX Commercial Banks)</span>
        </h3>
        <p>
          The MVP benchmarks six premier Indonesian commercial banks listed on the Indonesia Stock Exchange (IDX):
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs text-foreground">
          <div className="p-2.5 bg-background rounded border border-border">1. BBCA — PT Bank Central Asia Tbk.</div>
          <div className="p-2.5 bg-background rounded border border-border">2. BBRI — PT Bank Rakyat Indonesia Tbk.</div>
          <div className="p-2.5 bg-background rounded border border-border">3. BMRI — PT Bank Mandiri Tbk.</div>
          <div className="p-2.5 bg-background rounded border border-border">4. BBNI — PT Bank Negara Indonesia Tbk.</div>
          <div className="p-2.5 bg-background rounded border border-border">5. BNGA — PT Bank CIMB Niaga Tbk.</div>
          <div className="p-2.5 bg-background rounded border border-border">6. MEGA — PT Bank Mega Tbk.</div>
        </div>
        <p className="text-[11px] text-foreground-subtle">
          *Note: This cohort represents large-cap and established commercial banking franchises on the IDX, but does not encompass all small or regional development banks. Minimum threshold of 4 valid observations is strictly enforced.
        </p>
          <p className="text-[11px] text-foreground-subtle">
            Live comparisons use the latest annual reporting year available to at least four banks. Financial ratios, underlying amounts, and annual P/B are matched to that year; failed live symbols are excluded rather than replaced with fixture data.
          </p>
      </section>

      {/* 3. Fundamental Indicators */}
      <section className="bg-background-surface border border-border rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold font-mono text-foreground flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-blue/15 text-blue inline-flex items-center justify-center text-xs">3</span>
          <span>Core Fundamental Variables</span>
        </h3>
        <div className="space-y-3 font-sans">
          <div className="p-3 bg-background rounded border border-border">
            <h4 className="font-mono font-bold text-foreground text-xs text-blue">Return on Equity (ROE) — Profitability</h4>
            <p className="text-[11px] mt-1">
              Measures net income generated per unit of shareholder equity. Higher values reflect superior equity profitability, subject to leverage and capital structure.
            </p>
          </div>

          <div className="p-3 bg-background rounded border border-border">
            <h4 className="font-mono font-bold text-foreground text-xs text-emerald">Return on Assets (ROA) — Asset Efficiency</h4>
            <p className="text-[11px] mt-1">
              Measures net earnings generated across the bank's entire asset base (loans, securities, interbank reserves). Higher values reflect superior asset utilization independent of financial leverage.
            </p>
          </div>

          <div className="p-3 bg-background rounded border border-border">
            <h4 className="font-mono font-bold text-foreground text-xs text-accent-warning">Cost-to-Income Ratio (CIR) — Operational Efficiency (Inverted)</h4>
            <p className="text-[11px] mt-1">
              Operating expenses divided by operating income. In banking, operational efficiency improves as operating overhead decreases relative to revenue. Thus, <strong>lower CIR receives a higher percentile rank</strong> in PeerGap.
            </p>
          </div>

          <div className="p-3 bg-background rounded border border-border">
            <h4 className="font-mono font-bold text-foreground text-xs text-foreground">Price-to-Book Multiple (P/B) — Equity Valuation</h4>
            <p className="text-[11px] mt-1">
              Market capitalization divided by total accounting equity. Reflects the premium or discount at which the stock trades relative to stated book value.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Normalization and Percentile Ranking Formulas */}
      <section className="bg-background-surface border border-border rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold font-mono text-foreground flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-blue/15 text-blue inline-flex items-center justify-center text-xs">4</span>
          <span>Percentile Ranking & Normalization Formulas</span>
        </h3>

        <div className="p-4 bg-background rounded border border-border font-mono text-xs space-y-3">
          <div className="text-foreground font-bold text-sm">A. Standard Higher-is-Better Metric (ROE, ROA, P/B):</div>
          <div className="p-3 bg-background-elevated rounded border border-border text-foreground font-semibold">
            Percentile = 100 × (Average Ascending Rank − 1) / (N − 1)
          </div>
          <p className="text-[11px] text-foreground-muted font-sans">
            Where <code>N</code> is the number of valid peer observations (N ≥ 4). Lowest value receives percentile 0.0; highest value receives percentile 100.0.
          </p>

          <div className="text-foreground font-bold text-sm pt-2">B. Cost-to-Income Ratio (Lower-is-Better Inversion):</div>
          <div className="p-3 bg-background-elevated rounded border border-border text-foreground font-semibold">
            Inverted Rank = N − Average Ascending Rank + 1
            <br />
            CIR Percentile = 100 × (Inverted Rank − 1) / (N − 1)
          </div>
          <p className="text-[11px] text-foreground-muted font-sans">
            Ensures that the most cost-efficient bank (lowest CIR) receives the highest percentile of 100.0.
          </p>

          <div className="text-foreground font-bold text-sm pt-2">C. Average-Rank Tie Handling:</div>
          <p className="text-[11px] text-foreground-muted font-sans">
            Tied observations share the exact mean rank of their occupied positions. If all eligible observations for a variable are identical, all banks receive a neutral score of 50.0.
          </p>
        </div>
      </section>

      {/* 5. Quality Score and PeerGap Formulas */}
      <section className="bg-background-surface border border-border rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold font-mono text-foreground flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-blue/15 text-blue inline-flex items-center justify-center text-xs">5</span>
          <span>Composite Quality Score & PeerGap Formulation</span>
        </h3>

        <div className="p-4 bg-background rounded border border-border font-mono text-xs space-y-4">
          <div>
            <div className="text-foreground font-bold text-sm mb-1">Fundamental Quality Score (0 to 100):</div>
            <div className="p-3 bg-background-elevated rounded border border-border text-foreground font-semibold">
              Quality Score = (0.50 × ROE %ile) + (0.20 × ROA %ile) + (0.30 × CIR %ile)
            </div>
            <p className="text-[11px] text-foreground-muted font-sans mt-1.5">
              Default weighting reflects primary emphasis on equity compounding (ROE 50%), followed by operating discipline (CIR 30%) and asset productivity (ROA 20%). Weights are configurable by the user.
            </p>
          </div>

          <div>
            <div className="text-foreground font-bold text-sm mb-1">PeerGap Divergence Score (−100 to +100):</div>
            <div className="p-3 bg-background-elevated rounded border border-border text-foreground font-semibold">
              PeerGap Score = Fundamental Quality Score − Valuation Percentile (P/B)
            </div>
            <p className="text-[11px] text-foreground-muted font-sans mt-1.5">
              Quantifies divergence between operating execution rank and valuation rank.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Score Interpretation Framework */}
      <section className="bg-background-surface border border-border rounded-lg p-5 space-y-3">
        <h3 className="text-sm font-semibold font-mono text-foreground flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-blue/15 text-blue inline-flex items-center justify-center text-xs">6</span>
          <span>Analytical Interpretation Guide</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
          <div className="p-3.5 bg-background rounded border border-border border-l-4 border-l-emerald">
            <div className="font-mono font-bold text-emerald text-xs mb-1">Positive PeerGap (+5 to +100)</div>
            <p className="text-[11px]">
              Normalized fundamental quality exceeds relative market valuation rank. Indicates high operating strength relative to its market multiple within the peer group.
            </p>
          </div>

          <div className="p-3.5 bg-background rounded border border-border border-l-4 border-l-blue">
            <div className="font-mono font-bold text-blue text-xs mb-1">Aligned PeerGap (−5 &lt; score &lt; +5)</div>
            <p className="text-[11px]">
              Fundamental quality and valuation percentiles are well-matched. The market is pricing the bank's operational performance in close harmony with peers.
            </p>
          </div>

          <div className="p-3.5 bg-background rounded border border-border border-l-4 border-l-accent-negative">
            <div className="font-mono font-bold text-accent-negative text-xs mb-1">Negative PeerGap (−100 to −5)</div>
            <p className="text-[11px]">
              Market valuation rank exceeds fundamental quality score. Suggests an elevated valuation multiple, potential quality premium, or market expectations not captured by ROE, ROA, and CIR.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Illustrative Walkthrough */}
      <section className="bg-background-surface border border-border rounded-lg p-5 space-y-3">
        <h3 className="text-sm font-semibold font-mono text-foreground flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-blue/15 text-blue inline-flex items-center justify-center text-xs">7</span>
          <span>Illustrative Calculation Walkthrough</span>
        </h3>
        <p>
          Consider a hypothetical bank ranked across the 6-bank universe:
        </p>
        <div className="p-4 bg-background rounded border border-border font-mono text-xs space-y-2">
          <div>• ROE = 19.6% (Rank 5 of 6) → ROE Percentile = 100 × (5 − 1) / 5 = <strong>80.0%</strong></div>
          <div>• ROA = 3.4% (Rank 5 of 6) → ROA Percentile = 100 × (5 − 1) / 5 = <strong>80.0%</strong></div>
          <div>• CIR = 37.8% (Rank 2 lowest / best of 6) → Inverted CIR Percentile = 100 × (5 − 1) / 5 = <strong>80.0%</strong></div>
          <div className="pt-2 border-t border-border">
            • Quality Score = (0.50 × 80.0) + (0.20 × 80.0) + (0.30 × 80.0) = 40.0 + 16.0 + 24.0 = <strong className="text-blue">80.0</strong>
          </div>
          <div>• P/B = 2.15x (Rank 4 of 6) → Valuation Percentile = 100 × (4 − 1) / 5 = <strong className="text-foreground">60.0%</strong></div>
          <div className="pt-2 border-t border-border font-bold text-emerald">
            • PeerGap Score = Quality (80.0) − Valuation (60.0) = +20.0 (High Positive Divergence)
          </div>
        </div>
      </section>

      {/* 8. Limitations & Financial Disclaimer */}
      <section className="p-5 bg-background-elevated border border-border rounded-lg space-y-3">
        <h3 className="text-sm font-semibold font-mono text-foreground flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-accent-warning" />
          <span>Methodological Limitations & Non-Advisory Disclaimer</span>
        </h3>
        <div className="space-y-2 text-[11px] text-foreground-muted">
          <p>
            <strong>Small Sample Universe:</strong> Ranking over 6 banks represents a focused peer group comparison, not a full statistical distribution of the Indonesian financial sector.
          </p>
          <p>
            <strong>Omitted Banking Dimensions:</strong> Credit risk (NPL ratios), loan loss coverage, capital adequacy (Tier 1 CAR), liquidity (LDR, LCR), and loan growth rates are vital banking fundamentals that this simplified 3-factor model deliberately abstracts.
          </p>
          <p>
            <strong>Descriptive, Not Predictive:</strong> PeerGap IDX is an exploratory analytical platform. It is <strong>NOT</strong> an automated trading application, buy/sell recommendation engine, or intrinsic-value estimation model. A positive PeerGap is not proof of undervaluation.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-foreground-subtle">
          <span>Data Provider: Sectors Financial API v2</span>
          <span>Indonesia Stock Exchange (IDX) Equity Research</span>
        </div>
      </section>
    </div>
  );
}
