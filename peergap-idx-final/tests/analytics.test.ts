import { describe, it, expect } from "vitest";
import { calculatePercentileRanks } from "../src/lib/analytics/percentile";
import { calculateQualityScore, validateWeights } from "../src/lib/analytics/quality-score";
import { calculatePeerGapScore } from "../src/lib/analytics/peergap-score";
import { processPeerUniverse, calculateMedian, normalizeTicker } from "../src/lib/analytics/universe-engine";
import { RawBankFinancials } from "../src/types";

describe("Percentile Ranking Engine", () => {
  it("correctly ranks strictly ascending values (higher is better)", () => {
    const items = [
      { id: "A", value: 10 },
      { id: "B", value: 20 },
      { id: "C", value: 30 },
      { id: "D", value: 40 },
    ];
    const ranks = calculatePercentileRanks(items, { higherIsBetter: true, minValidCount: 4 });

    expect(ranks.get("A")).toBe(0);
    expect(ranks.get("B")).toBeCloseTo(33.3333, 2);
    expect(ranks.get("C")).toBeCloseTo(66.6667, 2);
    expect(ranks.get("D")).toBe(100);
  });

  it("handles ties correctly using average ranks", () => {
    const items = [
      { id: "A", value: 10 },
      { id: "B", value: 20 },
      { id: "C", value: 20 },
      { id: "D", value: 40 },
    ];
    // Ranks: A=1, B and C tie for 2 & 3 (avg = 2.5), D=4
    // Percentile B: 100 * (2.5 - 1) / (4 - 1) = 100 * 1.5 / 3 = 50.0
    const ranks = calculatePercentileRanks(items, { higherIsBetter: true, minValidCount: 4 });

    expect(ranks.get("A")).toBe(0);
    expect(ranks.get("B")).toBe(50);
    expect(ranks.get("C")).toBe(50);
    expect(ranks.get("D")).toBe(100);
  });

  it("correctly inverts ranking for Cost-to-Income Ratio (lower is better)", () => {
    const items = [
      { id: "A", value: 0.35 }, // Best efficiency (lowest CIR) -> percentile 100
      { id: "B", value: 0.40 },
      { id: "C", value: 0.45 },
      { id: "D", value: 0.55 }, // Worst efficiency (highest CIR) -> percentile 0
    ];
    const ranks = calculatePercentileRanks(items, { higherIsBetter: false, minValidCount: 4 });

    expect(ranks.get("A")).toBe(100);
    expect(ranks.get("B")).toBeCloseTo(66.6667, 2);
    expect(ranks.get("C")).toBeCloseTo(33.3333, 2);
    expect(ranks.get("D")).toBe(0);
  });

  it("assigns neutral 50.0 percentile when all valid observations are identical", () => {
    const items = [
      { id: "A", value: 0.20 },
      { id: "B", value: 0.20 },
      { id: "C", value: 0.20 },
      { id: "D", value: 0.20 },
    ];
    const ranks = calculatePercentileRanks(items, { higherIsBetter: true, minValidCount: 4 });

    expect(ranks.get("A")).toBe(50);
    expect(ranks.get("B")).toBe(50);
    expect(ranks.get("C")).toBe(50);
    expect(ranks.get("D")).toBe(50);
  });

  it("returns null when fewer than minValidCount valid items exist", () => {
    const items = [
      { id: "A", value: 10 },
      { id: "B", value: 20 },
      { id: "C", value: null },
      { id: "D", value: 40 },
    ];
    // Only 3 valid items, min is 4
    const ranks = calculatePercentileRanks(items, { higherIsBetter: true, minValidCount: 4 });

    expect(ranks.get("A")).toBeNull();
    expect(ranks.get("B")).toBeNull();
    expect(ranks.get("C")).toBeNull();
    expect(ranks.get("D")).toBeNull();
  });
});

