/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      colors: {
        'owo-pink': '#FFC0CB',
        'owo-purple': '#D1C4E9',
        'cowoncy-gold': '#FFD700',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-3px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(3px)' },
        },
        pulseLight: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        }
      },
      animation: {
        shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        pulseLight: 'pulseLight 2s infinite ease-in-out',
      }
    }
  },
  plugins: [],
}
