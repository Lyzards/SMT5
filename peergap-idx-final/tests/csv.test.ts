import { describe, it, expect } from "vitest";
import { generatePeerGapCSV } from "../src/lib/export/csv";
import { processPeerUniverse } from "../src/lib/analytics/universe-engine";
import { DEMO_BANKING_FIXTURE } from "../src/lib/sectors/demo-fixture";

describe("CSV Export Generation", () => {
  it("generates structured CSV with headers, metadata, and banks", () => {
    const summary = processPeerUniverse(DEMO_BANKING_FIXTURE);
    const csv = generatePeerGapCSV({
      banks: summary.banks,
      weights: summary.weights,
      source: "Sectors Financial API v2",
      reportDate: "2024-12-31",
      priceDate: "2024-12-30",
      mode: "DEMO_FIXTURE",
    });

    expect(csv).toContain("# PeerGap IDX - Indonesian Banking Intelligence Export");
    expect(csv).toContain("# Applied Scoring Weights: ROE=50%, ROA=20%, CIR=30%");
    expect(csv).toContain("Rank,Ticker,Bank Name,ROE (%),ROE Percentile");
    expect(csv).toContain("BBCA.JK");
    expect(csv).toContain("BBRI.JK");
    expect(csv).toContain("BMRI.JK");
    expect(csv).toContain("BBNI.JK");
    expect(csv).toContain("BNGA.JK");
    expect(csv).toContain("MEGA.JK");
  });
});
