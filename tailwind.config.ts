import type { Config } from "tailwindcss";

/**
 * TrackDJs design tokens — Hybrid Premium.
 *
 * Colour roles are deliberate and narrow:
 *   warm     → primary action (a single solid button per screen)
 *   amber    → state and data only ("Voy", Raver Heart, live figures). Never a button.
 *   match    → agreement with a friend
 *   alert    → schedule conflict and errors
 * Stage colours stay in STAGE_META as metadata: 3px rule, 6px dot, or 12% tint. Never a surface.
 *
 * Legacy tokens (void/panel/ink/muted/neon/cyan/pulse/success/glow) are kept at their
 * original values on purpose: 50+ files under /app still reference them and this PR
 * must not restyle the secondary app. They are retired in P2-1.
 */
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./data/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        carbon: "#0B0B0C",
        surface: "#141416",
        raised: "#1B1C1F",
        warm: "#F3F0EA",
        "warm-dim": "#B6B1A8",
        "warm-faint": "#7E7A73",
        "on-action": "#14110C",
        amber: "#E0A355",
        "amber-ink": "#1A1206",
        match: "#7E9C86",
        alert: "#C9705C",

        // Legacy — do not use in new code.
        void: "#050505",
        panel: "#111111",
        ink: "#F5F5F5",
        muted: "#A3A3A3",
        neon: "#B026FF",
        cyan: "#00E5FF",
        pulse: "#FF2E88",
        success: "#39FF88"
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"]
      },
      fontSize: {
        label: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.08em" }]
      },
      borderRadius: {
        chip: "4px",
        control: "8px",
        card: "12px",
        sheet: "16px"
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(.2,.6,.2,1)"
      },
      transitionDuration: {
        state: "120ms",
        enter: "200ms",
        sheet: "320ms"
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