describe("Weight Validation and Quality Score", () => {
  it("accepts weights summing to 100%", () => {
    const res = validateWeights({ roe: 50, roa: 20, cir: 30 });
    expect(res.isValid).toBe(true);
    expect(res.normalizedWeights.roe).toBe(0.5);
    expect(res.normalizedWeights.roa).toBe(0.2);
    expect(res.normalizedWeights.cir).toBe(0.3);
  });

  it("rejects weights not summing to 100%", () => {
    const res = validateWeights({ roe: 50, roa: 20, cir: 40 });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("must sum to 100%");
  });

  it("rejects negative weights", () => {
    const res = validateWeights({ roe: -10, roa: 50, cir: 60 });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("non-negative");
  });

  it("rejects non-finite weights and out-of-range percentiles", () => {
    expect(validateWeights({ roe: Number.NaN, roa: 20, cir: 80 }).isValid).toBe(false);

    const res = calculateQualityScore(
      { roePercentile: 101, roaPercentile: 50, cirPercentile: 50 },
      { roe: 50, roa: 20, cir: 30 }
    );
    expect(res.qualityScore).toBeNull();
  });

  it("computes exact Quality Score with factor breakdown", () => {
    // 0.50 * 80 + 0.20 * 60 + 0.30 * 90 = 40 + 12 + 27 = 79
    const res = calculateQualityScore(
      { roePercentile: 80, roaPercentile: 60, cirPercentile: 90 },
      { roe: 50, roa: 20, cir: 30 }
    );

    expect(res.qualityScore).toBe(79);
    expect(res.factorBreakdown?.roe.contribution).toBe(40);
    expect(res.factorBreakdown?.roa.contribution).toBe(12);
    expect(res.factorBreakdown?.cir.contribution).toBe(27);
  });

  it("returns null when required percentile is missing", () => {
    const res = calculateQualityScore(
      { roePercentile: 80, roaPercentile: null, cirPercentile: 90 },
      { roe: 50, roa: 20, cir: 30 }
    );
    expect(res.qualityScore).toBeNull();
    expect(res.ineligibilityReason).toContain("ROA");
  });
});

describe("PeerGap Divergence Score", () => {
  it("calculates positive PeerGap when quality exceeds valuation percentile", () => {
    const res = calculatePeerGapScore(85, 45);
    expect(res.peerGapScore).toBe(40);
    expect(res.category).toBe("HIGH_POSITIVE_GAP");
  });

  it("calculates negative PeerGap when valuation exceeds quality", () => {
    const res = calculatePeerGapScore(40, 75);
    expect(res.peerGapScore).toBe(-35);
    expect(res.category).toBe("HIGH_NEGATIVE_GAP");
  });

  it("identifies aligned score when difference is within [-5, 5]", () => {
    const res = calculatePeerGapScore(62, 60);
    expect(res.peerGapScore).toBe(2);
    expect(res.category).toBe("ALIGNED");
  });

  it("treats the +/-5 thresholds as moderate gaps, not aligned", () => {
    expect(calculatePeerGapScore(55, 50).category).toBe("MODERATE_POSITIVE_GAP");
    expect(calculatePeerGapScore(45, 50).category).toBe("MODERATE_NEGATIVE_GAP");
    expect(calculatePeerGapScore(54.99, 50).category).toBe("ALIGNED");
  });

  it("returns null if either quality or valuation is null", () => {
    const res = calculatePeerGapScore(null, 50);
    expect(res.peerGapScore).toBeNull();
    expect(res.category).toBe("UNAVAILABLE");
  });
});

