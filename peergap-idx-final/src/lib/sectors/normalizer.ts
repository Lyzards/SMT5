import { BankSymbol, RawBankFinancials } from "@/types";
import { normalizeTicker } from "../analytics/universe-engine";

export interface SectorsCompanyReportResponse {
  symbol?: string;
  company_name?: string;
  overview?: {
    listing_board?: string;
    industry?: string;
    sub_sector?: string;
    market_cap?: number;
    last_close_price?: number;
    latest_close_date?: string;
  };
  valuation?: {
    last_close_price?: number;
    latest_close_date?: string;
    historical_valuation?: Array<{
      year?: number | string;
      pb?: number | null;
      pe?: number | null;
    }>;
  };
  financials?: {
    historical_financial_ratio?: Array<{
      year?: string | number;
      profitability?: {
        roa?: number | null;
        roe?: number | null;
        cost_to_income_ratio?: number | null;
      };
      efficiency?: {
        cost_to_income_ratio?: number | null;
      };
    }>;
    historical_financials?: Array<{
      year?: number | string;
      revenue?: number | null;
      earnings?: number | null;
      total_assets?: number | null;
      total_equity?: number | null;
      operating_expense?: number | null;
      operating_pnl?: number | null;
    }>;
  };
}

export interface SectorsQuarterlyFinancialItem {
  symbol?: string;
  date?: string;
  revenue?: number | null;
  earnings?: number | null;
  total_assets?: number | null;
  total_equity?: number | null;
  operating_expense?: number | null;
  operating_pnl?: number | null;
  financials_sector_metrics?: {
    interest_income?: number | null;
    interest_expense?: number | null;
    net_interest_income?: number | null;
    total_deposit?: number | null;
    gross_loan?: number | null;
  };
}

/**
 * Normalizes a Sectors company report into RawBankFinancials.
 */
export function normalizeCompanyReport(
  symbol: string,
  data: SectorsCompanyReportResponse,
  commonReportingYear?: string
): RawBankFinancials {
  const normSym = normalizeTicker(symbol) as BankSymbol;
  const companyName = data.company_name || data.symbol || normSym;
  const marketCap = data.overview?.market_cap ?? null;
  const lastClosePrice = data.overview?.last_close_price ?? data.valuation?.last_close_price ?? null;
  const priceDate = data.overview?.latest_close_date ?? data.valuation?.latest_close_date ?? null;

  // Extract latest available financial ratio year
  const ratios = data.financials?.historical_financial_ratio || [];
  // Sort descending by year
  const sortedRatios = [...ratios].sort((a, b) => {
    const yA = Number(a.year) || 0;
    const yB = Number(b.year) || 0;
    return yB - yA;
  });

  const latestRatio = commonReportingYear
    ? sortedRatios.find((ratio) => String(ratio.year) === commonReportingYear)
    : sortedRatios[0];
  const reportingYear = commonReportingYear ?? (latestRatio?.year != null ? String(latestRatio.year) : null);

  let roe = latestRatio?.profitability?.roe ?? null;
  let roa = latestRatio?.profitability?.roa ?? null;
  let cir = latestRatio?.profitability?.cost_to_income_ratio ?? latestRatio?.efficiency?.cost_to_income_ratio ?? null;

  // Extract valuation P/B
  const valuations = data.valuation?.historical_valuation || [];
  const sortedValuations = [...valuations].sort((a, b) => {
    const yA = Number(a.year) || 0;
    const yB = Number(b.year) || 0;
    return yB - yA;
  });
  const latestVal = reportingYear
    ? sortedValuations.find((valuation) => String(valuation.year) === reportingYear)
    : sortedValuations[0];
  const pb = latestVal?.pb ?? null;

  // Underlying amounts
  const finHist = data.financials?.historical_financials || [];
  const latestFin = reportingYear
    ? finHist.find((financials) => String(financials.year) === reportingYear)
    : undefined;

  // If CIR is null in ratio, try deriving CIR = operating_expense / (revenue or operating_income)
  if (cir === null && latestFin?.operating_expense && latestFin?.revenue && latestFin.revenue > 0) {
    cir = latestFin.operating_expense / latestFin.revenue;
  }

  const missingFields: string[] = [];
  if (roe === null) missingFields.push("ROE");
  if (roa === null) missingFields.push("ROA");
  if (cir === null) missingFields.push("CIR");
  if (pb === null) missingFields.push("P/B");

  const dataStatus = missingFields.length === 0 ? "VALID" : missingFields.length < 4 ? "PARTIAL" : "UNAVAILABLE";

  return {
    symbol: data.symbol || `${normSym}.JK`,
    normalizedSymbol: normSym,
    companyName,
    marketCap,
    lastClosePrice,
    priceDate,
    reportingPeriod: reportingYear ? `FY ${reportingYear}` : "Reporting period unavailable",
    periodType: "ANNUAL",
    reportDate: reportingYear ? `${reportingYear}-12-31` : null,
    roe: roe !== null ? Number(roe) : null,
    roa: roa !== null ? Number(roa) : null,
    cir: cir !== null ? Number(cir) : null,
    pb: pb !== null ? Number(pb) : null,
    totalAssets: latestFin?.total_assets ?? null,
    totalEquity: latestFin?.total_equity ?? null,
    revenue: latestFin?.revenue ?? null,
    netIncome: latestFin?.earnings ?? null,
    operatingExpense: latestFin?.operating_expense ?? null,
    operatingIncome: latestFin?.operating_pnl ?? null,
    dataStatus,
    missingFields,
  };
}
