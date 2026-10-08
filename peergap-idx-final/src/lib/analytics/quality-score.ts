import { FactorBreakdown, MetricFactorContribution, ScoringWeights } from "@/types";

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  roe: 50,
  roa: 20,
  cir: 30,
};

export interface ValidateWeightsResult {
  isValid: boolean;
  error?: string;
  normalizedWeights: {
    roe: number;
    roa: number;
    cir: number;
  };
}

/**
 * Validates that weights are non-negative and sum to exactly 100%.
 */
export function validateWeights(weights: ScoringWeights): ValidateWeightsResult {
  const { roe, roa, cir } = weights;

  if (![roe, roa, cir].every(Number.isFinite)) {
    return {
      isValid: false,
      error: "Weights must be finite numbers.",
      normalizedWeights: { roe: 0, roa: 0, cir: 0 },
    };
  }

  if (roe < 0 || roa < 0 || cir < 0) {
    return {
      isValid: false,
      error: "Weights must be non-negative.",
      normalizedWeights: { roe: 0, roa: 0, cir: 0 },
    };
  }

  const sum = Math.round((roe + roa + cir) * 100) / 100;
  if (Math.abs(sum - 100) > 0.01) {
    return {
      isValid: false,
      error: `Weights must sum to 100%. Current sum: ${sum}%`,
      normalizedWeights: { roe: 0, roa: 0, cir: 0 },
    };
  }

  return {
    isValid: true,
    normalizedWeights: {
      roe: roe / 100,
      roa: roa / 100,
      cir: cir / 100,
    },
  };
}

export interface QualityScoreInputs {
  roePercentile: number | null;
  roaPercentile: number | null;
  cirPercentile: number | null;
}

export interface QualityScoreResult {
  qualityScore: number | null;
  factorBreakdown: FactorBreakdown | null;
  ineligibilityReason?: string;
}

/**
 * Computes the Fundamental Quality Score (0 - 100) and factor breakdown.
 * Does not dynamically redistribute missing weights.
 */
export function calculateQualityScore(
  inputs: QualityScoreInputs,
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): QualityScoreResult {
  const validation = validateWeights(weights);
  if (!validation.isValid) {
    return {
      qualityScore: null,
      factorBreakdown: null,
      ineligibilityReason: validation.error,
    };
  }

  const { roePercentile, roaPercentile, cirPercentile } = inputs;
  const missing: string[] = [];

  const isValidPercentile = (value: number | null) =>
    value !== null && Number.isFinite(value) && value >= 0 && value <= 100;

  if (!isValidPercentile(roePercentile)) missing.push("ROE");
  if (!isValidPercentile(roaPercentile)) missing.push("ROA");
  if (!isValidPercentile(cirPercentile)) missing.push("Cost-to-Income Ratio (CIR)");

  if (missing.length > 0) {
    return {
      qualityScore: null,
      factorBreakdown: null,
      ineligibilityReason: `Missing required percentile metrics: ${missing.join(", ")}`,
    };
  }

  const w = validation.normalizedWeights;

  const roeContrib: MetricFactorContribution = {
    weight: w.roe,
    percentile: roePercentile!,
    contribution: Math.round(w.roe * roePercentile! * 100) / 100,
  };

  const roaContrib: MetricFactorContribution = {
    weight: w.roa,
    percentile: roaPercentile!,
    contribution: Math.round(w.roa * roaPercentile! * 100) / 100,
  };

  const cirContrib: MetricFactorContribution = {
    weight: w.cir,
    percentile: cirPercentile!,
    contribution: Math.round(w.cir * cirPercentile! * 100) / 100,
  };

  const rawScore = roeContrib.contribution + roaContrib.contribution + cirContrib.contribution;
  const qualityScore = Math.round(rawScore * 100) / 100;

  return {
    qualityScore,
    factorBreakdown: {
      roe: roeContrib,
      roa: roaContrib,
      cir: cirContrib,
      totalQualityScore: qualityScore,
    },
  };
}
