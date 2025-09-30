import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", ...fontFamily.sans],
      },

      /* Glow shadows — you can use `shadow-primary-glow` or `shadow-brand-glow` */
      boxShadow: {
        // uses CSS var for dynamic primary rgb (works with light/dark as you set --primary-rgb)
        "primary-glow":
          "0 10px 30px rgba(var(--primary-rgb) / 0.18), 0 0 40px rgba(var(--primary-rgb) / 0.10)",
        // static amber-based glow (fallback / explicit)
        "brand-glow":
          "0 10px 30px rgba(245,158,11,0.18), 0 0 40px rgba(245,158,11,0.08)",
      },

      colors: {
        /* BRAND = amber palette (tailwind amber) */
        brand: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b", // primary amber
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#4c2d07",
          glassmorphism: "rgba(16, 16, 18, 0.60)",
          glassmorphismlight: "rgba(255, 255, 255, 0.60)",
        },

        /* keep Discord stubs and others you had */
        "discord-background": "#36393f",
        "discord-brand-color": "#5865f2",
        "discord-gray": "#36393f",
        "discord-text": "#dcddde",
        "discord-timestamp": "#72767d",

        /* CSS-variable driven theme tokens (unchanged) */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        /* primary remains dynamic (keeps your theme variables working) */
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          // NOTE: we keep these present so `bg-primary` etc still work.
        },

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
