/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'erha-blue': '#1e3a8a',
        'erha-green': '#059669',
        'erha-orange': '#ea580c',
        'safety-red': '#dc2626',
        'quality-purple': '#7c3aed'
      }
    },
  },
  plugins: [],
}
