import type { Config } from "tailwindcss";

// ---- Design tokens -------------------------------------------------------
// Palette is built around an instrument-cluster theme: near-black dash,
// amber gauge needle for the "primary" accent, teal for efficient/good
// readings, red-orange for inefficient/costly readings.
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dash: {
          bg: "#0B0E11",       // instrument cluster black
          surface: "#12161B",  // card surface
          raised: "#1B2129",   // elevated card / hover
          line: "#242B33",     // hairline borders
          muted: "#828C99",    // secondary text
          text: "#E9EDF1",     // primary text
        },
        gauge: {
          amber: "#F5A623",    // needle / primary accent
          amberDim: "#8A611C",
          teal: "#22C7A9",     // good efficiency
          red: "#FF5C5C",      // poor efficiency / overspend
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
      keyframes: {
        needle: {
          "0%": { transform: "rotate(-90deg)" },
          "100%": { transform: "rotate(var(--needle-angle))" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        needle: "needle 0.9s cubic-bezier(0.22,1,0.36,1) forwards",
        rise: "rise 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
