export type BankSymbol = "BBCA" | "BBRI" | "BMRI" | "BBNI" | "BNGA" | "MEGA";

export interface ScoringWeights {
  roe: number; // e.g. 50 (%)
  roa: number; // e.g. 20 (%)
  cir: number; // e.g. 30 (%)
}

export type PeriodType = "TTM" | "ANNUAL";

export type DataStatus = "VALID" | "PARTIAL" | "UNAVAILABLE";

export interface RawBankFinancials {
  symbol: string; // "BBCA" or "BBCA.JK"
  normalizedSymbol: BankSymbol | string; // "BBCA"
  companyName: string;
  marketCap: number | null;
  lastClosePrice: number | null;
  priceDate: string | null;
  reportingPeriod: string; // e.g. "FY 2024 (Audited)" or "TTM Q3-2024"
  periodType: PeriodType;
  
  // Fundamental values (in decimal form: 0.185 = 18.5%)
  roe: number | null;
  roa: number | null;
  cir: number | null; // Cost-to-Income Ratio (0.42 = 42%)
  pb: number | null;  // Price-to-Book multiple (e.g. 4.35)

  // Underlying absolute numbers for transparency (IDR)
  totalAssets?: number | null;
  totalEquity?: number | null;
  revenue?: number | null;
  netIncome?: number | null;
  operatingExpense?: number | null;
  operatingIncome?: number | null;

  // Status & provenance
  dataStatus: DataStatus;
  missingFields: string[];
  reportDate: string | null;
}

export interface MetricFactorContribution {
  weight: number;         // e.g. 0.50
  percentile: number;     // e.g. 80.0
  contribution: number;   // weight * percentile, e.g. 40.0
}

export interface FactorBreakdown {
  roe: MetricFactorContribution;
  roa: MetricFactorContribution;
  cir: MetricFactorContribution;
  totalQualityScore: number;
}

export interface PeerAnalysis {
  symbol: string;
  normalizedSymbol: string;
  companyName: string;
  marketCap: number | null;
  lastClosePrice: number | null;
  priceDate: string | null;
  reportingPeriod: string;
  periodType: PeriodType;
  reportDate: string | null;
  dataStatus: DataStatus;
  missingFields: string[];

  // Fundamentals
  roe: number | null;
  roePercentile: number | null;

  roa: number | null;
  roaPercentile: number | null;

  cir: number | null;
  cirPercentile: number | null; // Inverted: lower CIR gets higher percentile

  pb: number | null;
  valuationPercentile: number | null; // Higher P/B gets higher valuation percentile

  // Scores
  qualityScore: number | null;     // 0 - 100
  peerGapScore: number | null;     // Quality - ValuationPercentile (-100 to +100)
  rank: number | null;             // Ranking by PeerGap Score

  isEligible: boolean;
  ineligibilityReason?: string;

  // Breakdown & Explainability
  factorBreakdown: FactorBreakdown | null;
  explanation: string;
}

export interface PeerUniverseSummary {
  banks: PeerAnalysis[];
  referenceUniverse: string[];
  totalBanks: number;
  eligibleBanksCount: number;
  weights: ScoringWeights;
  
  medians: {
    roe: number | null;
    roa: number | null;
    cir: number | null;
    pb: number | null;
    qualityScore: number | null;
    peerGapScore: number | null;
  };

  highestQualityBank: PeerAnalysis | null;
  largestPositiveGapBank: PeerAnalysis | null;
  largestNegativeGapBank: PeerAnalysis | null;

  metadata: {
    source: string;
    dataSourceMode: "LIVE_API" | "DEMO_FIXTURE";
    marketPriceDate: string | null;
    financialReportDate: string | null;
    lastRefreshedAt: string;
    isApiKeyConfigured: boolean;
    periodMethodology: string;
  };
}

export interface FilterState {
  searchQuery: string;
  minQualityScore: number;
  minPeerGap: number;
  maxPeerGap: number;
  sortField: keyof PeerAnalysis | "default";
  sortDirection: "asc" | "desc";
}
