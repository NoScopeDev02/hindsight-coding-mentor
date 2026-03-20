/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        hindsight: {
          green: '#10b981',
        }
      },
      boxShadow: {
        'glow-green': '0 0 10px #10b981, 0 0 20px #10b981',
      }
    },
  },
  plugins: [],
}
