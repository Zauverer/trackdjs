import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./data/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#050505",
        panel: "#111111",
        ink: "#F5F5F5",
        muted: "#A3A3A3",
        neon: "#B026FF",
        cyan: "#00E5FF",
        pulse: "#FF2E88",
        success: "#39FF88"
      },
      boxShadow: {
        glow: "0 0 30px rgba(176, 38, 255, 0.28)",
        cyan: "0 0 30px rgba(0, 229, 255, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
