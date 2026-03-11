import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "gaming-dark": "#0a0a1a",
        "gaming-card": "#12122a",
        "gaming-purple": "#7c3aed",
        "gaming-gold": "#f59e0b",
        "gaming-green": "#10b981",
        "gaming-red": "#ef4444",
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
