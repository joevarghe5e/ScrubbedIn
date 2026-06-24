import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          500: '#1B2B6B',
          600: '#16245A',
          700: '#111C47',
          900: '#0B1230',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
