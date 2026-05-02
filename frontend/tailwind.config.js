/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12211f',
        lagoon: '#0f766e',
        mango: '#f59e0b',
        paper: '#f4f6f5'
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 16px 40px rgba(23, 32, 31, 0.08)'
      }
    }
  },
  plugins: []
};
