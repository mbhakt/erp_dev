module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: '#0f1724',      // dark navy
        accent: '#ff4169',       // pink-ish primary for +Add buttons
        accent2: '#4aa9ff',      // blue for Add Purchase (secondary)
        panel: '#f5f8fb',        // light panel bg
        border: '#e6eef6',       // panel border
        muted: '#7b8596'
      }
    },
  },
  plugins: [],
};
