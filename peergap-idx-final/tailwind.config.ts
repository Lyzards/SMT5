import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0B1115",
          surface: "#101A22",
          elevated: "#16232D",
          hover: "#1C2B36",
        },
        border: {
          DEFAULT: "#263541",
          subtle: "#1C2A35",
          bright: "#384B5B",
        },
        foreground: {
          DEFAULT: "#EAF0F4",
          muted: "#93A4AF",
          subtle: "#627584",
        },
        emerald: {
          DEFAULT: "#22C55E",
          hover: "#16A34A",
          muted: "rgba(34, 197, 94, 0.15)",
        },
        blue: {
          DEFAULT: "#3B82F6",
          hover: "#2563EB",
          muted: "rgba(59, 130, 246, 0.15)",
        },
        accent: {
          positive: "#16A34A",
          negative: "#EF4444",
          warning: "#F59E0B",
          neutral: "#93A4AF",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
