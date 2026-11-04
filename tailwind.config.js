/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#080B12",
          surface: "#0D1320",
          elevated: "#111B2B",
          card: "#111B2B",
          hover: "#172338",
        },
        nexus: {
          cyan: "#49D9FF",
          blue: "#4B7BFF",
          safe: "#38D996",
          warning: "#FFB547",
          critical: "#FF4D67",
        },
        tx: {
          primary: "#EEF5FF",
          secondary: "#8795AA",
          muted: "#5B6A82",
        },
        border: {
          subtle: "#162338",
          DEFAULT: "#1F2C42",
          bright: "#2E4161",
        },
      },
      fontFamily: {
        sans: [
          "'Quicksand'",
          "'Nunito'",
          "ui-rounded",
          "'SF Pro Rounded'",
          "'Arial Rounded MT Bold'",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "Consolas", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(73, 217, 255, 0.25)",
        "glow-critical": "0 0 25px -5px rgba(255, 77, 103, 0.4)",
        "glow-warning": "0 0 20px -5px rgba(255, 181, 71, 0.3)",
        "glow-safe": "0 0 20px -5px rgba(56, 217, 150, 0.25)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        radar: "radar 4s linear infinite",
      },
      keyframes: {
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
