import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Semantic tokens keep the Tailwind API usable with opacity modifiers.
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        "primary-hover": "hsl(var(--primary-hover) / <alpha-value>)",
        "primary-active": "hsl(var(--primary-active) / <alpha-value>)",
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        "surface-raised": "hsl(var(--surface-raised) / <alpha-value>)",
        "foreground-subtle": "hsl(var(--foreground-subtle) / <alpha-value>)",
        link: "hsl(var(--link) / <alpha-value>)",
        overlay: "hsl(var(--overlay) / <alpha-value>)",
        success: {
          DEFAULT: "hsl(var(--status-success) / <alpha-value>)",
          foreground: "hsl(var(--status-success-foreground) / <alpha-value>)",
          border: "hsl(var(--status-success-border) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--status-warning) / <alpha-value>)",
          foreground: "hsl(var(--status-warning-foreground) / <alpha-value>)",
          border: "hsl(var(--status-warning-border) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "hsl(var(--status-danger) / <alpha-value>)",
          foreground: "hsl(var(--status-danger-foreground) / <alpha-value>)",
          border: "hsl(var(--status-danger-border) / <alpha-value>)",
        },
        info: {
          DEFAULT: "hsl(var(--status-info) / <alpha-value>)",
          foreground: "hsl(var(--status-info-foreground) / <alpha-value>)",
          border: "hsl(var(--status-info-border) / <alpha-value>)",
        },
        // Cores Light Corporate - Infinity Groups
        corporate: {
          white: "#FFFFFF",
          lightGray: "#F4F6F8",
          mediumGray: "#E5E7EB",
          border: "#D1D5DB",
          black: "#0F172A",
          textGray: "#475569",
          textLight: "#64748B",
          blue: "#1E40AF",
          blueLight: "#2563EB",
          blueHover: "#1D4ED8",
          blueBg: "#EFF6FF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        corporate: "12px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Hierarquia Enterprise
        "h1-enterprise": ["56px", { lineHeight: "1.1", fontWeight: "700" }],
        "h2-enterprise": ["48px", { lineHeight: "1.2", fontWeight: "600" }],
        "h3-enterprise": ["32px", { lineHeight: "1.3", fontWeight: "600" }],
        "h4-enterprise": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-enterprise": ["18px", { lineHeight: "1.7", fontWeight: "400" }],
        "body-sm": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
      },
      spacing: {
        // Espaçamento Enterprise (muito respiro)
        section: "120px",
        "section-sm": "96px",
        "section-xs": "64px",
        card: "32px",
        "card-sm": "24px",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      boxShadow: {
        corporate: "0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.06)",
        "corporate-lg": "0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)",
        "corporate-xl": "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 10px 10px -5px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
