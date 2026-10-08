import { NextRequest, NextResponse } from "next/server";
import { acquireLiveRefreshPermit, getBankingUniverseData } from "@/lib/sectors/client";
import { processPeerUniverse } from "@/lib/analytics/universe-engine";
import { DEFAULT_SCORING_WEIGHTS, validateWeights } from "@/lib/analytics/quality-score";
import { ScoringWeights } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("forceRefresh") === "true";
    const preferDemo = searchParams.get("preferDemo") === "true";

    // Optional weight overrides
    const roeParam = searchParams.get("roe");
    const roaParam = searchParams.get("roa");
    const cirParam = searchParams.get("cir");

    let weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS;
    const weightParams = [roeParam, roaParam, cirParam];
    if (weightParams.some((value) => value !== null)) {
      if (weightParams.some((value) => value === null)) {
        return NextResponse.json(
          { success: false, error: "All three scoring weights must be provided together." },
          { status: 400 }
        );
      }

      const [roe, roa, cir] = weightParams.map(Number);
      const candidateWeights = { roe, roa, cir };
      const validation = validateWeights(candidateWeights);
      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        );
      }
      weights = candidateWeights;
    }

    if (
      forceRefresh &&
      !preferDemo &&
      process.env.SECTORS_API_KEY?.trim() &&
      process.env.NEXT_PUBLIC_FORCE_DEMO_MODE !== "true"
    ) {
      const permit = acquireLiveRefreshPermit();
      if (!permit.allowed) {
        return NextResponse.json(
          { success: false, error: `Live refresh is limited to once per minute. Retry in ${permit.retryAfterSeconds} seconds.` },
          { status: 429, headers: { "Retry-After": String(permit.retryAfterSeconds) } }
        );
      }
    }

    const rawResult = await getBankingUniverseData({ forceRefresh, preferDemo });
    if (rawResult.status === "ERROR") {
      return NextResponse.json(
        { success: false, status: rawResult.status, error: rawResult.errorMessage },
        { status: 502 }
      );
    }

    const marketPriceDates = rawResult.data
      .map((bank) => bank.priceDate)
      .filter((date): date is string => date !== null)
      .sort();

    const summary = processPeerUniverse(rawResult.data, {
      weights,
      metadata: {
        source: rawResult.source,
        dataSourceMode: rawResult.mode,
        marketPriceDate: marketPriceDates[marketPriceDates.length - 1] ?? null,
        financialReportDate: rawResult.data[0]?.reportDate ?? null,
        lastRefreshedAt: rawResult.lastRefreshedAt,
        isApiKeyConfigured: rawResult.isApiKeyConfigured,
        periodMethodology: rawResult.mode === "LIVE_API"
          ? "Latest common annual reporting year available across at least four live banks; financial metrics and annual P/B are matched to that year."
          : "Audited FY2024 benchmark fixture; peer financial ratios and annual P/B are for FY2024.",
      },
    });

    return NextResponse.json(
      {
        success: true,
        summary,
        status: rawResult.status,
        errorMessage: rawResult.errorMessage,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
