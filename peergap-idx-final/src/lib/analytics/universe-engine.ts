import {
  DataStatus,
  PeerAnalysis,
  PeerUniverseSummary,
  RawBankFinancials,
  ScoringWeights,
} from "@/types";
import { calculatePercentileRanks } from "./percentile";
import { calculateQualityScore, DEFAULT_SCORING_WEIGHTS } from "./quality-score";
import { calculatePeerGapScore } from "./peergap-score";
import { generateBankExplanation } from "./explanation-engine";

export interface ComputeUniverseOptions {
  weights?: ScoringWeights;
  minPeers?: number;
  metadata?: Partial<PeerUniverseSummary["metadata"]>;
}

/**
 * Calculates the median of an array of numbers.
 */
export function calculateMedian(numbers: (number | null | undefined)[]): number | null {
  const valid = numbers.filter((n): n is number => n !== null && n !== undefined && !isNaN(n) && isFinite(n));
  if (valid.length === 0) return null;
  valid.sort((a, b) => a - b);
  const mid = Math.floor(valid.length / 2);
  if (valid.length % 2 === 1) {
    return Math.round(valid[mid] * 10000) / 10000;
  }
  return Math.round(((valid[mid - 1] + valid[mid]) / 2) * 10000) / 10000;
}

/**
 * Normalizes ticker symbols (e.g. "BBCA.JK" -> "BBCA").
 */
export function normalizeTicker(ticker: string): string {
  if (!ticker) return "";
  return ticker.toUpperCase().replace(/\.JK$/, "").trim();
}

/**
 * Processes a universe of raw bank financials into full PeerGap analytical results.
 */
