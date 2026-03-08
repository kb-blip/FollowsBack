/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./views/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Apple-style system font stack
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        mono: [
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace'
        ],
      },
      boxShadow: {
        'apple': '0 4px 24px rgba(0, 0, 0, 0.04)',
        'apple-hover': '0 10px 40px rgba(0, 0, 0, 0.08)',
      },
      colors: {
        apple: {
          bg: '#FBFBFD', // The classic Mac/iPad light gray background
          card: '#FFFFFF',
          border: '#E5E5EA',
          text: '#1D1D1F',
          muted: '#86868B',
          blue: '#0071E3', // Apple Accent Blue
          rose: '#FF3B30', // Apple Destructive Red/Rose
        }
      }
    },
  },
  plugins: [],
}