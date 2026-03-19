/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0A1628',
          800: '#1E293B',
          700: '#334155',
        },
        neon: {
          purple: '#8B5CF6',
          blue: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-bg': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      },
    },
  },
  plugins: [],
}
