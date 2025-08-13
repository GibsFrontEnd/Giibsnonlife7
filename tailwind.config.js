 /** @type {import('tailwindcss').Config} */
export default {
   content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
   theme: {
     extend: {
      colors: {
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        background: "#ffffff",
        foreground: "#020817",
        border: "#e4e8ef",
        input: "#e4e8ef",
        ring: "#3b82f6",
        primary: {
          DEFAULT: "#8B4B8C",
          blue: "#8B4B8C",
          foreground: "#ffffff",
        },
        neutral: {
          gray: "#666",
          placeholder: "#999",
        },
        secondary: {
          DEFAULT: "#f0f0ff",
          foreground: "#1e293b",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#f8fafc",
        },
        success: {
          DEFAULT: "#22c55e",
          foreground: "#f8fafc",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#f8fafc",
        },
        info: {
          DEFAULT: "#8B4B8C",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#f1f5f9",
          foreground: "#1e293b",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#020817",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#020817",
        },
        input: {
          DEFAULT: "#BFBFBF"
        }
      },
      boxShadow: {
        tableShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
     },
   },
   plugins: [],
 }