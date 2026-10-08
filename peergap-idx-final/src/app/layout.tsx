import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PeerGap IDX — Indonesian Banking Equity Intelligence",
  description:
    "Identifies and explains discrepancies between the fundamental quality of Indonesian listed banks and their relative market valuation (P/B).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground min-h-screen selection:bg-blue/30 selection:text-foreground">
        {children}
      </body>
    </html>
  );
}
