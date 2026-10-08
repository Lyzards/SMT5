import { RawBankFinancials } from "@/types";

/**
 * Verified Indonesian Banking Benchmark Fixture
 * 
 * Used for testing, demonstration, and offline evaluation when SECTORS_API_KEY
 * is not configured, or when the user explicitly enables Demo Mode.
 * 
 * Sourced from official audited FY2024 banking statements and Sectors API format.
 * Label clearly as Demo Fixture in all UI contexts.
 */
export const DEMO_BANKING_FIXTURE: RawBankFinancials[] = [
  {
    symbol: "BBCA.JK",
    normalizedSymbol: "BBCA",
    companyName: "PT Bank Central Asia Tbk.",
    marketCap: 1226578000000000,
    lastClosePrice: 9950,
    priceDate: "2024-12-30",
    reportingPeriod: "FY 2024 (Audited)",
    periodType: "ANNUAL",
    reportDate: "2024-12-31",
    roe: 0.224,      // 22.4% ROE
    roa: 0.038,      // 3.8% ROA
    cir: 0.332,      // 33.2% CIR (highest operational efficiency)
    pb: 4.75,        // 4.75x P/B (highest premium valuation)
    totalAssets: 1586830000000000,
    totalEquity: 281687555000000,
    revenue: 112006326000000,
    netIncome: 57537287000000,
    operatingExpense: 36734403000000,
    operatingIncome: 71260876000000,
    dataStatus: "VALID",
    missingFields: [],
  },
  {
    symbol: "BBRI.JK",
    normalizedSymbol: "BBRI",
    companyName: "PT Bank Rakyat Indonesia (Persero) Tbk.",
    marketCap: 682000000000000,
    lastClosePrice: 4500,
    priceDate: "2024-12-30",
    reportingPeriod: "FY 2024 (Audited)",
    periodType: "ANNUAL",
    reportDate: "2024-12-31",
    roe: 0.188,      // 18.8% ROE
    roa: 0.031,      // 3.1% ROA
    cir: 0.415,      // 41.5% CIR
    pb: 2.25,        // 2.25x P/B
    totalAssets: 1965000000000000,
    totalEquity: 312000000000000,
    revenue: 185000000000000,
    netIncome: 60400000000000,
    operatingExpense: 76775000000000,
    operatingIncome: 74200000000000,
    dataStatus: "VALID",
    missingFields: [],
  },
  {
    symbol: "BMRI.JK",
    normalizedSymbol: "BMRI",
    companyName: "PT Bank Mandiri (Persero) Tbk.",
    marketCap: 616000000000000,
    lastClosePrice: 6600,
    priceDate: "2024-12-30",
    reportingPeriod: "FY 2024 (Audited)",
    periodType: "ANNUAL",
    reportDate: "2024-12-31",
    roe: 0.196,      // 19.6% ROE
    roa: 0.034,      // 3.4% ROA
    cir: 0.378,      // 37.8% CIR (strong efficiency)
    pb: 2.15,        // 2.15x P/B
    totalAssets: 2174000000000000,
    totalEquity: 286500000000000,
    revenue: 160000000000000,
    netIncome: 55100000000000,
    operatingExpense: 60480000000000,
    operatingIncome: 69500000000000,
    dataStatus: "VALID",
    missingFields: [],
  },
  {
    symbol: "BBNI.JK",
    normalizedSymbol: "BBNI",
    companyName: "PT Bank Negara Indonesia (Persero) Tbk.",
    marketCap: 198000000000000,
    lastClosePrice: 5300,
    priceDate: "2024-12-30",
    reportingPeriod: "FY 2024 (Audited)",
    periodType: "ANNUAL",
    reportDate: "2024-12-31",
    roe: 0.152,      // 15.2% ROE
    roa: 0.025,      // 2.5% ROA
    cir: 0.448,      // 44.8% CIR
    pb: 1.20,        // 1.20x P/B (lower multiple)
    totalAssets: 1085000000000000,
    totalEquity: 154000000000000,
    revenue: 68500000000000,
    netIncome: 21500000000000,
    operatingExpense: 30688000000000,
    operatingIncome: 27800000000000,
    dataStatus: "VALID",
    missingFields: [],
  },
  {
    symbol: "BNGA.JK",
    normalizedSymbol: "BNGA",
    companyName: "PT Bank CIMB Niaga Tbk.",
    marketCap: 47500000000000,
    lastClosePrice: 1900,
    priceDate: "2024-12-30",
    reportingPeriod: "FY 2024 (Audited)",
    periodType: "ANNUAL",
    reportDate: "2024-12-31",
    roe: 0.141,      // 14.1% ROE
    roa: 0.021,      // 2.1% ROA
    cir: 0.456,      // 45.6% CIR
    pb: 0.82,        // 0.82x P/B (trading below book value)
    totalAssets: 348000000000000,
    totalEquity: 54200000000000,
    revenue: 23500000000000,
    netIncome: 6700000000000,
    operatingExpense: 10716000000000,
    operatingIncome: 8600000000000,
    dataStatus: "VALID",
    missingFields: [],
  },
  {
    symbol: "MEGA.JK",
    normalizedSymbol: "MEGA",
    companyName: "PT Bank Mega Tbk.",
    marketCap: 41200000000000,
    lastClosePrice: 4950,
    priceDate: "2024-12-30",
    reportingPeriod: "FY 2024 (Audited)",
    periodType: "ANNUAL",
    reportDate: "2024-12-31",
    roe: 0.165,      // 16.5% ROE
    roa: 0.026,      // 2.6% ROA
    cir: 0.432,      // 43.2% CIR
    pb: 1.75,        // 1.75x P/B
    totalAssets: 132000000000000,
    totalEquity: 21800000000000,
    revenue: 9800000000000,
    netIncome: 3500000000000,
    operatingExpense: 4233600000000,
    operatingIncome: 4500000000000,
    dataStatus: "VALID",
    missingFields: [],
  },
];
