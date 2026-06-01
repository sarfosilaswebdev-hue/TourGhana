/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0F0D",
        surface: "#111A16",
        border: "#1E2D25",
        primary: "#22C55E",
        secondary: "#F59E0B",
        foreground: "#F0FDF4",
        muted: "#6B7280",
      },
    },
  },
  plugins: [],
}

