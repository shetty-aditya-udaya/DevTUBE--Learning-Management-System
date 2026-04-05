/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',   // Indigo core
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          purple: '#a855f7',
          cyan:   '#22d3ee',
          green:  '#4ade80',
          amber:  '#fbbf24',
        },
        dark: {
          950: '#030303',
          900: '#0a0a0a',
          800: '#111111',
          700: '#1a1a1a',
          600: '#222222',
          500: '#2e2e2e',
        }
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.05em',
      },
      boxShadow: {
        // Cinematic card glows
        'glow-brand':  '0 0 30px rgba(99, 102, 241, 0.25), 0 20px 60px rgba(0,0,0,0.6)',
        'glow-purple': '0 0 30px rgba(168, 85, 247, 0.25), 0 20px 60px rgba(0,0,0,0.6)',
        'glow-cyan':   '0 0 30px rgba(34, 211, 238, 0.2),  0 20px 60px rgba(0,0,0,0.6)',
        'glow-green':  '0 0 30px rgba(74, 222, 128, 0.2),  0 20px 60px rgba(0,0,0,0.6)',
        'glow-sm':     '0 0 15px rgba(99, 102, 241, 0.15)',
        'glass':       '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'cinematic':   '0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(99,102,241,0.1)',
      },
      backdropBlur: {
        'xs': '2px',
        '4xl': '72px',
        '5xl': '96px',
      },
      animation: {
        'shimmer':      'shimmer 2s linear infinite',
        'float':        'float 6s ease-in-out infinite',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
        'scan-line':    'scanLine 8s linear infinite',
        'slide-in-up':  'slideInUp 0.5s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '1' },
        },
        scanLine: {
          '0%':   { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        slideInUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'expo':   'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
