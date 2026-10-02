/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: { DEFAULT: "#1479d1", dark: "#0b4f9c", light: "#e6f3fd" }, sky: { DEFAULT: "#38bdf8", soft: "#bae6fd" }, accent: "#38bdf8", ink: "#0f2340" },
      fontFamily: { sans: ["Poppins", "Noto Sans Devanagari", "system-ui", "sans-serif"], hero: ["Inter", "Noto Sans Devanagari", "system-ui", "sans-serif"], serif: ["Poppins", "Noto Sans Devanagari", "system-ui", "sans-serif"], quote: ["Lora", "Noto Sans Devanagari", "Georgia", "serif"] },
      maxWidth: { site: "1200px" }
    }
  },
  plugins: []
};