describe("Full Peer Universe Processing", () => {
  const sampleBanks: RawBankFinancials[] = [
    {
      symbol: "BBCA.JK",
      normalizedSymbol: "BBCA",
      companyName: "Bank Central Asia",
      marketCap: 1200000000000000,
      lastClosePrice: 10000,
      priceDate: "2025-01-30",
      reportingPeriod: "FY 2024",
      periodType: "ANNUAL",
      reportDate: "2024-12-31",
      roe: 0.22,
      roa: 0.038,
      cir: 0.33,
      pb: 4.8,
      dataStatus: "VALID",
      missingFields: [],
    },
    {
      symbol: "BBRI.JK",
      normalizedSymbol: "BBRI",
      companyName: "Bank Rakyat Indonesia",
      marketCap: 700000000000000,
      lastClosePrice: 4700,
      priceDate: "2025-01-30",
      reportingPeriod: "FY 2024",
      periodType: "ANNUAL",
      reportDate: "2024-12-31",
      roe: 0.19,
      roa: 0.031,
      cir: 0.42,
      pb: 2.3,
      dataStatus: "VALID",
      missingFields: [],
    },
    {
      symbol: "BMRI.JK",
      normalizedSymbol: "BMRI",
      companyName: "Bank Mandiri",
      marketCap: 600000000000000,
      lastClosePrice: 6500,
      priceDate: "2025-01-30",
      reportingPeriod: "FY 2024",
      periodType: "ANNUAL",
      reportDate: "2024-12-31",
      roe: 0.20,
      roa: 0.034,
      cir: 0.38,
      pb: 2.1,
      dataStatus: "VALID",
      missingFields: [],
    },
    {
      symbol: "BBNI.JK",
      normalizedSymbol: "BBNI",
      companyName: "Bank Negara Indonesia",
      marketCap: 200000000000000,
      lastClosePrice: 5200,
      priceDate: "2025-01-30",
      reportingPeriod: "FY 2024",
      periodType: "ANNUAL",
      reportDate: "2024-12-31",
      roe: 0.15,
      roa: 0.025,
      cir: 0.45,
      pb: 1.2,
      dataStatus: "VALID",
      missingFields: [],
    },
    {
      symbol: "BNGA.JK",
      normalizedSymbol: "BNGA",
      companyName: "Bank CIMB Niaga",
      marketCap: 45000000000000,
      lastClosePrice: 1800,
      priceDate: "2025-01-30",
      reportingPeriod: "FY 2024",
      periodType: "ANNUAL",
      reportDate: "2024-12-31",
      roe: 0.14,
      roa: 0.021,
      cir: 0.46,
      pb: 0.8,
      dataStatus: "VALID",
      missingFields: [],
    },
    {
      symbol: "MEGA.JK",
      normalizedSymbol: "MEGA",
      companyName: "Bank Mega",
      marketCap: 40000000000000,
      lastClosePrice: 5000,
      priceDate: "2025-01-30",
      reportingPeriod: "FY 2024",
      periodType: "ANNUAL",
      reportDate: "2024-12-31",
      roe: 0.16,
      roa: 0.026,
      cir: 0.44,
      pb: 1.8,
      dataStatus: "VALID",
      missingFields: [],
    },
  ];

  it("processes all 6 banks into ranked PeerGap universe", () => {
    const summary = processPeerUniverse(sampleBanks);

    expect(summary.totalBanks).toBe(6);
    expect(summary.eligibleBanksCount).toBe(6);
    expect(summary.banks.length).toBe(6);

    // Rank 1 must have the highest PeerGap score
    expect(summary.banks[0].rank).toBe(1);
    expect(summary.banks[0].peerGapScore).toBeGreaterThanOrEqual(summary.banks[1].peerGapScore!);

    // Highest quality bank check
    expect(summary.highestQualityBank?.normalizedSymbol).toBe("BBCA");

    // Medians calculated
    expect(summary.medians.roe).not.toBeNull();
    expect(summary.medians.pb).not.toBeNull();
  });

  it("excludes non-positive P/B from valuation percentile and marks bank ineligible", () => {
    const banksWithInvalidPB = [...sampleBanks];
    banksWithInvalidPB[4] = {
      ...banksWithInvalidPB[4],
      pb: -0.5, // Invalid negative P/B
    };

    const summary = processPeerUniverse(banksWithInvalidPB);
    const bnga = summary.banks.find((b) => b.normalizedSymbol === "BNGA");

    expect(bnga?.isEligible).toBe(false);
    expect(bnga?.valuationPercentile).toBeNull();
    expect(bnga?.peerGapScore).toBeNull();
    expect(bnga?.ineligibilityReason).toContain("Non-positive");
  });

  it("normalizes ticker symbols properly", () => {
    expect(normalizeTicker("BBCA.JK")).toBe("BBCA");
    expect(normalizeTicker("bbca")).toBe("BBCA");
    expect(normalizeTicker("bmri.jk")).toBe("BMRI");
  });

  it("calculates medians accurately for even and odd counts", () => {
    expect(calculateMedian([1, 3, 2])).toBe(2);
    expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
    expect(calculateMedian([])).toBeNull();
  });
});
