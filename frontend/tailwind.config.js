/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Bright, sharp corporate-blue brand ramp.
        brand: {
          50: "#eef6ff",
          100: "#d9ecff",
          200: "#b6d8ff",
          300: "#83bbff",
          400: "#4a97ff",
          500: "#1e7bff",
          600: "#0a63e6",
          700: "#0b4fbe",
          800: "#0f4197",
          900: "#123670",
        },
        // Sky/cyan accent for gradient pop and highlights.
        accent: {
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        "card-hover":
          "0 12px 28px -6px rgb(10 99 230 / 0.18), 0 8px 10px -6px rgb(10 99 230 / 0.10)",
        glow: "0 0 0 1px rgb(30 123 255 / 0.10), 0 14px 36px -8px rgb(30 123 255 / 0.40)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #0a63e6 0%, #1e7bff 55%, #38bdf8 100%)",
        "hero-grid":
          "radial-gradient(circle at 1px 1px, rgb(30 123 255 / 0.14) 1px, transparent 0)",
        // Soft page wash: pale blue tint fading to white.
        "app-wash":
          "radial-gradient(1100px 500px at 15% -10%, rgb(30 123 255 / 0.10), transparent 60%), radial-gradient(900px 500px at 100% 0%, rgb(56 189 248 / 0.10), transparent 55%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};
