/**
 * PeerGap IDX - Financial Formatting Utilities
 * 
 * Consistent Indonesian market conventions: IDR denominations,
 * tabular numerals, decimal formatting, and signs.
 */

export function formatCurrencyIDR(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "N/A";
  if (val >= 1e12) {
    return `Rp ${(val / 1e12).toFixed(1)} T`;
  }
  if (val >= 1e9) {
    return `Rp ${(val / 1e9).toFixed(1)} B`;
  }
  if (val >= 1e6) {
    return `Rp ${(val / 1e6).toFixed(1)} M`;
  }
  return `Rp ${val.toLocaleString("id-ID")}`;
}

export function formatStockPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || isNaN(price)) return "N/A";
  return `Rp ${price.toLocaleString("id-ID")}`;
}

export function formatPercent(val: number | null | undefined, decimals = 1): string {
  if (val === null || val === undefined || isNaN(val)) return "N/A";
  // Value is stored as decimal e.g. 0.224 -> 22.4%
  const pct = val * 100;
  return `${pct.toFixed(decimals)}%`;
}

export function formatMultiple(val: number | null | undefined, decimals = 2): string {
  if (val === null || val === undefined || isNaN(val)) return "N/A";
  return `${val.toFixed(decimals)}x`;
}

export function formatScore(val: number | null | undefined, decimals = 1): string {
  if (val === null || val === undefined || isNaN(val)) return "N/A";
  return val.toFixed(decimals);
}

export function formatPeerGap(val: number | null | undefined, decimals = 1): string {
  if (val === null || val === undefined || isNaN(val)) return "N/A";
  const sign = val > 0 ? "+" : "";
  return `${sign}${val.toFixed(decimals)}`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
