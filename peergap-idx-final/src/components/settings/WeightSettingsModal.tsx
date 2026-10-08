"use client";

import React, { useState, useEffect } from "react";
import { ScoringWeights } from "@/types";
import { DEFAULT_SCORING_WEIGHTS, validateWeights } from "@/lib/analytics/quality-score";
import { X, RotateCcw, Check, AlertCircle, Sliders } from "lucide-react";

interface WeightSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeights: ScoringWeights;
  onApplyWeights: (weights: ScoringWeights) => void;
}

export function WeightSettingsModal({
  isOpen,
  onClose,
  currentWeights,
  onApplyWeights,
}: WeightSettingsModalProps) {
  const [roe, setRoe] = useState<number>(currentWeights.roe);
  const [roa, setRoa] = useState<number>(currentWeights.roa);
  const [cir, setCir] = useState<number>(currentWeights.cir);

  useEffect(() => {
    setRoe(currentWeights.roe);
    setRoa(currentWeights.roa);
    setCir(currentWeights.cir);
  }, [currentWeights, isOpen]);

  if (!isOpen) return null;

  const currentSum = roe + roa + cir;
  const validation = validateWeights({ roe, roa, cir });

  const handleReset = () => {
    setRoe(DEFAULT_SCORING_WEIGHTS.roe);
    setRoa(DEFAULT_SCORING_WEIGHTS.roa);
    setCir(DEFAULT_SCORING_WEIGHTS.cir);
  };

  const handleApply = () => {
    if (validation.isValid) {
      onApplyWeights({ roe, roa, cir });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div
        className="bg-background-surface border border-border rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-background-elevated flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue" />
            <h3 className="text-sm font-semibold text-foreground font-mono">
              Adjust Scoring Weights
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-background-hover text-foreground-muted hover:text-foreground border border-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sliders Body */}
        <div className="p-5 space-y-5 text-xs">
          <p className="text-foreground-muted leading-relaxed">
            Modify the analytical weights assigned to fundamental factors. Weights must sum to exactly <strong className="text-foreground">100%</strong>. Changing weights instantly recalculates Quality Scores, PeerGap scores, rankings, and charts.
          </p>

          {/* ROE Weight */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-foreground font-medium">Return on Equity (ROE)</span>
              <span className="font-bold text-blue">{roe}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={roe}
              onChange={(e) => setRoe(Number(e.target.value))}
              className="w-full accent-blue cursor-pointer"
            />
            <span className="text-[10px] text-foreground-subtle">
              Measures net profitability generated on shareholder equity.
            </span>
          </div>

          {/* ROA Weight */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-foreground font-medium">Return on Assets (ROA)</span>
              <span className="font-bold text-emerald">{roa}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={roa}
              onChange={(e) => setRoa(Number(e.target.value))}
              className="w-full accent-emerald cursor-pointer"
            />
            <span className="text-[10px] text-foreground-subtle">
              Measures balance-sheet asset utilization efficiency.
            </span>
          </div>

          {/* CIR Weight */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-foreground font-medium">Cost-to-Income Ratio (CIR, Inverted)</span>
              <span className="font-bold text-accent-warning">{cir}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={cir}
              onChange={(e) => setCir(Number(e.target.value))}
              className="w-full accent-accent-warning cursor-pointer"
            />
            <span className="text-[10px] text-foreground-subtle">
              Measures operating cost efficiency (lower ratio receives higher percentile).
            </span>
          </div>

          {/* Sum Status Box */}
          <div
            className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
              validation.isValid
                ? "bg-emerald/10 border-emerald/30 text-emerald"
                : "bg-accent-negative/10 border-accent-negative/30 text-accent-negative"
            }`}
          >
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>Total Weight Sum: {currentSum}%</span>
            </div>
            <span>{validation.isValid ? "Valid (100%)" : `${currentSum > 100 ? "Exceeds 100%" : "Under 100%"}`}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-background-elevated flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-md bg-background hover:bg-background-hover border border-border text-foreground-muted hover:text-foreground text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Default (50/20/30)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md hover:bg-background-hover text-foreground-muted text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!validation.isValid}
              className="px-4 py-1.5 rounded-md bg-blue hover:bg-blue-hover text-white text-xs font-mono font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Apply Weights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
