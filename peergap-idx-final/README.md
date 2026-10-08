# PeerGap IDX — Indonesian Banking Intelligence Platform

> **Find the gap. Understand the value.**  
> Built for the **Sectors Hackathon — Track 03: Market Intelligence**  
> Primary Market: Indonesia Stock Exchange (IDX) • Initial Sector: Commercial Banking

---

## 1. Executive Summary

**PeerGap IDX** is an institutional-grade financial intelligence platform that discovers and transparently explains discrepancies between the **fundamental operating quality** of Indonesian listed banks and their **relative market valuation** (Price-to-Book multiple).

Rather than overwhelming equity analysts and retail investors with disconnected raw statistics, PeerGap normalizes multi-factor operational performance across an explicit peer group and compares it against market multiples to produce an explainable **PeerGap Divergence Score** (−100 to +100).

---

## 2. Peer Universe & Target Coverage

The initial MVP targets the top six commercial banking franchises on the Indonesia Stock Exchange:

| Ticker | Full Entity Name | Market Cap (IDR) | Primary Focus |
|---|---|---|---|
| **BBCA** (BBCA.JK) | PT Bank Central Asia Tbk. | ~Rp 1,226 T | Private Commercial, Transactional Banking, Low CIR |
| **BBRI** (BBRI.JK) | PT Bank Rakyat Indonesia (Persero) Tbk. | ~Rp 682 T | State-Owned, Micro & Ultra-Micro Lending |
| **BMRI** (BMRI.JK) | PT Bank Mandiri (Persero) Tbk. | ~Rp 616 T | State-Owned, Corporate, Wholesale & Commercial |
| **BBNI** (BBNI.JK) | PT Bank Negara Indonesia (Persero) Tbk. | ~Rp 198 T | State-Owned, Enterprise, International Business |
| **BNGA** (BNGA.JK) | PT Bank CIMB Niaga Tbk. | ~Rp 48 T | Private Commercial, Consumer & Retail |
| **MEGA** (MEGA.JK) | PT Bank Mega Tbk. | ~Rp 41 T | Private Commercial, CT Corp Ecosystem |

---

## 3. The PeerGap Analytical Methodology

### 3.1 Fundamental Variables
1. **Return on Equity (ROE):** Compounding capability relative to shareholder equity ($Net Income / Total Equity$). Higher is better.
2. **Return on Assets (ROA):** Asset utilization efficiency across total earning and non-earning assets ($Net Income / Total Assets$). Higher is better.
3. **Cost-to-Income Ratio (CIR):** Operating overhead relative to operating revenue ($Operating Expenses / Operating Income$). In banking, lower overhead is superior; hence, **lower CIR receives a higher percentile rank (Inverted)**.
4. **Price-to-Book Ratio (P/B):** Relative equity valuation multiple ($Market Capitalization / Book Equity$).

### 3.2 Percentile Normalization
Normalized across the peer group ($N \ge 4$) using average-rank tie handling:
$$\text{Percentile} = 100 \times \frac{\text{Average Ascending Rank} - 1}{N - 1}$$

For **Cost-to-Income Ratio (CIR)**, the rank is inverted:
$$\text{Inverted Rank} = N - \text{Average Ascending Rank} + 1$$
$$\text{CIR Percentile} = 100 \times \frac{\text{Inverted Rank} - 1}{N - 1}$$

### 3.3 Composite Fundamental Quality Score (0–100)
$$\text{Quality Score} = (0.50 \times \text{ROE \%ile}) + (0.20 \times \text{ROA \%ile}) + (0.30 \times \text{CIR \%ile})$$
*(Weights are fully adjustable in the Weight Settings panel and immediately recompute rankings in real time).*

### 3.4 Valuation Percentile
Positive, valid P/B ratios are ranked in ascending order. Non-positive or non-finite P/B multiples are excluded from ranking.

### 3.5 PeerGap Divergence Score (−100 to +100)
$$\text{PeerGap Score} = \text{Quality Score} - \text{Valuation Percentile (P/B)}$$

- **Positive PeerGap (+5 to +100):** Operating quality rank exceeds relative market multiple rank. Indicates operating execution positioned ahead of multiple valuation.
- **Aligned PeerGap (−5 < score < +5):** Fundamental performance and market multiple percentiles are well matched; the ±5 endpoints are moderate gaps.
- **Negative PeerGap (−100 to −5):** Valuation multiple rank exceeds fundamental quality score, reflecting a valuation premium.

