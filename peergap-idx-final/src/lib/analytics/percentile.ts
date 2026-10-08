/**
 * PeerGap IDX - Percentile Normalization Engine
 * 
 * Implements exact percentile ranking with average-rank tie handling,
 * direction inversion (for Cost-to-Income Ratio), identical-value handling,
 * and minimum peer threshold enforcement (>= 4 banks).
 */

export interface RankItem {
  id: string;
  value: number | null;
}

export interface PercentileRankOptions {
  higherIsBetter?: boolean;
  minValidCount?: number;
}

/**
 * Computes peer-relative percentile ranks (0 - 100) using average ranks for ties.
 * 
 * Formula:
 * Percentile = 100 * (avgRank - 1) / (N - 1)
 * 
 * For higherIsBetter = true:
 * - Lowest value gets percentile 0
 * - Highest value gets percentile 100
 * 
 * For higherIsBetter = false (e.g. CIR):
 * - Lowest value gets percentile 100 (best efficiency)
 * - Highest value gets percentile 0
 * 
 * Special conditions:
 * - If valid count < minValidCount (default 4): all return null
 * - If all valid values are identical: all return 50.0
 * - Null/NaN/Infinity values receive null percentile
 */
export function calculatePercentileRanks(
  items: RankItem[],
  options: PercentileRankOptions = {}
): Map<string, number | null> {
  const higherIsBetter = options.higherIsBetter !== false;
  const minValidCount = options.minValidCount ?? 4;

  const result = new Map<string, number | null>();

  // Filter valid numbers
  const validItems = items.filter(
    (item) => item.value !== null && !isNaN(item.value) && isFinite(item.value)
  );

  // Initialize all items to null
  for (const item of items) {
    result.set(item.id, null);
  }

  const N = validItems.length;
  if (N < minValidCount) {
    return result;
  }

  // Check if all observations are identical
  const firstVal = validItems[0].value!;
  const allIdentical = validItems.every((item) => Math.abs(item.value! - firstVal) < 1e-9);
  if (allIdentical) {
    for (const item of validItems) {
      result.set(item.id, 50.0);
    }
    return result;
  }

  // Sort ascending by value
  const sorted = [...validItems].sort((a, b) => a.value! - b.value!);

  // Group into ties to assign average ascending ranks (1-indexed)
  let i = 0;
  const ascendingAvgRanks = new Map<string, number>();

  while (i < N) {
    let j = i;
    while (j < N && Math.abs(sorted[j].value! - sorted[i].value!) < 1e-9) {
      j++;
    }
    // Items from index i to j-1 are tied
    // 1-indexed positions are (i + 1) to j
    const count = j - i;
    // Sum of arithmetic progression from (i + 1) to j is:
    // (count * ( (i + 1) + j )) / 2
    const sumOfRanks = (count * (i + 1 + j)) / 2;
    const avgRank = sumOfRanks / count;

    for (let k = i; k < j; k++) {
      ascendingAvgRanks.set(sorted[k].id, avgRank);
    }

    i = j;
  }

  // Calculate percentiles
  for (const item of validItems) {
    const ascRank = ascendingAvgRanks.get(item.id)!;
    let rankToUse = ascRank;

    if (!higherIsBetter) {
      // Invert rank: lowest value gets top rank
      rankToUse = N - ascRank + 1;
    }

    const percentile = (100 * (rankToUse - 1)) / (N - 1);
    // Round to 4 decimal places for floating-point cleanliness
    const rounded = Math.round(percentile * 10000) / 10000;
    result.set(item.id, rounded);
  }

  return result;
}
