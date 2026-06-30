import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211f",
        paper: "#fbfbf7",
        line: "#dfe5df",
        forest: "#246b55",
        mint: "#dcefe6",
        amber: "#f2b84b",
        coral: "#d66b5f"
      },
      boxShadow: {
        soft: "0 8px 24px rgba(23, 33, 31, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
