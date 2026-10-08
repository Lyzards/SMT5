import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { acquireLiveRefreshPermit, clearBankingCache, getBankingUniverseData } from "../src/lib/sectors/client";

const symbols = ["BBCA", "BBRI", "BMRI", "BBNI", "BNGA", "MEGA"];

function companyReport(symbol: string, years: number[]) {
  return {
    symbol: `${symbol}.JK`,
    company_name: `${symbol} Bank`,
    financials: {
      historical_financial_ratio: years.map((year) => ({
        year,
        profitability: { roe: 0.2, roa: 0.03, cost_to_income_ratio: 0.4 },
      })),
      historical_financials: years.map((year) => ({ year, revenue: 100, earnings: 20 })),
    },
    valuation: {
      historical_valuation: years.map((year) => ({ year, pb: 2 })),
    },
  };
}

function installFetchMock(
  handler: (symbol: string) => Response | Promise<Response>
) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const symbol = String(input).match(/report\/([^/]+)/)?.[1] ?? "";
    return handler(symbol);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("Sectors live data client", () => {
  beforeEach(() => {
    clearBankingCache();
    vi.stubEnv("SECTORS_API_KEY", "test-api-key");
    vi.stubEnv("NEXT_PUBLIC_FORCE_DEMO_MODE", "false");
  });

  afterEach(() => {
    clearBankingCache();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("excludes failed symbols and reports a partial live result without fixture data", async () => {
    const fetchMock = installFetchMock((symbol) => symbol === "MEGA"
      ? new Response("unavailable", { status: 503, statusText: "Unavailable" })
      : new Response(JSON.stringify(companyReport(symbol, [2023, 2024])), { status: 200 })
    );

    const result = await getBankingUniverseData({ forceRefresh: true });

    expect(result.mode).toBe("LIVE_API");
    expect(result.status).toBe("PARTIAL");
    expect(result.data.map((bank) => bank.normalizedSymbol)).toEqual(symbols.slice(0, 5));
    expect(result.data.every((bank) => bank.reportingPeriod === "FY 2024")).toBe(true);
    expect(result.errorMessage).toContain("MEGA");
    expect(result.data.some((bank) => bank.companyName === "PT Bank Mega Tbk.")).toBe(false);
    expect(fetchMock.mock.calls[0][1]?.cache).toBe("no-store");
  });

  it("uses the latest fiscal year available to at least four peers", async () => {
    const availableYears: Record<string, number[]> = {
      BBCA: [2023, 2024],
      BBRI: [2023, 2024],
      BMRI: [2023],
      BBNI: [2023],
      BNGA: [2023],
      MEGA: [2024],
    };
    installFetchMock((symbol) => new Response(
      JSON.stringify(companyReport(symbol, availableYears[symbol])),
      { status: 200 }
    ));

    const result = await getBankingUniverseData({ forceRefresh: true });
    const mega = result.data.find((bank) => bank.normalizedSymbol === "MEGA");

    expect(result.status).toBe("SUCCESS");
    expect(result.data.every((bank) => bank.reportingPeriod === "FY 2023")).toBe(true);
    expect(mega?.roe).toBeNull();
    expect(mega?.pb).toBeNull();
  });

  it("returns an error with no financial rows when every live request fails", async () => {
    installFetchMock(() => new Response("unavailable", { status: 503, statusText: "Unavailable" }));

    const result = await getBankingUniverseData({ forceRefresh: true });

    expect(result.mode).toBe("LIVE_API");
    expect(result.status).toBe("ERROR");
    expect(result.data).toEqual([]);
    expect(result.errorMessage).toContain("No financial data is available");
  });

  it("rejects live reports without a fiscal year shared by four peers", async () => {
    installFetchMock((symbol) => {
      const year = 2020 + symbols.indexOf(symbol);
      return new Response(JSON.stringify(companyReport(symbol, [year])), { status: 200 });
    });

    const result = await getBankingUniverseData({ forceRefresh: true });

    expect(result.status).toBe("ERROR");
    expect(result.data).toEqual([]);
    expect(result.errorMessage).toContain("No common financial reporting year");
  });

  it("caches ordinary live requests within the configured TTL", async () => {
    const fetchMock = installFetchMock((symbol) => new Response(
      JSON.stringify(companyReport(symbol, [2024])),
      { status: 200 }
    ));

    await getBankingUniverseData();
    await getBankingUniverseData();

    expect(fetchMock).toHaveBeenCalledTimes(6);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ next: { revalidate: 3600 } });
  });

  it("limits forced live refreshes to one per minute per server instance", () => {
    const start = Date.now() + 100_000;

    expect(acquireLiveRefreshPermit(start)).toEqual({ allowed: true, retryAfterSeconds: 0 });
    expect(acquireLiveRefreshPermit(start + 1_000)).toEqual({ allowed: false, retryAfterSeconds: 59 });
  });
});