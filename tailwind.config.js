/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#264376",
        // Semantic Token Mapping
        'zine-primary': 'var(--zine-color-primary)',
        'zine-secondary': 'var(--zine-color-secondary)',
        'zine-accent': 'var(--zine-color-accent)',
        'zine-bg': 'var(--zine-color-background)',
        'zine-surface': 'var(--zine-color-surface)',
      },
      gridTemplateColumns: {
        '24': 'repeat(24, minmax(0, 1fr))',
      },
      gridTemplateRows: {
        '24': 'repeat(24, minmax(0, 1fr))',
      },
      spacing: {
        'zine-xs': '4px',
        'zine-sm': '8px',
        'zine-md': '16px',
        'zine-lg': '24px',
        'zine-xl': '32px',
        'zine-2xl': '48px',
        'zine-3xl': '64px',
        'zine-gutter': '24px',
      },
      fontFamily: {
        'zine-display': ["'Playfair Display'", 'serif'],
        'zine-serif': ["'Noto Serif SC'", 'serif'],
        'zine-body': ["'Crimson Pro'", 'serif'],
        'zine-sans': ["'Inter'", 'sans-serif'],
      },
      fontSize: {
        'zine-display': ['72px', { lineHeight: '0.8', letterSpacing: '-0.05em' }],
        'zine-h1': ['48px', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'zine-h2': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'zine-body': ['16px', { lineHeight: '1.5', letterSpacing: '0' }],
        'zine-caption': ['10px', { lineHeight: '1.6', letterSpacing: '0.2em' }],
      }
    },
  },
  plugins: [],
}