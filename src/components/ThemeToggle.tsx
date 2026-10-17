'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle theme"
        aria-expanded={open}
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-brand-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-slide-up text-xs font-medium">
          <button
            onClick={() => {
              setTheme('light');
              setOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
              theme === 'light'
                ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Light</span>
          </button>

          <button
            onClick={() => {
              setTheme('dark');
              setOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
              theme === 'dark'
                ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-brand-400" />
            <span>Dark</span>
          </button>

          <button
            onClick={() => {
              setTheme('system');
              setOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
              theme === 'system'
                ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 text-slate-400" />
            <span>System</span>
          </button>
        </div>
      )}
    </div>
  );
}
