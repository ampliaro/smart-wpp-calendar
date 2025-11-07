/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Plus Jakarta Sans', '-apple-system', 'system-ui', 'sans-serif'],
        body: ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'h2': ['1.3rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'card-title': ['1rem', { lineHeight: '1.4', fontWeight: '500' }],
        'label': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['0.95rem', { lineHeight: '1.6', fontWeight: '400' }],
        'small': ['0.8rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      colors: {
        theme: 'var(--bg)',
        surface: 'var(--surface)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        'accent-contrast': 'var(--accent-contrast)',
      },
      borderColor: {
        theme: 'var(--border)',
      },
      textColor: {
        theme: 'var(--text)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
      },
      backgroundColor: {
        theme: 'var(--bg)',
        surface: 'var(--surface)',
        accent: 'var(--accent)',
      },
      borderRadius: {
        theme: 'var(--radius)',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
