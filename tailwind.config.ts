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
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        "bg-deep": "rgb(var(--c-bg-deep) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        "surface-2": "rgb(var(--c-surface-2) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        "ink-2": "rgb(var(--c-ink-2) / <alpha-value>)",
        "ink-3": "rgb(var(--c-ink-3) / <alpha-value>)",
        "on-teal": "rgb(var(--c-on-teal) / <alpha-value>)",
        teal: {
          DEFAULT: "rgb(var(--c-teal) / <alpha-value>)",
          deep: "rgb(var(--c-teal-deep) / <alpha-value>)",
          soft: "rgb(var(--c-teal-soft) / <alpha-value>)",
          tint: "rgb(var(--c-teal-tint) / <alpha-value>)",
          wash: "rgb(var(--c-teal-wash) / <alpha-value>)",
        },
        sand: {
          DEFAULT: "rgb(var(--c-sand) / <alpha-value>)",
          deep: "rgb(var(--c-sand-deep) / <alpha-value>)",
          ink: "rgb(var(--c-sand-ink) / <alpha-value>)",
          tint: "rgb(var(--c-sand-tint) / <alpha-value>)",
          wash: "rgb(var(--c-sand-wash) / <alpha-value>)",
        },
        ok: { DEFAULT: "rgb(var(--c-ok) / <alpha-value>)", tint: "rgb(var(--c-ok-tint) / <alpha-value>)" },
        urgent: { DEFAULT: "rgb(var(--c-urgent) / <alpha-value>)", tint: "rgb(var(--c-urgent-tint) / <alpha-value>)" },
        danger: { DEFAULT: "rgb(var(--c-danger) / <alpha-value>)", tint: "rgb(var(--c-danger-tint) / <alpha-value>)" },
        line: "var(--c-line)",
        "line-strong": "var(--c-line-strong)",
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
        s: "0 1px 2px rgba(13,59,70,.05),0 3px 8px -1px rgba(13,59,70,.06)",
        m: "0 2px 6px rgba(13,59,70,.05),0 10px 24px -4px rgba(13,59,70,.10),0 22px 48px -10px rgba(13,59,70,.08)",
        l: "0 4px 12px rgba(13,59,70,.06),0 18px 40px -8px rgba(13,59,70,.13),0 40px 84px -18px rgba(13,59,70,.18)",
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
