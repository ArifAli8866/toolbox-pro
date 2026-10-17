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
      <div className="flex flex-col h-full bg-[#fafbfd] dark:bg-[#18181b] md:rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-saas-card backdrop-blur-xl transition-all duration-300 overflow-hidden">
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-black/[0.05] dark:border-white/[0.07]">
          <Link
            href="/"
            onClick={() => isMobile && onCloseMobile()}
            className="flex items-center gap-3 group overflow-hidden"
          >
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-tr from-[#2563eb] to-[#1d4ed8] flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-bold text-base tracking-tight text-[#0f172a] dark:text-[#f1f1f4]">
                  ToolBox
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-[#2563eb] text-white uppercase shadow-xs">
                  PRO
                </span>
              </div>
            )}
          </Link>

          {isMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-[9px] text-[#64748b] hover:text-[#0f172a] dark:text-[#a1a1ab] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Tools Access Bar */}
        <div className="px-3 py-2.5 border-b border-black/[0.05] dark:border-white/[0.07]">
          <div className="flex items-center gap-1 p-1 bg-[#e9ecf2]/70 dark:bg-[#131316]/70 rounded-xl border border-black/[0.04] dark:border-white/[0.05]">
            <Link
              href="/#favorites"
              onClick={() => isMobile && onCloseMobile()}
              title="Favorite Tools"
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[9px] text-xs font-medium transition-colors ${
                pathname === '/#favorites'
                  ? 'bg-white dark:bg-[#232327] text-[#0f172a] dark:text-white shadow-xs font-semibold'
                  : 'text-[#64748b] dark:text-[#a1a1ab] hover:text-[#0f172a] dark:hover:text-white'
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
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[9px] text-xs font-medium transition-colors ${
                pathname === '/#recent'
                  ? 'bg-white dark:bg-[#232327] text-[#0f172a] dark:text-white shadow-xs font-semibold'
                  : 'text-[#64748b] dark:text-[#a1a1ab] hover:text-[#0f172a] dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#2563eb] dark:text-[#0a84ff]" />
              {!isCollapsed && <span>Recent</span>}
              {!isCollapsed && recentCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#2563eb] dark:text-blue-300 font-semibold">
                  {recentCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-5">
          {/* Main Workspaces */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#64748b] dark:text-[#7b7b85]">
                Workspaces
              </div>
            )}
            <nav className="space-y-1">
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
                    className={`flex items-center gap-3 px-3 py-2 rounded-[9px] text-[13px] font-medium transition-all group ${
                      isActive
                        ? 'bg-[#18181b] text-white dark:bg-[#27272a] dark:text-white shadow-md shadow-black/10 dark:shadow-black/40 font-medium'
                        : 'text-[#475569] dark:text-[#a1a1ab] hover:text-[#0f172a] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105 ${
                        isActive
                          ? 'text-white'
                          : 'text-[#64748b] dark:text-[#7b7b85]'
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
              <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#64748b] dark:text-[#7b7b85]">
                Tool Categories
              </div>
            )}
            <div className="space-y-0.5">
              {CATEGORIES.map((cat) => {
                const Icon = categoryIconMap[cat.id] || Wrench;
                return (
                  <Link
                    key={cat.id}
                    href={`/#category-${cat.id}`}
                    onClick={() => isMobile && onCloseMobile()}
                    title={isCollapsed ? cat.label : undefined}
                    className="flex items-center justify-between px-3 py-2 rounded-[9px] text-xs text-[#475569] dark:text-[#a1a1ab] hover:text-[#0f172a] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-3.5 h-3.5 text-[#64748b] dark:text-[#7b7b85] flex-shrink-0" />
                      {!isCollapsed && <span className="truncate">{cat.label}</span>}
                    </div>
                    {!isCollapsed && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#e9ecf2] dark:bg-[#232327] text-[#64748b] dark:text-[#a1a1ab]">
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
        <div className="p-3 border-t border-black/[0.05] dark:border-white/[0.07]">
          {!isCollapsed && (
            <div className="mb-2 p-2.5 rounded-xl bg-[#e9ecf2]/50 dark:bg-[#131316]/60 border border-black/[0.04] dark:border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% In-Browser</span>
              </div>
              <p className="text-[11px] text-[#64748b] dark:text-[#a1a1ab] leading-tight">
                Zero cloud uploads. All file operations execute on your device.
              </p>
            </div>
          )}

          {!isMobile && (
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-[9px] text-xs font-medium text-[#64748b] hover:text-[#0f172a] dark:text-[#a1a1ab] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
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
