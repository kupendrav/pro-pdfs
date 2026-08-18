/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '.theme-dark'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        panel: 'rgb(var(--c-panel) / <alpha-value>)',
        panel2: 'rgb(var(--c-panel2) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        mute: 'rgb(var(--c-mute) / <alpha-value>)',
        faint: 'rgb(var(--c-faint) / <alpha-value>)',
        acc: 'rgb(var(--c-acc) / <alpha-value>)',
        acc2: 'rgb(var(--c-acc2) / <alpha-value>)',
        ok: 'rgb(var(--c-ok) / <alpha-value>)',
        warn: 'rgb(var(--c-warn) / <alpha-value>)',
        danger: 'rgb(var(--c-danger) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(0 0 0 / 0.18), 0 8px 24px -12px rgb(0 0 0 / 0.35)',
        glow: '0 0 0 1px rgb(var(--c-acc) / 0.25), 0 8px 32px -8px rgb(var(--c-acc) / 0.35)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out both',
        'rise-in': 'rise-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pop-in': 'pop-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
