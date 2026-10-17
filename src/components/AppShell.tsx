'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import SearchDialog from './SearchDialog';
import { ToastProvider } from './Toast';
import { BreadcrumbItem } from './Breadcrumbs';
import { getFavorites, getRecentTools } from '@/lib/personalization';

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
  onOpenSearch?: () => void;
}

export default function AppShell({
  children,
  breadcrumbs,
  title,
  subtitle,
  badge,
  actions,
  onOpenSearch,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [recentCount, setRecentCount] = useState(0);

  const updateCounts = () => {
    setFavoritesCount(getFavorites().length);
    setRecentCount(getRecentTools().length);
  };

  useEffect(() => {
    try {
      const savedCollapsed = localStorage.getItem('toolbox-sidebar-collapsed');
      if (savedCollapsed === 'true') {
        setCollapsed(true);
      }
    } catch {
      // Ignore storage errors
    }

    updateCounts();

    const handleFavUpdated = () => updateCounts();
    const handleRecentUpdated = () => updateCounts();

    window.addEventListener('toolbox-favorites-updated', handleFavUpdated);
    window.addEventListener('toolbox-recent-updated', handleRecentUpdated);

    // Global keyboard shortcut Cmd+K or Ctrl+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('toolbox-favorites-updated', handleFavUpdated);
      window.removeEventListener('toolbox-recent-updated', handleRecentUpdated);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('toolbox-sidebar-collapsed', String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const handleOpenSearchModal = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      setSearchOpen(true);
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased">
        {/* Left Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onOpenSearch={handleOpenSearchModal}
          favoritesCount={favoritesCount}
          recentCount={recentCount}
        />

        {/* Main Application Area */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
            collapsed ? 'md:ml-[5.75rem]' : 'md:ml-[17.25rem]'
          }`}
        >
          {/* Top Navbar */}
          <Header
            breadcrumbs={breadcrumbs}
            onOpenMobileSidebar={() => setMobileOpen(true)}
            onOpenSearch={handleOpenSearchModal}
            collapsed={collapsed}
          />

          {/* Optional Consistent Page Header */}
          {title && (
            <div className="mx-3 sm:mx-6 lg:mx-8 mt-4 rounded-3xl bg-white/90 dark:bg-[#0c1322]/90 border border-slate-200/70 dark:border-slate-800/80 px-6 sm:px-8 py-5 shadow-saas-card">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {title}
                    </h1>
                    {badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                        {badge}
                      </span>
                    )}
                  </div>
                  {subtitle && (
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                      {subtitle}
                    </p>
                  )}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
              </div>
            </div>
          )}

          {/* Page Content */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* Universal Footer */}
          <Footer />
        </div>

        {/* Global Search Dialog Modal */}
        <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </ToastProvider>
  );
}
