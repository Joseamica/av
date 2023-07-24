const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Matter", ...defaultTheme.fontFamily.sans],
    },
    screens: {
      "2xl": { max: "1535px" },
      // => @media (max-width: 1535px) { ... }

      xl: { max: "1279px" },
      // => @media (max-width: 1279px) { ... }

      lg: { max: "1280px" }, // 1136 WEB
      // => @media (max-width: 1023px) { ... }

      md: { max: "425px" }, // 720 TABLET
      // => @media (max-width: 767px) { ... }

      sm: { max: "375px" }, // 312 MOBILE
      // => @media (max-width: 639px) { ... }
      xs: { max: "350px" }, // 312 MOBILE
      // => @media (max-width: 639px) { ... }
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // CUSTOM
        night: {
          100: "#81819C",
          200: "#707089",
          300: "#5F5F76",
          400: "#4E4E62",
          500: "#3D3D4F",
          600: "#2C2C3B",
          700: "#1C1C28",
          // bg_principal: '#28293D',
          //temporal
          principal: "#1E1E20",

          // text_principal: 'white',
          text_secondary: "#5F5F76",
        },
        day: {
          100: "#F7F5FF",
          200: "#E4E4FB",
          300: "#DDDDF4",
          400: "#D0D0E8",
          500: "#9696E0",
          600: "#9999CC",
          700: "#6A44FF",
          bg_principal: "white",
          principal: "#1E1E20",
        },
        button: {
          // primary: '#3E7BFA',
          primary: "#1E1E20",
          // outline: '#3E7BFA',
          outline: "#4E4E62",
          successBg: "#DBFAE3",
          notSelected: "#ECECF1",
          textNotSelected: "#8E8EA0",
        },
        gray_light: "#EBECF1",
        warning: "#FF8080",
        disabled: "#9898A1",
        success: "#336B42",
        accent: {
          purple: "#6A44FF",
          pink: "#F183FF",
          yellow: "#FFBE3F",
          "yellow-muted": "#FFD262",
          red: "#EF5A5A",
        },

        // LIBRARY
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
