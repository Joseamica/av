import type { Config } from 'tailwindcss'

const defaultTheme = require('tailwindcss/defaultTheme')

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      // sans: ['Matter', ...defaultTheme.fontFamily.sans],
      sans: ['Nunito Sans', ...defaultTheme.fontFamily.sans],
    },
    screens: {
      '2xl': { max: '1535px' },
      // => @media (max-width: 1535px) { ... }

      xl: { max: '1279px' },
      // => @media (max-width: 1279px) { ... }

      lg: { max: '1280px' }, // 1136 WEB
      // => @media (max-width: 1023px) { ... }

      md: { max: '425px' }, // 720 TABLET
      // => @media (max-width: 767px) { ... }

      sm: { max: '375px' }, // 312 MOBILE
      // => @media (max-width: 639px) { ... }
      xs: { max: '350px' }, // 312 MOBILE
      // => @media (max-width: 639px) { ... }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: {
          DEFAULT: 'hsl(var(--input))',
          invalid: 'hsl(var(--input-invalid))',
        },
        ring: {
          DEFAULT: 'hsl(var(--ring))',
          invalid: 'hsl(var(--foreground-danger))',
        },
        background: 'hsl(var(--background))',
        foreground: {
          DEFAULT: 'hsl(var(--foreground))',
          danger: 'hsl(var(--foreground-danger))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        night: {
          100: '#81819C',
          200: '#707089',
          300: '#5F5F76',
          400: '#4E4E62',
          500: '#3D3D4F',
          600: '#2C2C3B',
          700: '#1C1C28',
          // bg_principal: '#28293D',
          //temporal
          principal: '#1E1E20',

          // text_principal: 'white',
          text_secondary: '#5F5F76',
        },
        day: {
          100: '#F7F5FF',
          200: '#E4E4FB',
          300: '#DDDDF4',
          400: '#D0D0E8',
          500: '#9696E0',
          600: '#9999CC',
          700: '#6A44FF',
          bg_principal: 'white',
          principal: '#1E1E20',
        },
        button: {
          // primary: '#3E7BFA',
          primary: '#1E1E20',
          // outline: '#3E7BFA',
          outline: '#4E4E62',
          successBg: '#DBFAE3',
          successOutline: '#336B42',
          notSelected: '#ECECF1',
          textNotSelected: '#8E8EA0',
        },
        gray_light: '#EBECF1',
        warning: '#FF8080',
        disabled: '#9898A1',
        success: '#336B42',
        // accent: {
        //   purple: '#6A44FF',
        //   pink: '#F183FF',
        //   yellow: '#FFBE3F',
        //   'yellow-muted': '#FFD262',
        //   red: '#EF5A5A',
        // },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontSize: {
        // 1rem = 16px
        /** 80px size / 84px high / bold */
        mega: ['5rem', { lineHeight: '5.25rem', fontWeight: '700' }],
        /** 56px size / 62px high / bold */
        h1: ['3.5rem', { lineHeight: '3.875rem', fontWeight: '700' }],
        /** 40px size / 48px high / bold */
        h2: ['2.5rem', { lineHeight: '3rem', fontWeight: '700' }],
        /** 32px size / 36px high / bold */
        h3: ['2rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        /** 28px size / 36px high / bold */
        h4: ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        /** 24px size / 32px high / bold */
        h5: ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
        /** 16px size / 20px high / bold */
        h6: ['1rem', { lineHeight: '1.25rem', fontWeight: '700' }],

        /** 32px size / 36px high / normal */
        'body-2xl': ['2rem', { lineHeight: '2.25rem' }],
        /** 28px size / 36px high / normal */
        'body-xl': ['1.75rem', { lineHeight: '2.25rem' }],
        /** 24px size / 32px high / normal */
        'body-lg': ['1.5rem', { lineHeight: '2rem' }],
        /** 20px size / 28px high / normal */
        'body-md': ['1.25rem', { lineHeight: '1.75rem' }],
        /** 16px size / 20px high / normal */
        'body-sm': ['1rem', { lineHeight: '1.25rem' }],
        /** 14px size / 18px high / normal */
        'body-xs': ['0.875rem', { lineHeight: '1.125rem' }],
        /** 12px size / 16px high / normal */
        'body-2xs': ['0.75rem', { lineHeight: '1rem' }],

        /** 18px size / 24px high / semibold */
        caption: ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        /** 12px size / 16px high / bold */
        button: ['0.75rem', { lineHeight: '1rem', fontWeight: '700' }],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config
