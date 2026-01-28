/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        // Aegis Chain Lavender Theme
        primary: {
          light: '#ede9fe', // Light Lavender
          DEFAULT: '#a78bfa', // Soft Lavender
          dark: '#7c3aed', // Deep Violet
        },
        secondary: {
          light: '#f3f0ff', // Pale Lavender
          DEFAULT: '#c4b5fd', // Muted Violet
          dark: '#6d28d9', // Strong Violet
        },
        background: {
          DEFAULT: '#f9fafb', // Clean, ultra-light
          glass: 'rgba(243, 240, 255, 0.7)', // Glassmorphism
        },
        'text-main': '#1e293b', // Slate for readability
        accent: '#a78bfa',
        // Remove legacy/old theme colors
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

