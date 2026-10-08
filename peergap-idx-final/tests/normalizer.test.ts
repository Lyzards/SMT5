import { describe, it, expect } from "vitest";
import { normalizeCompanyReport } from "../src/lib/sectors/normalizer";

describe("Sectors API Response Normalizer", () => {
  it("normalizes a company report response correctly", () => {
    const rawReport = {
      symbol: "BBCA.JK",
      company_name: "PT Bank Central Asia Tbk.",
      overview: {
        market_cap: 1200000000000000,
        last_close_price: 9950,
        latest_close_date: "2024-12-30",
      },
      valuation: {
        last_close_price: 9950,
        latest_close_date: "2024-12-30",
        historical_valuation: [
          { year: 2024, pb: 4.75, pe: 21.5 },
          { year: 2023, pb: 4.5, pe: 22.0 },
        ],
      },
      financials: {
        historical_financial_ratio: [
          {
            year: "2024",
            profitability: {
              roe: 0.224,
              roa: 0.038,
              cost_to_income_ratio: 0.332,
            },
          },
        ],
        historical_financials: [
          {
            year: "2024",
            revenue: 112000000000000,
            earnings: 57500000000000,
            total_assets: 1580000000000000,
            total_equity: 280000000000000,
          },
        ],
      },
    };

    const normalized = normalizeCompanyReport("BBCA", rawReport);

    expect(normalized.normalizedSymbol).toBe("BBCA");
    expect(normalized.symbol).toBe("BBCA.JK");
    expect(normalized.companyName).toBe("PT Bank Central Asia Tbk.");
    expect(normalized.roe).toBe(0.224);
    expect(normalized.roa).toBe(0.038);
    expect(normalized.cir).toBe(0.332);
    expect(normalized.pb).toBe(4.75);
    expect(normalized.marketCap).toBe(1200000000000000);
    expect(normalized.dataStatus).toBe("VALID");
    expect(normalized.missingFields.length).toBe(0);
  });

  it("handles missing ratios honestly without inventing fake numbers", () => {
    const rawIncomplete = {
      symbol: "TEST.JK",
      company_name: "Incomplete Bank",
      financials: {
        historical_financial_ratio: [
          {
            year: "2024",
            profitability: {
              roe: 0.15,
              // roa and cir missing!
            },
          },
        ],
      },
      valuation: {
        historical_valuation: [{ year: 2024, pb: 1.5 }],
      },
    };

    const normalized = normalizeCompanyReport("TEST", rawIncomplete);

    expect(normalized.roe).toBe(0.15);
    expect(normalized.roa).toBeNull();
    expect(normalized.cir).toBeNull();
    expect(normalized.dataStatus).toBe("PARTIAL");
    expect(normalized.missingFields).toContain("ROA");
    expect(normalized.missingFields).toContain("CIR");
  });

  it("matches financials and P/B to the requested reporting year", () => {
    const report = {
      symbol: "BBCA.JK",
      financials: {
        historical_financial_ratio: [
          { year: 2024, profitability: { roe: 0.2, roa: 0.03, cost_to_income_ratio: 0.4 } },
          { year: 2023, profitability: { roe: 0.18, roa: 0.025, cost_to_income_ratio: 0.42 } },
        ],
        historical_financials: [
          { year: 2024, revenue: 200, earnings: 40 },
          { year: 2023, revenue: 180, earnings: 32 },
        ],
      },
      valuation: { historical_valuation: [{ year: 2024, pb: 2.5 }, { year: 2023, pb: 2 }] },
    };

    const normalized = normalizeCompanyReport("BBCA", report, "2023");

    expect(normalized.reportingPeriod).toBe("FY 2023");
    expect(normalized.reportDate).toBe("2023-12-31");
    expect(normalized.roe).toBe(0.18);
    expect(normalized.pb).toBe(2);
    expect(normalized.revenue).toBe(180);
  });

  it("does not borrow newer-year metrics when the requested year is unavailable", () => {
    const report = {
      financials: {
        historical_financial_ratio: [
          { year: 2024, profitability: { roe: 0.2, roa: 0.03, cost_to_income_ratio: 0.4 } },
        ],
      },
      valuation: { historical_valuation: [{ year: 2024, pb: 2.5 }] },
    };

    const normalized = normalizeCompanyReport("BBCA", report, "2023");

    expect(normalized.reportingPeriod).toBe("FY 2023");
    expect(normalized.roe).toBeNull();
    expect(normalized.pb).toBeNull();
    expect(normalized.dataStatus).toBe("UNAVAILABLE");
  });
});
