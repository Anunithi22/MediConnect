/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5FAFF',
          100: '#E0F4FF',
          200: '#BFEAFF',
          300: '#99E0FF',
          400: '#66D5FF',
          500: '#33C9FF',
          600: '#00BFFF', // teal‑navy hybrid
          700: '#0099CC',
          800: '#007799',
          900: '#005566',
        },
        accent: {
          50: '#F0FDF7',
          100: '#CCF9E5',
          200: '#99F3CC',
          300: '#66EDB3',
          400: '#33E79A',
          500: '#00E181',
          600: '#00C76A',
          700: '#009952',
          800: '#006B3A',
          900: '#003D22',
        },
        surface: {
          background: '#F9FAFB', // light neutral page bg
          card: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.04)',
        modal: '0 4px 12px rgba(0,0,0,0.15)'
      },
      borderRadius: {
        DEFAULT: '0.5rem', // rounded‑lg everywhere
        xl: '0.75rem',
        '2xl': '1rem'
      }
    }
  },
  plugins: []
};
