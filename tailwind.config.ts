import type {Config} from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          100: '#81819C',
          200: '#707089',
          300: '#5F5F76',
          400: '#4E4E62',
          500: '#3D3D4F',
          600: '#2C2C3B',
          700: '#1C1C28',
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
        button: {
          primary: '#3E7BFA',
          outline: '#3568D4',
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
