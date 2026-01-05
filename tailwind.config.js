/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        "brand-orange": "#f97316",
        charcoal: "#1e293b",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 32px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

