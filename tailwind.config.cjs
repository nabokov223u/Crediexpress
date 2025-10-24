module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { origin: "#1A0F50", modern: "#0763FD", trust: "#E7EAF1" },
      boxShadow: { soft: "0 8px 24px rgba(16, 24, 40, 0.08)" },
      borderRadius: { '2xl': '1rem' }
    },
  },
  plugins: [],
};
