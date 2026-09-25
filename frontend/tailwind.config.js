/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E3A8A", // Deep blue
          light: "#2563EB",
          dark: "#172554",
        },
        accent: {
          DEFAULT: "#D97706", // Warm gold
          light: "#F59E0B",
          dark: "#B45309",
        },
        background: "#FAFAF9", // Off-white
        surface: "#FFFFFF",   // White
        "text-primary": "#0F172A",   // Near-black
        "text-secondary": "#64748B", // Gray
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        card: "0 10px 25px -5px rgba(15, 23, 42, 0.06), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 20px 40px -8px rgba(15, 23, 42, 0.12), 0 8px 16px -4px rgba(15, 23, 42, 0.06)",
      },
      fontWeight: {
        700: "700",
        800: "800",
      },
    },
  },
  plugins: [],
};

