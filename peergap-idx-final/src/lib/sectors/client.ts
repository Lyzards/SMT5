import { RawBankFinancials } from "@/types";
import { DEMO_BANKING_FIXTURE } from "./demo-fixture";
import { normalizeCompanyReport, SectorsCompanyReportResponse } from "./normalizer";

const SECTORS_API_BASE_URL = "https://api.sectors.app/v2";
const TARGET_BANK_SYMBOLS = ["BBCA", "BBRI", "BMRI", "BBNI", "BNGA", "MEGA"];

interface CacheEntry {
  data: RawBankFinancials[];
  timestamp: number;
  source: string;
  status: "SUCCESS" | "PARTIAL";
  errorMessage?: string;
}

// In-memory server-side cache
let memoryCache: CacheEntry | null = null;
const LIVE_REFRESH_COOLDOWN_MS = 60_000;
let lastLiveRefreshAt = 0;

export function acquireLiveRefreshPermit(now = Date.now()): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const retryAfterMs = lastLiveRefreshAt + LIVE_REFRESH_COOLDOWN_MS - now;
  if (retryAfterMs > 0) {
    return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  lastLiveRefreshAt = now;
  return { allowed: true, retryAfterSeconds: 0 };
}

export interface FetchUniverseResult {
  data: RawBankFinancials[];
  mode: "LIVE_API" | "DEMO_FIXTURE";
  isApiKeyConfigured: boolean;
  source: string;
  lastRefreshedAt: string;
  errorMessage?: string;
  status: "SUCCESS" | "PARTIAL" | "ERROR";
}

interface FetchedReport {
  symbol: string;
  data: SectorsCompanyReportResponse;
}

function findLatestCommonReportingYear(reports: FetchedReport[]): string | null {
  const yearCounts = new Map<string, number>();

  reports.forEach(({ data }) => {
    const years = new Set(
      (data.financials?.historical_financial_ratio ?? [])
        .map((ratio) => ratio.year)
        .filter((year): year is string | number => year !== null && year !== undefined)
        .map(String)
    );
    years.forEach((year) => yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1));
  });

  return Array.from(yearCounts.entries())
    .filter(([, count]) => count >= 4)
    .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))[0]?.[0] ?? null;
}

/**
 * Gets cache TTL in milliseconds (defaults to 1 hour = 3,600,000 ms).
 */
function getCacheTTL(): number {
  const envTTL = process.env.SECTORS_CACHE_TTL;
  if (envTTL) {
    const parsed = parseInt(envTTL, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed * 1000;
    }
  }
  return 3600 * 1000; // 1 hour
}

/**
 * Fetches the banking universe data.
 * When SECTORS_API_KEY is not configured or preferDemo is true,
 * cleanly loads the verified Indonesian Banking benchmark fixture.
 */
export async function getBankingUniverseData(options: {
  forceRefresh?: boolean;
  preferDemo?: boolean;
} = {}): Promise<FetchUniverseResult> {
  const apiKey = process.env.SECTORS_API_KEY?.trim();
  const isForceDemo =
    options.preferDemo ||
    process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === "true" ||
    !apiKey;

  // 1. If DEMO mode or no API key, serve benchmark fixture
  if (isForceDemo) {
    return {
      data: DEMO_BANKING_FIXTURE,
      mode: "DEMO_FIXTURE",
      isApiKeyConfigured: Boolean(apiKey),
      source: "Sectors API v2 / Indonesian Banking Universe Benchmark Fixture",
      lastRefreshedAt: new Date().toISOString(),
      status: "SUCCESS",
    };
  }

  // 2. Check server-side cache
  const now = Date.now();
  const ttl = getCacheTTL();

  if (
    !options.forceRefresh &&
    memoryCache &&
    now - memoryCache.timestamp < ttl
  ) {
    return {
      data: memoryCache.data,
      mode: "LIVE_API",
      isApiKeyConfigured: true,
      source: memoryCache.source,
      lastRefreshedAt: new Date(memoryCache.timestamp).toISOString(),
      status: memoryCache.status,
      errorMessage: memoryCache.errorMessage,
    };
  }

  // 3. Query the live API for each bank; never mix in fixture financials.
  try {
    const fetchPromises = TARGET_BANK_SYMBOLS.map(async (symbol) => {
      const url = `${SECTORS_API_BASE_URL}/company/report/${symbol}/?sections=overview,valuation,financials`;
      const fetchOptions = options.forceRefresh
        ? {
            headers: {
              Authorization: apiKey!,
              Accept: "application/json",
            },
            cache: "no-store" as const,
          }
        : {
            headers: {
              Authorization: apiKey!,
              Accept: "application/json",
            },
            next: { revalidate: Math.max(1, Math.floor(ttl / 1000)) },
          };
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(
          `Sectors API error for ${symbol}: HTTP ${response.status} ${response.statusText}`
        );
      }

      const json: SectorsCompanyReportResponse = await response.json();
      return { symbol, data: json };
    });

    const results = await Promise.allSettled(fetchPromises);
    const reports: FetchedReport[] = [];
    const failedSymbols: string[] = [];

    results.forEach((res, index) => {
      const symbol = TARGET_BANK_SYMBOLS[index];
      if (res.status === "fulfilled") {
        reports.push(res.value);
      } else {
        failedSymbols.push(symbol);
      }
    });

    if (reports.length === 0) {
      return {
        data: [],
        mode: "LIVE_API",
        isApiKeyConfigured: true,
        source: "Sectors Financial API v2 (Live Production Endpoints)",
        lastRefreshedAt: new Date().toISOString(),
        status: "ERROR",
        errorMessage: `Sectors API failed for all requested banks: ${failedSymbols.join(", ")}. No financial data is available.`,
      };
    }

    const commonReportingYear = findLatestCommonReportingYear(reports);
    if (!commonReportingYear) {
      return {
        data: [],
        mode: "LIVE_API",
        isApiKeyConfigured: true,
        source: "Sectors Financial API v2 (Live Production Endpoints)",
        lastRefreshedAt: new Date().toISOString(),
        status: "ERROR",
        errorMessage: "No common financial reporting year is available for at least four live banks; incomparable reports were not combined.",
      };
    }

    const normalizedBanks = reports.map(({ symbol, data }) =>
      normalizeCompanyReport(symbol, data, commonReportingYear)
    );
    const errorMessage = failedSymbols.length > 0
      ? `Live API data for ${failedSymbols.join(", ")} could not be loaded and those banks were excluded. Available data is aligned to FY ${commonReportingYear}.`
      : undefined;
    const status = failedSymbols.length > 0 ? "PARTIAL" : "SUCCESS";
    const source = `Sectors Financial API v2 (Live Production Endpoints, FY ${commonReportingYear})`;

    // Update memory cache
    memoryCache = {
      data: normalizedBanks,
      timestamp: now,
      source,
      status,
      errorMessage,
    };

    return {
      data: normalizedBanks,
      mode: "LIVE_API",
      isApiKeyConfigured: true,
      source,
      lastRefreshedAt: new Date(now).toISOString(),
      status,
      errorMessage,
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Unknown API network error";
    console.error("[Sectors API Error]", errMsg);

    return {
      data: [],
      mode: "LIVE_API",
      isApiKeyConfigured: true,
      source: "Sectors Financial API v2 (Live Production Endpoints)",
      lastRefreshedAt: new Date().toISOString(),
      status: "ERROR",
      errorMessage: `Sectors API call failed: ${errMsg}. No financial data was substituted.`,
    };
  }
}

/**
 * Clears the server-side cache.
 */
export function clearBankingCache(): void {
  memoryCache = null;
}