---

## 4. Key Platform Features

1. **Overview Dashboard:**
   - Summary cards: Universe coverage, Highest Quality Bank, Largest Positive Gap, Largest Negative Gap.
   - **Interactive Quality vs. Valuation Matrix:** Scatter plot with quadrant benchmarks, median reference lines, tooltips, and market-cap point sizing.
   - **Leaderboard:** Direct rank breakdown by PeerGap divergence.
2. **Financial Screener:**
   - Multi-column sortable table (ROE, ROA, CIR, P/B, Quality Score, PeerGap).
   - Instant search by ticker or company name.
   - Minimum Quality Score slider and Gap category filters.
   - One-click **RFC 4180 CSV Export** with applied weights and provenance.
   - Local browser **Watchlist** bookmarking.
3. **Peer Compare:**
   - Side-by-side selection of 2 to 4 banks.
   - Grouped bar chart comparing ROE, ROA, and CIR.
   - Stacked factor decomposition visualizing point contributions.
   - Rule-based deterministic synthesis highlighting key operational divergences.
4. **Company Detail Analysis:**
   - Complete factor contribution breakdown.
   - Comparison against peer median.
   - Deterministic rule-based explanation narrative (zero LLM hallucinations).
   - Analytical risk and credit quality disclosure.
5. **Adjustable Weight Settings:**
   - Interactive weight sliders (ROE, ROA, CIR).
   - Real-time 100% sum validation.
   - Recalculates ranking across all tabs while server-cached fundamentals remain within their TTL.
6. **Data Provenance & Sectors API Integration:**
   - Server-side integration with **Sectors Financial API v2** (`https://api.sectors.app/v2/`).
   - In-memory and framework fetch caches with a configurable TTL to conserve API quota.
   - A manual live refresh bypasses cached provider responses and is limited to once per minute per server instance; a cold or forced live fetch requests six company reports.
   - **Benchmark Fixture Mode** is used offline or when no API key is configured. Failed live symbols are excluded, never replaced with fixture financials.
   - Live rankings use the latest annual reporting year available to at least four banks; financial ratios and annual P/B are matched to that year.

---

## 5. Technology Stack

- **Frontend & App Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling & Tokens:** Tailwind CSS, Institutional Dark Theme (`#0B1115` base)
- **Visualizations:** Recharts (ScatterChart, BarChart, ReferenceLines)
- **Icons:** Lucide React
- **Testing:** Vitest (37 unit tests across analytics, normalizers, live data handling, formatters, export)

---

## 6. Windows-Friendly Setup & Local Run

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### Installation & Run

1. Open PowerShell and navigate to the project directory:
   ```powershell
   cd C:\Users\ASUS\.gemini\antigravity\scratch\peergap-idx
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. (Optional) Configure Sectors API key:
   Copy `.env.example` to `.env.local` and add your Sectors API key:
   ```powershell
   Copy-Item .env.example .env.local
   # Edit .env.local and set SECTORS_API_KEY=your_key_here
   ```
   *Note: If `SECTORS_API_KEY` is not provided, the application runs in Benchmark Fixture Mode, using verified audited Indonesian banking data.*

4. Run the development server:
   ```powershell
   npm run dev
   ```
   Or run the production build:
   ```powershell
   npm run build
   npm start
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 7. Running Unit Tests

Run all Vitest test suites:
```powershell
npm test
```
Result: 37 passing tests covering percentile ranking, tie handling, CIR inversion, weight validation, Quality Score, PeerGap Score, period alignment, live API failures, cache behavior, normalizer, and CSV export.

---

## 8. Known Limitations & Roadmap

- **Universe Scope:** MVP focuses on the 6 commercial banks. Extending to all 48 IDX-listed banks is supported by the architecture and planned for future iterations.
- **Credit Risk Factors:** Non-Performing Loans (NPL), loan loss provisions, and Capital Adequacy Ratios (CAR) are reported in the detailed view but not included in the 3-factor Quality formula to preserve simplicity.
- **Descriptive Framework:** PeerGap is a relative ranking methodology, not an intrinsic discounted-cash-flow (DCF) valuation model. Never use PeerGap as automated trading advice.
