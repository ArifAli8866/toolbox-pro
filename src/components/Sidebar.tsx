'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wrench,
  FileText,
  Sparkles,
  Braces,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Clock,
  LayoutGrid,
  ShieldCheck,
  Minimize2,
  Download,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/toolsCatalog';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenSearch?: () => void;
  favoritesCount?: number;
  recentCount?: number;
}

const categoryIconMap: Record<string, React.ElementType> = {
  file: FileText,
  ai: Sparkles,
  developer: Braces,
  utility: Wrench,
  productivity: Layers,
};

const mainNavItems = [
  { href: '/', label: 'Overview', icon: LayoutGrid, matchExact: true },
  { href: '/converter', label: 'File Converter', icon: FileText },
  { href: '/compressor', label: 'Compressor', icon: Minimize2 },
  { href: '/downloader', label: 'Downloader', icon: Download },
  { href: '/image-tools', label: 'AI Studio', icon: Sparkles },
  { href: '/text-tools', label: 'Dev & Text', icon: Braces },
  { href: '/utilities', label: 'Utilities', icon: Wrench },
  { href: '/more-tools', label: 'Productivity', icon: Layers },
];

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onOpenSearch,
  favoritesCount = 0,
  recentCount = 0,
}: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mobileOpen, onCloseMobile]);

  const renderContent = (isMobile = false) => {
    const isCollapsed = !isMobile && collapsed;

    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#0c1322] md:rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm transition-all duration-300 overflow-hidden">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
          <Link
            href="/"
            onClick={() => isMobile && onCloseMobile()}
            className="flex items-center gap-3 group overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  ToolBox
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-gradient-to-r from-brand-600 to-purple-600 text-white uppercase shadow-sm">
                  PRO
                </span>
              </div>
            )}
          </Link>

          {isMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Tools Access Bar */}
        <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/70 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-800/50">
            <Link
              href="/#favorites"
              onClick={() => isMobile && onCloseMobile()}
              title="Favorite Tools"
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                pathname === '/#favorites'
                  ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {!isCollapsed && <span>Favorites</span>}
              {!isCollapsed && favoritesCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-semibold">
                  {favoritesCount}
                </span>
              )}
            </Link>

            <Link
              href="/#recent"
              onClick={() => isMobile && onCloseMobile()}
              title="Recently Used"
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                pathname === '/#recent'
                  ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-brand-500" />
              {!isCollapsed && <span>Recent</span>}
              {!isCollapsed && recentCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-semibold">
                  {recentCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Workspaces */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Workspaces
              </div>
            )}
            <nav className="space-y-1.5">
              {mainNavItems.map((item) => {
                const isActive = item.matchExact
                  ? pathname === item.href
                  : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => isMobile && onCloseMobile()}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 font-semibold border border-brand-200/60 dark:border-brand-800/50 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                        isActive
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Categories List */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Tool Categories
              </div>
            )}
            <div className="space-y-1">
              {CATEGORIES.map((cat) => {
                const Icon = categoryIconMap[cat.id] || Wrench;
                return (
                  <Link
                    key={cat.id}
                    href={`/#category-${cat.id}`}
                    onClick={() => isMobile && onCloseMobile()}
                    title={isCollapsed ? cat.label : undefined}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      {!isCollapsed && <span className="truncate">{cat.label}</span>}
                    </div>
                    {!isCollapsed && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {cat.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info & collapse toggle */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80">
          {!isCollapsed && (
            <div className="mb-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% In-Browser</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                No files uploaded to any server. Everything is processed locally.
              </p>
            </div>
          )}

          {!isMobile && (
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Collapse Sidebar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        aria-label="Desktop Navigation"
        className={`hidden md:block fixed top-3 bottom-3 left-3 z-30 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
          className="fixed inset-0 z-50 md:hidden"
        >
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl animate-slide-in-right rounded-r-2xl overflow-hidden">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
