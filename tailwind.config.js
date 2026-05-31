/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gryt: {
          black: '#0A0A0A',
          ink: '#121212',
          panel: '#161616',
          line: '#262626',
          light: '#8CC8F0', // light blue accent
          blue: '#4682B4', // dark blue secondary
          mute: '#8A8A8A',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Oswald', 'Impact', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Roboto Mono"', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        glowIn: {
          '0%': { opacity: '0', transform: 'translateX(24px)', boxShadow: '0 0 0 rgba(140,200,240,0)' },
          '40%': { opacity: '1', boxShadow: '0 0 28px rgba(140,200,240,0.55)' },
          '100%': { opacity: '1', transform: 'translateX(0)', boxShadow: '0 0 0 rgba(140,200,240,0)' },
        },
        tapFlash: {
          '0%': { backgroundColor: 'rgba(140,200,240,0.0)' },
          '20%': { backgroundColor: 'rgba(140,200,240,0.35)' },
          '100%': { backgroundColor: 'rgba(140,200,240,0.0)' },
        },
        pulseClock: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.78' },
        },
      },
      animation: {
        glowIn: 'glowIn 0.9s ease-out',
        tapFlash: 'tapFlash 0.45s ease-out',
        pulseClock: 'pulseClock 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
