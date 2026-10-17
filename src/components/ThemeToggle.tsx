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
        className="p-1.5 rounded-[9px] text-[#475569] dark:text-[#a1a1ab] hover:text-[#0f172a] dark:hover:text-white bg-white dark:bg-[#1e1e21] border border-slate-200/80 dark:border-white/[0.08] shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-[#0a84ff]" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Select color theme"
          className="absolute right-0 mt-2 w-36 py-1.5 rounded-xl bg-white dark:bg-[#1e1e21] border border-slate-200/80 dark:border-white/[0.08] shadow-saas-card z-50 animate-slide-up text-xs font-medium"
        >
          <button
            role="menuitem"
            onClick={() => {
              setTheme('light');
              setOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-[6px] mx-1 transition-colors ${
              theme === 'light'
                ? 'text-[#2563eb] dark:text-[#0a84ff] bg-blue-50/70 dark:bg-blue-950/40 font-semibold'
                : 'text-[#475569] dark:text-[#a1a1ab] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Light</span>
          </button>

          <button
            role="menuitem"
            onClick={() => {
              setTheme('dark');
              setOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-[6px] mx-1 transition-colors ${
              theme === 'dark'
                ? 'text-[#2563eb] dark:text-[#0a84ff] bg-blue-50/70 dark:bg-blue-950/40 font-semibold'
                : 'text-[#475569] dark:text-[#a1a1ab] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-[#0a84ff]" />
            <span>Dark</span>
          </button>

          <button
            role="menuitem"
            onClick={() => {
              setTheme('system');
              setOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-[6px] mx-1 transition-colors ${
              theme === 'system'
                ? 'text-[#2563eb] dark:text-[#0a84ff] bg-blue-50/70 dark:bg-blue-950/40 font-semibold'
                : 'text-[#475569] dark:text-[#a1a1ab] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 text-[#64748b] dark:text-[#7b7b85]" />
            <span>System</span>
          </button>
        </div>
      )}
    </div>
  );
}
