import type {Config} from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          100: '#DADADA',
          200: '#AAAAAA',
          300: '#717171',
          400: '#494949',
          500: '#1E1E20',
          600: '#141414',
          700: '#090909',
        },
        day: {
          100: '#F7F5FF',
          200: '#E4E4FB',
          300: '#DDDDF4',
          400: '#D0D0E8',
          500: '#9696E0',
          600: '#9999CC',
          700: '#6A44FF',
          principal: '#1E1E20',
        },
        warning: '#FF8080',
        accent: {
          purple: '#6A44FF',
          pink: '#F183FF',
          yellow: '#FFBE3F',
          'yellow-muted': '#FFD262',
          red: '#EF5A5A',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
