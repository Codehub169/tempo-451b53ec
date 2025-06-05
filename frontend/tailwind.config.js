/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#1A1A2E',
        'secondary-bg': '#2E3A4F',
        'accent': '#E94560',
        'text-light': '#E0E0E0',
        'text-medium': '#A0A0AB',
        'border-color': '#4A4A6A', // Named to avoid conflict with Tailwind's border utilities
        'success': '#66BB6A',
        'warning': '#FFA726',
        'error': '#EF5350',
      },
      fontFamily: {
        primary: ['Inter', 'sans-serif'],
        secondary: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '8px', // Default border radius from design system
      },
      boxShadow: {
        'DEFAULT': '0 4px 15px rgba(0, 0, 0, 0.2)', // Default shadow from design system
      }
    },
  },
  plugins: [],
}
