import { PeerAnalysis } from "@/types";

/**
 * Generates a concise, deterministic, rule-based analytical explanation
 * for a bank based strictly on its calculated percentiles, metrics, and divergence score.
 * Never invents external events, macro predictions, or management causality.
 */
export function generateBankExplanation(bank: Omit<PeerAnalysis, "explanation">): string {
  if (!bank.isEligible || bank.qualityScore === null || bank.valuationPercentile === null || bank.peerGapScore === null) {
    if (bank.ineligibilityReason) {
      return `${bank.companyName} (${bank.symbol}) could not be scored: ${bank.ineligibilityReason}. Standing financial metrics are displayed where available.`;
    }
    return `${bank.companyName} (${bank.symbol}) has incomplete data across the peer group, precluding composite score generation.`;
  }

  const { roePercentile, roaPercentile, cirPercentile, valuationPercentile, peerGapScore, symbol } = bank;

  // Describe profitability
  let profDesc = "";
  const avgProf = ((roePercentile ?? 50) + (roaPercentile ?? 50)) / 2;
  if (avgProf >= 67) {
    profDesc = "demonstrates top-tier relative profitability (ROE and ROA ranks in the upper tercile)";
  } else if (avgProf <= 33) {
    profDesc = "exhibits below-median peer profitability on ROE and ROA";
  } else {
    profDesc = "shows moderate profitability tracking near the peer median";
  }

  // Describe efficiency (CIR)
  let cirDesc = "";
  if (cirPercentile! >= 67) {
    cirDesc = "favorable operational cost efficiency (low Cost-to-Income ratio)";
  } else if (cirPercentile! <= 33) {
    cirDesc = "higher relative Cost-to-Income ratio than most peers";
  } else {
    cirDesc = "cost-to-income efficiency comparable to the peer average";
  }

  // Describe valuation percentile
  let valDesc = "";
  if (valuationPercentile >= 70) {
    valDesc = "market valuation sits in the highest percentile of the peer group based on P/B";
  } else if (valuationPercentile <= 30) {
    valDesc = "P/B valuation ranks among the lower percentiles of the peer group";
  } else {
    valDesc = "P/B valuation aligns closely with mid-tier peer multiples";
  }

  // Divergence synthesis
  let gapDesc = "";
  if (peerGapScore >= 20) {
    gapDesc = `The pronounced positive PeerGap (+${peerGapScore.toFixed(1)}) indicates that fundamental quality exceeds relative market valuation by a substantial margin, highlighting a quality-valuation discrepancy worth further research.`;
  } else if (peerGapScore >= 5) {
    gapDesc = `The positive PeerGap (+${peerGapScore.toFixed(1)}) suggests its quality metrics score ahead of its current P/B ranking relative to comparable banks.`;
  } else if (peerGapScore <= -20) {
    gapDesc = `The pronounced negative PeerGap (${peerGapScore.toFixed(1)}) indicates the market attaches an elevated valuation multiple relative to its fundamental quality score, reflecting a potential quality premium or expectations not captured by ROE, ROA, and CIR.`;
  } else if (peerGapScore <= -5) {
    gapDesc = `The negative PeerGap (${peerGapScore.toFixed(1)}) reflects a valuation multiple positioned moderately above its normalized fundamental quality rank.`;
  } else {
    gapDesc = `The near-zero PeerGap (${peerGapScore >= 0 ? "+" : ""}${peerGapScore.toFixed(1)}) shows fundamental performance and market valuation percentiles are relatively balanced within this peer group.`;
  }

  return `${symbol} ${profDesc} paired with ${cirDesc}. Meanwhile, its ${valDesc}. ${gapDesc}`;
}
