/**
 * PeerGap IDX - PeerGap Divergence Score Engine
 * 
 * Formula:
 * PeerGap Score = Quality Score - Valuation Percentile (P/B)
 * Range: -100 to +100
 */

export type DivergenceCategory = 
  | "HIGH_POSITIVE_GAP" 
  | "MODERATE_POSITIVE_GAP" 
  | "ALIGNED" 
  | "MODERATE_NEGATIVE_GAP" 
  | "HIGH_NEGATIVE_GAP" 
  | "UNAVAILABLE";

export interface PeerGapResult {
  peerGapScore: number | null;
  category: DivergenceCategory;
  categoryLabel: string;
  ineligibilityReason?: string;
}

export function calculatePeerGapScore(
  qualityScore: number | null,
  valuationPercentile: number | null
): PeerGapResult {
  if (
    qualityScore === null ||
    valuationPercentile === null ||
    !Number.isFinite(qualityScore) ||
    !Number.isFinite(valuationPercentile)
  ) {
    const missing: string[] = [];
    if (qualityScore === null) missing.push("Quality Score");
    if (valuationPercentile === null) missing.push("Valuation Percentile (P/B)");

    return {
      peerGapScore: null,
      category: "UNAVAILABLE",
      categoryLabel: "Unavailable",
      ineligibilityReason: `Cannot compute PeerGap: ${missing.join(" and ")} missing.`,
    };
  }

  if (
    qualityScore < 0 || qualityScore > 100 ||
    valuationPercentile < 0 || valuationPercentile > 100
  ) {
    return {
      peerGapScore: null,
      category: "UNAVAILABLE",
      categoryLabel: "Unavailable",
      ineligibilityReason: "Cannot compute PeerGap: scores must be between 0 and 100.",
    };
  }

  const rawGap = qualityScore - valuationPercentile;
  const peerGapScore = Math.round(rawGap * 100) / 100;

  let category: DivergenceCategory = "ALIGNED";
  let categoryLabel = "Quality-Valuation Aligned";

  if (peerGapScore >= 20) {
    category = "HIGH_POSITIVE_GAP";
    categoryLabel = "Significant Quality Advantage";
  } else if (peerGapScore >= 5) {
    category = "MODERATE_POSITIVE_GAP";
    categoryLabel = "Moderate Quality Advantage";
  } else if (peerGapScore <= -20) {
    category = "HIGH_NEGATIVE_GAP";
    categoryLabel = "Significant Valuation Premium";
  } else if (peerGapScore <= -5) {
    category = "MODERATE_NEGATIVE_GAP";
    categoryLabel = "Moderate Valuation Premium";
  } else {
    category = "ALIGNED";
    categoryLabel = "Quality-Valuation Aligned";
  }

  return {
    peerGapScore,
    category,
    categoryLabel,
  };
}
