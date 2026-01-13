/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        // Legasi Theme Colors
        primary: "#E85D3F",           // Warm Orange
        background: "#FAF9F6",        // Cream/Off-white
        "text-main": "#1A1A1A",       // Dark Grey
        // Legacy support (will be migrated)
        "brand-orange": "#E85D3F",
        charcoal: "#1A1A1A",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 32px rgba(26, 26, 26, 0.08)",
      },
    },
  },
  plugins: [],
};