export function processPeerUniverse(
  rawBanks: RawBankFinancials[],
  options: ComputeUniverseOptions = {}
): PeerUniverseSummary {
  const weights = options.weights || DEFAULT_SCORING_WEIGHTS;
  const minPeers = options.minPeers ?? 4;

  const totalBanks = rawBanks.length;
  const referenceUniverse = rawBanks.map((b) => b.normalizedSymbol);

  // 1. Prepare items for percentile ranking
  const roeItems = rawBanks.map((b) => ({ id: b.normalizedSymbol, value: b.roe }));
  const roaItems = rawBanks.map((b) => ({ id: b.normalizedSymbol, value: b.roa }));
  const cirItems = rawBanks.map((b) => ({ id: b.normalizedSymbol, value: b.cir }));
  
  // For P/B, non-positive or non-finite values are invalid and excluded from ranking
  const pbItems = rawBanks.map((b) => ({
    id: b.normalizedSymbol,
    value: b.pb !== null && b.pb > 0 ? b.pb : null,
  }));

  // 2. Compute percentile ranks
  // ROE: higher is better
  const roePercentiles = calculatePercentileRanks(roeItems, {
    higherIsBetter: true,
    minValidCount: minPeers,
  });

  // ROA: higher is better
  const roaPercentiles = calculatePercentileRanks(roaItems, {
    higherIsBetter: true,
    minValidCount: minPeers,
  });

  // CIR: lower is better (inverted)
  const cirPercentiles = calculatePercentileRanks(cirItems, {
    higherIsBetter: false,
    minValidCount: minPeers,
  });

  // Valuation: higher P/B -> higher valuation percentile
  const valPercentiles = calculatePercentileRanks(pbItems, {
    higherIsBetter: true,
    minValidCount: minPeers,
  });

  // 3. Process each bank
  const analyzedBanks: PeerAnalysis[] = rawBanks.map((raw) => {
    const sym = raw.normalizedSymbol;
    const roeP = roePercentiles.get(sym) ?? null;
    const roaP = roaPercentiles.get(sym) ?? null;
    const cirP = cirPercentiles.get(sym) ?? null;
    const valP = valPercentiles.get(sym) ?? null;

    // Quality Score
    const qResult = calculateQualityScore(
      { roePercentile: roeP, roaPercentile: roaP, cirPercentile: cirP },
      weights
    );

    // PeerGap Score
    const gapResult = calculatePeerGapScore(qResult.qualityScore, valP);

    const isEligible = qResult.qualityScore !== null && valP !== null && gapResult.peerGapScore !== null;
    let ineligibilityReason: string | undefined = undefined;

    if (!isEligible) {
      if (qResult.ineligibilityReason) {
        ineligibilityReason = qResult.ineligibilityReason;
      } else if (valP === null) {
        if (raw.pb === null) {
          ineligibilityReason = "Missing Price-to-Book (P/B) ratio.";
        } else if (raw.pb <= 0) {
          ineligibilityReason = "Non-positive Price-to-Book (P/B) ratio excluded from valuation ranking.";
        } else {
          ineligibilityReason = "Insufficient peer P/B data to establish valuation percentile.";
        }
      }
    }

    const partialBank: Omit<PeerAnalysis, "explanation"> = {
      symbol: raw.symbol,
      normalizedSymbol: raw.normalizedSymbol,
      companyName: raw.companyName,
      marketCap: raw.marketCap,
      lastClosePrice: raw.lastClosePrice,
      priceDate: raw.priceDate,
      reportingPeriod: raw.reportingPeriod,
      periodType: raw.periodType,
      reportDate: raw.reportDate,
      dataStatus: raw.dataStatus,
      missingFields: raw.missingFields,
      roe: raw.roe,
      roePercentile: roeP,
      roa: raw.roa,
      roaPercentile: roaP,
      cir: raw.cir,
      cirPercentile: cirP,
      pb: raw.pb,
      valuationPercentile: valP,
      qualityScore: qResult.qualityScore,
      peerGapScore: gapResult.peerGapScore,
      rank: null, // assigned below
      isEligible,
      ineligibilityReason,
      factorBreakdown: qResult.factorBreakdown,
    };

    const explanation = generateBankExplanation(partialBank);

    return {
      ...partialBank,
      explanation,
    };
  });

  // 4. Rank eligible banks by PeerGap Score descending
  const eligibleBanks = analyzedBanks.filter((b) => b.isEligible && b.peerGapScore !== null);
  eligibleBanks.sort((a, b) => b.peerGapScore! - a.peerGapScore!);

  eligibleBanks.forEach((b, idx) => {
    b.rank = idx + 1;
  });

  // Keep all analyzed banks ordered with eligible ones ranked first, then ineligible
  const sortedBanks = [...analyzedBanks].sort((a, b) => {
    if (a.rank !== null && b.rank !== null) return a.rank - b.rank;
    if (a.rank !== null) return -1;
    if (b.rank !== null) return 1;
    return a.symbol.localeCompare(b.symbol);
  });

  // 5. Medians across peer universe
  const medians = {
    roe: calculateMedian(analyzedBanks.map((b) => b.roe)),
    roa: calculateMedian(analyzedBanks.map((b) => b.roa)),
    cir: calculateMedian(analyzedBanks.map((b) => b.cir)),
    pb: calculateMedian(analyzedBanks.map((b) => b.pb)),
    qualityScore: calculateMedian(eligibleBanks.map((b) => b.qualityScore)),
    peerGapScore: calculateMedian(eligibleBanks.map((b) => b.peerGapScore)),
  };

  // 6. Highlight banks
  let highestQualityBank: PeerAnalysis | null = null;
  let largestPositiveGapBank: PeerAnalysis | null = null;
  let largestNegativeGapBank: PeerAnalysis | null = null;

  if (eligibleBanks.length > 0) {
    highestQualityBank = [...eligibleBanks].sort(
      (a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0)
    )[0];

    largestPositiveGapBank = eligibleBanks[0]; // rank 1 has highest PeerGap
    largestNegativeGapBank = eligibleBanks[eligibleBanks.length - 1]; // last rank has lowest PeerGap
  }

  return {
    banks: sortedBanks,
    referenceUniverse,
    totalBanks,
    eligibleBanksCount: eligibleBanks.length,
    weights,
    medians,
    highestQualityBank,
    largestPositiveGapBank,
    largestNegativeGapBank,
    metadata: {
      source: options.metadata?.source ?? "Sectors Financial API v2",
      dataSourceMode: options.metadata?.dataSourceMode ?? "DEMO_FIXTURE",
      marketPriceDate: options.metadata?.marketPriceDate ?? null,
      financialReportDate: options.metadata?.financialReportDate ?? null,
      lastRefreshedAt: options.metadata?.lastRefreshedAt ?? new Date().toISOString(),
      isApiKeyConfigured: options.metadata?.isApiKeyConfigured ?? false,
      periodMethodology:
        options.metadata?.periodMethodology ??
        "Trailing Twelve Months (TTM) or Common Latest Annual Period with average balance sheet alignment.",
    },
  };
}
