import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#16a34a",
          dark: "#15803d",
          hover: "#22c55e",
          light: "#dcfce7",
          muted: "#86efac",
        },
        violated: {
          DEFAULT: "#dc2626",
          bg: "#fef2f2",
          border: "#fca5a5",
        },
        "not-violated": {
          DEFAULT: "#16a34a",
          bg: "#f0fdf4",
          border: "#86efac",
        },
        sev: {
          high: "#dc2626",
          "high-bg": "#fef2f2",
          medium: "#d97706",
          "medium-bg": "#fffbeb",
          low: "#2563eb",
          "low-bg": "#eff6ff",
        },
        page: "#f8fafc",
        surface: "#ffffff",
        subtle: "#f1f5f9",
        muted: "#e2e8f0",
      },
      fontFamily: {
        ui: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        md: "0 2px 8px rgba(0,0,0,0.08)",
        lg: "0 4px 16px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
