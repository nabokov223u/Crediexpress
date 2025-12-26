module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        origin: "#1A0F50", // histórico: títulos destacados
        modern: "#2dd4bf", // acento secundario (teal)
        trust: "#E7EAF1",  // fondo suave
        brand: "#0d234a",  // acento principal (dark blue)
        ink: "#0f172a",    // texto principal (slate-900)
        muted: "#64748b",  // texto secundario (slate-500)
        surface: "#ffffff",
        background: "#f8fafc"
      },
      borderRadius: { "2xl": "1rem" },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Ubuntu", "Cantarell", "Noto Sans", "sans-serif"]
      }
    }
  },
  plugins: []
};
