'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Search, Wrench, Sparkles, Command } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs';

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  onOpenMobileSidebar?: () => void;
  onOpenSearch?: () => void;
  collapsed?: boolean;
}

export default function Header({
  breadcrumbs,
  onOpenMobileSidebar,
  onOpenSearch,
}: HeaderProps) {
  return (
    <header className="sticky top-3 z-20 h-14 mx-3 sm:mx-6 lg:mx-8 rounded-2xl bg-white/95 dark:bg-[#1a1a1dc7] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] px-4 sm:px-5 shadow-saas-pill transition-all">
      <div className="flex items-center justify-between h-full gap-4">
        {/* Left Section: Mobile toggle + Breadcrumbs / Title */}
        <div className="flex items-center gap-3 min-w-0">
          {onOpenMobileSidebar && (
            <button
              onClick={onOpenMobileSidebar}
              className="md:hidden p-1.5 rounded-[9px] border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#1e1e21] text-[#475569] dark:text-[#a1a1ab] hover:text-[#0f172a] dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-xs"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* Mobile brand (shown on small screens if no breadcrumbs) */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[8px] bg-gradient-to-tr from-[#2563eb] to-[#1d4ed8] flex items-center justify-center text-white">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm tracking-tight text-[#0f172a] dark:text-white">
                ToolBox<span className="text-[#2563eb] text-[10px] ml-0.5 font-bold">PRO</span>
              </span>
            </Link>
          </div>

          {/* Desktop Breadcrumbs */}
          <div className="hidden md:flex items-center">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <Breadcrumbs items={breadcrumbs} />
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-[9px] bg-slate-100 dark:bg-[#131316]/70 border border-slate-200/60 dark:border-white/[0.05] text-xs font-medium text-slate-600 dark:text-[#a1a1ab]">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>100% In-Browser Execution</span>
              </div>
            )}
          </div>
        </div>

        {/* Center/Right Section: Search Trigger, Theme Toggle, GitHub, Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Global Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[9px] bg-slate-100 dark:bg-[#131316]/80 hover:bg-slate-200/70 dark:hover:bg-[#1c1d22] text-slate-600 dark:text-[#a1a1ab] hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-white/[0.06] transition-all text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 font-medium"
            aria-label="Search tools"
          >
            <Search className="w-3.5 h-3.5 text-[#64748b] dark:text-[#7b7b85]" />
            <span className="hidden sm:inline">Search tools...</span>
            <span className="sm:hidden">Search</span>
            <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-[5px] bg-white dark:bg-[#1e1e21] border border-slate-200/80 dark:border-white/[0.08] text-[10px] text-slate-500 dark:text-[#7b7b85] font-mono shadow-xs">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </button>

          {/* Theme Selector */}
          <ThemeToggle />

          {/* GitHub Link */}
          <a
            href="https://github.com/ArifAli8866/toolbox-pro"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            className="p-1.5 rounded-[9px] border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#1e1e21] text-slate-600 dark:text-[#a1a1ab] hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#27272a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-xs"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* Sift Accent Primary Button */}
          <Link
            href="/converter"
            className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Tool</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
