/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#0a0d14',
          card: '#121722',
          cardMuted: '#192030',
          border: '#242e42',
          accent: '#f59e0b', // Gold / Amber
          accentGlow: 'rgba(245, 158, 11, 0.25)',
          neonGreen: '#10b981',
          neonRed: '#ef4444',
          neonCyan: '#06b6d4',
          purple: '#8b5cf6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Montserrat', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(245, 158, 11, 0.8)' },
        },
        bidFlash: {
          '0%': { transform: 'scale(1)', backgroundColor: 'rgba(245, 158, 11, 0.3)' },
          '50%': { transform: 'scale(1.05)', backgroundColor: 'rgba(245, 158, 11, 0.6)' },
          '100%': { transform: 'scale(1)', backgroundColor: 'transparent' },
        },
        urgentTimer: {
          '0%, 100%': { color: '#ef4444', transform: 'scale(1)' },
          '50%': { color: '#ffffff', transform: 'scale(1.1)' }
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
        'bid-flash': 'bidFlash 0.6s ease-out',
        'urgent-timer': 'urgentTimer 0.6s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}
