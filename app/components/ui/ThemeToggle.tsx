// components/ui/ThemeToggle.tsx

'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full transition-colors hover:bg-bg-light dark:hover:bg-dark-bg-light"
      aria-label="Toggle theme"
    >
      <Image src="/icons/sun.svg" alt="Light mode" width={22} height={22} className="hidden dark:block" />
      <Image src="/icons/moon.svg" alt="Dark mode" width={22} height={22} className="block dark:hidden" />
    </button>
  );
};
