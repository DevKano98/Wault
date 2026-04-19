/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#6B46C1',
        success: '#0F766E',
        warning: '#D97706',
        danger: '#B91C1C',
        page: '#F9FAFB',
        surface: '#FFFFFF',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.08)',
      },
    },
  },
  plugins: [],
};
