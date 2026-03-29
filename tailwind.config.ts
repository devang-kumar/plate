import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          red: "#e53935",
          dark: "#c62828",
        },
        bg: {
          gray: "#f4f4f4",
          dark: "#2c3e50",
        }
      },
    },
  },
  plugins: [],
};
export default config;
