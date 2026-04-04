import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ink: "#0f0f0f",
        paper: "#fdfdfc",
        stone: {
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          800: "#292524",
          900: "#1c1917"
        }
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-geist-sans)", "sans-serif"],
      }
    },
  },
  plugins: [],
};
export default config;
