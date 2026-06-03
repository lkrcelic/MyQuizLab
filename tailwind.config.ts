import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0F1117",
          secondary: "#1A1D27",
          tertiary: "#242736",
          elevated: "#2A2D3A",
        },
        accent: {
          DEFAULT: "#6C5CE7",
          hover: "#7C6FF0",
          muted: "rgba(108, 92, 231, 0.15)",
        },
        success: {
          DEFAULT: "#00C48C",
          muted: "rgba(0, 196, 140, 0.15)",
        },
        error: {
          DEFAULT: "#FF6B6B",
          muted: "rgba(255, 107, 107, 0.15)",
        },
        text: {
          primary: "#F1F2F6",
          secondary: "#A0A3B1",
          muted: "#6B6E7B",
        },
        border: {
          DEFAULT: "#2E3142",
          active: "#6C5CE7",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.15s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
