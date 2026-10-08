"use client";

import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PeerAnalysis, PeerUniverseSummary } from "@/types";
import { formatPercent, formatMultiple, formatScore, formatPeerGap } from "@/lib/formatters";

interface QualityValuationScatterProps {
  summary: PeerUniverseSummary | null;
  onSelectBank: (bank: PeerAnalysis) => void;
  selectedSymbol?: string | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: PeerAnalysis }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const bank = payload[0].payload;
    const gap = bank.peerGapScore ?? 0;
    const isPos = gap > 0;
    const isNeg = gap < 0;

    return (
      <div className="bg-background-elevated border border-border p-3 rounded-lg shadow-xl text-xs max-w-xs font-mono">
        <div className="flex items-center justify-between border-b border-border/80 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-foreground text-sm">{bank.normalizedSymbol}</span>
            <span className="text-[10px] text-foreground-muted">Rank #{bank.rank ?? "N/A"}</span>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              isPos
                ? "bg-emerald-muted text-emerald"
                : isNeg
                ? "bg-accent-negative/15 text-accent-negative"
                : "bg-border text-foreground-muted"
            }`}
          >
            PeerGap: {formatPeerGap(bank.peerGapScore)}
          </span>
        </div>

        <p className="text-[11px] text-foreground-muted mb-2 font-sans truncate">{bank.companyName}</p>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] mb-2">
          <div>
            <span className="text-foreground-muted">Quality Score: </span>
            <span className="text-foreground font-semibold">{formatScore(bank.qualityScore)}</span>
          </div>
          <div>
            <span className="text-foreground-muted">Valuation Pct: </span>
            <span className="text-foreground font-semibold">{formatScore(bank.valuationPercentile)}%</span>
          </div>
          <div>
            <span className="text-foreground-muted">ROE: </span>
            <span className="text-foreground">{formatPercent(bank.roe)}</span>
          </div>
          <div>
            <span className="text-foreground-muted">P/B: </span>
            <span className="text-foreground">{formatMultiple(bank.pb)}</span>
          </div>
          <div>
            <span className="text-foreground-muted">ROA: </span>
            <span className="text-foreground">{formatPercent(bank.roa)}</span>
          </div>
          <div>
            <span className="text-foreground-muted">CIR: </span>
            <span className="text-foreground">{formatPercent(bank.cir)}</span>
          </div>
        </div>

        <div className="text-[10px] text-blue border-t border-border/60 pt-1 flex items-center justify-end">
          Click point to open company analysis →
        </div>
      </div>
    );
  }
  return null;
};

export function QualityValuationScatter({
  summary,
  onSelectBank,
  selectedSymbol,
}: QualityValuationScatterProps) {
  if (!summary) return null;

  // Filter eligible banks with valid coordinates
  const data = summary.banks.filter(
    (b) => b.isEligible && b.valuationPercentile !== null && b.qualityScore !== null
  );

  const medianValuation = summary.medians.qualityScore ? 50 : 50;
  const medianQuality = summary.medians.qualityScore ?? 50;

  return (
    <div className="bg-background-surface border border-border rounded-lg p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>Quality vs Valuation Matrix</span>
            <span className="text-xs font-normal text-foreground-muted">
              (Fundamental Quality Score vs P/B Valuation Percentile)
            </span>
          </h3>
          <p className="text-xs text-foreground-muted mt-0.5">
            Upper-left quadrant indicates quality exceeding valuation rank (positive PeerGap).
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono text-foreground-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald"></span>
            <span>Positive Gap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-negative"></span>
            <span>Negative Gap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue"></span>
            <span>Aligned</span>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[380px] sm:h-[420px]">
        {/* Quadrant Background Watermarks */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none p-10 text-[10px] uppercase font-mono tracking-wider text-border/60">
          <div className="flex items-start justify-start text-emerald/30">
            <span>Quality Advantage (Positive Gap)</span>
          </div>
          <div className="flex items-start justify-end text-blue/30">
            <span>Quality Premium (High-High)</span>
          </div>
          <div className="flex items-end justify-start text-foreground-subtle/30">
            <span>Discount Tier (Low-Low)</span>
          </div>
          <div className="flex items-end justify-end text-accent-negative/30">
            <span>Valuation Stretched (Negative Gap)</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
            {/* Grid & References */}
            <ReferenceLine
              x={50}
              stroke="#263541"
              strokeDasharray="4 4"
              label={{
                value: "Median Valuation (50%)",
                position: "insideBottomRight",
                fill: "#627584",
                fontSize: 10,
              }}
            />
            <ReferenceLine
              y={medianQuality}
              stroke="#263541"
              strokeDasharray="4 4"
              label={{
                value: `Peer Median Quality (${medianQuality.toFixed(0)})`,
                position: "insideTopLeft",
                fill: "#627584",
                fontSize: 10,
              }}
            />

            {/* Parity Line (Quality == Valuation) */}
            <ReferenceLine
              segment={[
                { x: 0, y: 0 },
                { x: 100, y: 100 },
              ]}
              stroke="#384B5B"
              strokeDasharray="2 2"
            />

            <XAxis
              type="number"
              dataKey="valuationPercentile"
              name="Valuation Percentile"
              unit="%"
              domain={[0, 100]}
              tick={{ fill: "#93A4AF", fontSize: 11 }}
              tickLine={{ stroke: "#263541" }}
              axisLine={{ stroke: "#263541" }}
              label={{
                value: "Valuation Percentile (P/B Multiple Rank →)",
                position: "insideBottom",
                offset: -15,
                fill: "#93A4AF",
                fontSize: 11,
              }}
            />

            <YAxis
              type="number"
              dataKey="qualityScore"
              name="Fundamental Quality"
              domain={[0, 100]}
              tick={{ fill: "#93A4AF", fontSize: 11 }}
              tickLine={{ stroke: "#263541" }}
              axisLine={{ stroke: "#263541" }}
              label={{
                value: "Fundamental Quality Score (0 - 100) ↑",
                angle: -90,
                position: "insideLeft",
                offset: 5,
                fill: "#93A4AF",
                fontSize: 11,
              }}
            />

            {/* Scale point size by market cap */}
            <ZAxis
              type="number"
              dataKey="marketCap"
              range={[350, 1200]}
              name="Market Cap"
            />

            <Tooltip content={<CustomTooltip />} />

            <Scatter
              name="Banks"
              data={data}
              onClick={(entry) => onSelectBank(entry as unknown as PeerAnalysis)}
              cursor="pointer"
            >
              {data.map((entry, index) => {
                const gap = entry.peerGapScore ?? 0;
                const isSelected = selectedSymbol === entry.normalizedSymbol;

                let color = "#3B82F6"; // Aligned blue
                if (gap >= 5) color = "#22C55E"; // Positive green
                if (gap <= -5) color = "#EF4444"; // Negative red

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={color}
                    fillOpacity={isSelected ? 1 : 0.85}
                    stroke={isSelected ? "#EAF0F4" : "#101A22"}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Axis Helper Notes */}
      <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center justify-between text-[11px] text-foreground-muted">
        <div>
          <span className="text-foreground font-mono">Dashed Diagonal Line:</span> Parity benchmark where Fundamental Quality = Valuation Percentile.
        </div>
        <div className="text-foreground-subtle font-mono">
          Circle radius scaled by total Market Capitalization (IDR)
        </div>
      </div>
    </div>
  );
}
