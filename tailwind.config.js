/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#2563eb", 50: "#eff6ff", 100: "#dbeafe" },
        surface: "#ffffff",
      },
    },
  },
  plugins: [],
};
