import { describe, it, expect } from "vitest";
import {
  formatCurrencyIDR,
  formatPercent,
  formatMultiple,
  formatScore,
  formatPeerGap,
  formatStockPrice,
} from "../src/lib/formatters";

describe("Financial Formatters", () => {
  it("formats IDR trillions, billions, millions properly", () => {
    expect(formatCurrencyIDR(1226000000000000)).toBe("Rp 1226.0 T");
    expect(formatCurrencyIDR(450000000000)).toBe("Rp 450.0 B");
    expect(formatCurrencyIDR(25000000)).toBe("Rp 25.0 M");
    expect(formatCurrencyIDR(null)).toBe("N/A");
  });

  it("formats percentages from decimals", () => {
    expect(formatPercent(0.224)).toBe("22.4%");
    expect(formatPercent(0.038, 2)).toBe("3.80%");
    expect(formatPercent(null)).toBe("N/A");
  });

  it("formats multiples with x suffix", () => {
    expect(formatMultiple(4.75)).toBe("4.75x");
    expect(formatMultiple(0.82)).toBe("0.82x");
    expect(formatMultiple(null)).toBe("N/A");
  });

  it("formats scores cleanly", () => {
    expect(formatScore(78.45)).toBe("78.5");
    expect(formatScore(null)).toBe("N/A");
  });

  it("formats PeerGap with explicit + or - sign", () => {
    expect(formatPeerGap(32.4)).toBe("+32.4");
    expect(formatPeerGap(-18.7)).toBe("-18.7");
    expect(formatPeerGap(0)).toBe("0.0");
    expect(formatPeerGap(null)).toBe("N/A");
  });

  it("formats stock prices with IDR prefix", () => {
    expect(formatStockPrice(9950)).toBe("Rp 9.950");
    expect(formatStockPrice(null)).toBe("N/A");
  });
});
