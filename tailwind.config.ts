import type { Config } from "tailwindcss";

/**
 * Design tokens Soonly — dérivés directement de l'identité de marque.
 * deep teal #0D3B46 · soft teal #2BA39A · warm sand #E2C48B
 * off-white #F3F5F6 · charcoal #222B33
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F3F5F6",
        "bg-deep": "#EAEEEF",
        surface: "#FFFFFF",
        "surface-2": "#FAFBFB",
        ink: "#222B33",
        "ink-2": "#56666F",
        "ink-3": "#8A969E",
        teal: {
          DEFAULT: "#0D3B46",
          deep: "#092C35",
          soft: "#2BA39A",
          tint: "#E3EEEC",
          wash: "#EEF4F3",
        },
        sand: {
          DEFAULT: "#E2C48B",
          deep: "#B98F4A",
          ink: "#6F5424",
          tint: "#F6EEDC",
          wash: "#FAF5E9",
        },
        ok: { DEFAULT: "#1E7D64", tint: "#E1F0EA" },
        urgent: { DEFAULT: "#A8590E", tint: "#F9ECDB" },
        danger: { DEFAULT: "#B93A10", tint: "#F8E7DF" },
        line: "rgba(13,59,70,0.10)",
        "line-strong": "rgba(13,59,70,0.18)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        brand: ["var(--font-brand)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        sm: "9px",
        DEFAULT: "13px",
        lg: "18px",
        xl: "24px",
      },
      boxShadow: {
        s: "0 1px 2px rgba(13,59,70,.04),0 2px 10px rgba(13,59,70,.05)",
        m: "0 2px 6px rgba(13,59,70,.05),0 14px 34px rgba(13,59,70,.10)",
        l: "0 6px 18px rgba(13,59,70,.08),0 28px 60px rgba(13,59,70,.14)",
      },
      maxWidth: { content: "1180px" },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { "fade-up": "fade-up .5s ease both" },
    },
  },
  plugins: [],
};

export default config;
