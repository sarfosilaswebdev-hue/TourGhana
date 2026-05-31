/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        regular: ["PoppinsRegular"],
        popBold: ["PoppinsBold"],
        popSb: ["PoppinsSemiBold"],
      },
      colors: {
        // Primary and secondary stay as literal values — they don't change per theme
        primary: {
          DEFAULT: "#1F7A63",
          50: "#E6F4F1",
          100: "#CDE9E3",
          200: "#9BD3C7",
          300: "#69BDAB",
          400: "#37A78F",
          500: "#1F7A63",
          600: "#18604F",
          700: "#12463B",
          800: "#0C2D27",
          900: "#061613",
        },
        secondary: {
          DEFAULT: "#F2C94C",
          50: "#FFF8E1",
          100: "#FDEFC3",
          200: "#FBE18A",
          300: "#F8D451",
          400: "#F5C61F",
          500: "#F2C94C",
          600: "#C79E2E",
          700: "#9C741F",
          800: "#6F4F14",
          900: "#3A280A",
        },
        // Semantic tokens driven by CSS variables injected by ThemeProvider
        background: "var(--background)",
        surface: "var(--surface)",
        dark: "var(--text-dark)",
        muted: "var(--muted)",
        // Static tokens
        accent: "#56CCF2",
        error: "#EF4444",
        success: "#10B981",
      },
    },
  },
  plugins: [],
};
