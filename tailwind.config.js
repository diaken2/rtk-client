/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'rt-primary': '#7700FF',
        'rt-orange':  '#FF4F12',
        'rt-black':   '#101828',
        'rt-white':   '#FFFFFF',
        'rt-cta':     '#FF4D06',
        'rt-accent-blue': '#2B4FFF',
        'rt-gray-bg': '#F0F1F4',
        'rt-text':    '#1A1B22',
        'rt-disabled-bg':   '#F0F1F4',
        'rt-disabled-text': '#B3B3B3',
      },
      borderRadius: {
        'rt-btn':  '8px',
        'rt-card': '12px',
      },
      boxShadow: {
        'rt-card': '0px 4px 12px rgba(0,0,0,0.05)',
      },
      fontFamily: {
        sans: ['Rostelecom Basis', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
