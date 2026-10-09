import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * Reel design system — "Projection Room".
 *
 * Colours are HSL channel triplets defined in src/index.css (one set for the dark "projection room"
 * theme, one for the light "program paper" theme) so every utility works with opacity modifiers.
 * See docs/DESIGN.md for the rationale and usage rules.
 */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    screens: {
      xs: "420px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        // Fraunces: titles, big numerals. Instrument Sans: interface. Plex Mono: film-credit data.
        display: ['"Fraunces Variable"', "Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ['"Instrument Sans Variable"', "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      fontSize: {
        // [size, { lineHeight, letterSpacing }]
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.04em" }],
        label: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.08em" }],
        "display-sm": ["2rem", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        display: ["2.75rem", { lineHeight: "1.04", letterSpacing: "-0.025em" }],
        "display-lg": ["4rem", { lineHeight: "1", letterSpacing: "-0.03em" }],
      },
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        "border-strong": "hsl(var(--border-strong) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        scrim: "hsl(var(--scrim) / <alpha-value>)",
        // Stacked surfaces: canvas < card (surface-1) < surface-2 < surface-3
        surface: {
          1: "hsl(var(--card) / <alpha-value>)",
          2: "hsl(var(--surface-2) / <alpha-value>)",
          3: "hsl(var(--surface-3) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        // The one brand accent: "signal" vermilion. Used for primary actions, focus and selection.
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          hover: "hsl(var(--primary-hover) / <alpha-value>)",
          subtle: "hsl(var(--primary-subtle) / <alpha-value>)",
          text: "hsl(var(--primary-text) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        subtle: "hsl(var(--subtle-foreground) / <alpha-value>)",
        // Neutral hover/selection fill (NOT a brand colour).
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          subtle: "hsl(var(--destructive-subtle) / <alpha-value>)",
          text: "hsl(var(--destructive-text) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          subtle: "hsl(var(--success-subtle) / <alpha-value>)",
          text: "hsl(var(--success-text) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)",
        },
        // Ratings (stars, scores) only. Never used for UI chrome.
        rating: "hsl(var(--rating) / <alpha-value>)",
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          subtle: "hsl(var(--warning-subtle) / <alpha-value>)",
          text: "hsl(var(--warning-text) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
        },
      },
      borderRadius: {
        // Squarer than a SaaS template on purpose: print and film-frame edges.
        sm: "0.25rem", // tags, ticket labels
        DEFAULT: "0.375rem",
        md: "0.375rem", // buttons, inputs
        lg: "0.625rem", // cards, panels, menus
        xl: "0.875rem", // dialogs, sheets
        poster: "0.375rem",
      },
      boxShadow: {
        // Dark theme leans on borders; shadows are for floating layers only.
        float: "0 12px 32px -8px hsl(var(--shadow) / 0.45), 0 2px 6px hsl(var(--shadow) / 0.25)",
        panel: "0 1px 0 hsl(var(--shadow) / 0.06), 0 6px 18px -10px hsl(var(--shadow) / 0.35)",
        poster: "0 10px 24px -12px hsl(var(--shadow) / 0.7), 0 2px 4px hsl(var(--shadow) / 0.35)",
      },
      maxWidth: {
        content: "88rem",
        prose: "42rem",
      },
      transitionTimingFunction: {
        // A quick start and a soft landing, like a projector shutter.
        snap: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      },
      transitionDuration: {
        fast: "120ms",
        base: "180ms",
        slow: "320ms",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-out": { from: { opacity: "1" }, to: { opacity: "0" } },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97) translateY(4px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "slide-up": { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        "slide-down": { from: { transform: "translateY(0)" }, to: { transform: "translateY(100%)" } },
        "slide-in-right": { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
        "slide-out-right": { from: { transform: "translateX(0)" }, to: { transform: "translateX(100%)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "check-draw": { from: { strokeDashoffset: "24" }, to: { strokeDashoffset: "0" } },
        "frame-pop": {
          "0%": { transform: "scale(0.85)" },
          "60%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 180ms cubic-bezier(0.2,0.7,0.2,1)",
        "fade-out": "fade-out 140ms ease-in",
        "scale-in": "scale-in 200ms cubic-bezier(0.2,0.7,0.2,1)",
        "slide-up": "slide-up 280ms cubic-bezier(0.2,0.7,0.2,1)",
        "slide-down": "slide-down 220ms ease-in",
        "slide-in-right": "slide-in-right 280ms cubic-bezier(0.2,0.7,0.2,1)",
        "slide-out-right": "slide-out-right 220ms ease-in",
        shimmer: "shimmer 1.8s linear infinite",
        "check-draw": "check-draw 240ms cubic-bezier(0.2,0.7,0.2,1) forwards",
        "frame-pop": "frame-pop 220ms cubic-bezier(0.2,0.7,0.2,1)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
