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
        'iet-blue': '#1E3A8A',
        'davv-gold': '#F59E0B',
        'vibe-purple': '#8B5CF6'
      },
    },
  },
  plugins: [],
};
export default config;
