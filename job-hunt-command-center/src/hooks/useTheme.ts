import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ACCENTS } from '../lib/defaults';

/** Applies theme (dark/light/system) + accent color to <html>. */
export function useTheme() {
  const theme = useStore((s) => s.settings.theme);
  const accent = useStore((s) => s.settings.accent);

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      root.classList.toggle('theme-dark', dark);
      root.classList.toggle('theme-light', !dark);
      root.style.colorScheme = dark ? 'dark' : 'light';
    };
    apply();
    if (theme === 'system') {
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  useEffect(() => {
    const a = ACCENTS[accent] ?? ACCENTS.indigo;
    const root = document.documentElement;
    root.style.setProperty('--c-acc', a.acc);
    root.style.setProperty('--c-acc2', a.acc2);
  }, [accent]);
}
