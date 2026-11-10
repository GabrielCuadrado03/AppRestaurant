/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F0F5F2',
          100: '#DCE8E2',
          200: '#B8D1C5',
          300: '#8FB5A3',
          400: '#5C917A',
          500: '#356E56',
          600: '#1B523E',
          700: '#0B3E2D',
          800: '#033225', // Verde Oficial Brandbook (#033225)
          900: '#02241A',
          950: '#011710',
        },
        sand: {
          50: '#FCFBF9',
          100: '#F7F5F0',
          200: '#ECE8DF',
          300: '#DCD7CD', // Beige Oficial Brandbook (#DCD7CD)
          400: '#C7C0B2',
          500: '#A9A090',
          600: '#877E6F',
          700: '#675F52',
          800: '#474137',
          900: '#2A261F',
        },
        carbon: {
          DEFAULT: '#020202', // Negro Oficial Brandbook (#020202)
          50: '#F5F5F5',
          100: '#E5E5E5',
          800: '#1E1E1E',
          900: '#0F0F0F',
          950: '#020202',
        },
        terracotta: {
          DEFAULT: '#4A2016', // Café tostado profundo
          light: '#6E3224',
          dark: '#35160E',
        },
        brand: {
          primary: 'var(--brand-primary, #033225)',
          accent: 'var(--brand-accent, #DCD7CD)',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
