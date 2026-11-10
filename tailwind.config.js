/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: { DEFAULT: '#14142B', soft: '#4E4B66', muted: '#6E7191' },
        paper: '#FAFAF7',
        line: '#E9E8F0',
        eletric: { 50: '#EEF3FF', 100: '#DCE6FF', 500: '#2F6BFF', 600: '#1F55E0', 700: '#1742B3' },
        grape: { 50: '#F4EFFF', 100: '#E8DDFF', 500: '#7C4DFF', 600: '#6634F0', 700: '#5223C9' },
        tang: { 50: '#FFF3EB', 100: '#FFE3CF', 500: '#FF7A1A', 600: '#E9630A', 700: '#B84D06' },
        sun: { 50: '#FFFAE6', 100: '#FFF1B8', 400: '#FFD23F', 500: '#F5B800', 700: '#8F6A00' },
        leaf: { 50: '#EAFBF2', 100: '#CDF5E0', 500: '#14B86A', 600: '#0E9A58', 700: '#0B7343' },
        bubble: { 50: '#FFEEF6', 100: '#FFD6EA', 500: '#F0468F', 600: '#D62F78', 700: '#A81F5C' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,20,43,.04), 0 8px 24px -12px rgba(20,20,43,.12)',
        lift: '0 2px 4px rgba(20,20,43,.05), 0 18px 40px -16px rgba(20,20,43,.22)',
      },
      borderRadius: { '4xl': '2rem' },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        fadeup: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        spin_slow: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        fadeup: 'fadeup .45s ease-out both',
        spin_slow: 'spin_slow 18s linear infinite',
      },
    },
  },
  plugins: [],
};
