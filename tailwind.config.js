/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        teko: ['Teko', 'sans-serif'],
      },
      colors: {
        pubg: {
          green: '#4A5D23',
          yellow: '#FFB800',
          red: '#E53E3E',
          cyan: '#00F0FF',
          dark: '#0A0A0B',
          gray: '#1C1C1E',
        }
      }
    },
  },
  plugins: [],
}
