/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        error: '#ef4444',
        success: '#22c55e',
        background: '#ffffff',
        text: '#1e293b',
        border: '#e2e8f0',
        'hover-primary': '#1d4ed8',
        'hover-secondary': '#475569',
        disabled: '#94a3b8',
        teal: '#2dd4bf',
        'teal-hover': '#14b8a6',
        brand: {
          primary: '#4ECDC4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        base: '16px',
        small: '14px',
        large: '18px',
        heading: '24px',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      borderRadius: {
        'form-input': '0.375rem',
        'login-container': '0.5rem',
      },
      boxShadow: {
        'login-container': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      height: {
        'form-input': '40px',
      },
      maxWidth: {
        'login-container': '400px',
      },
      padding: {
        'login-container': '2rem',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
      animation: {
        pulse: 'pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.hide-scrollbar': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ],
};
