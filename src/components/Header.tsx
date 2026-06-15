'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, FileText, Minimize2, Download, Wrench, Layers, Eraser, Camera } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/converter', label: 'Converter' },
  { href: '/compressor', label: 'Compressor' },
  { href: '/image-tools', label: 'Image AI' },
  { href: '/more-tools', label: 'More Tools' },
  { href: '/utilities', label: 'Utilities' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-all group-hover:scale-105">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">ToolBox</span>
                <span className="text-brand-400 ml-0.5 text-sm font-bold">PRO</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'text-brand-700 bg-brand-50'
                        : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50/60'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* CTA + Mobile Toggle */}
            <div className="flex items-center gap-3">
              <Link
                href="/converter"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] transition-all"
              >
                Get Started
                <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
              </Link>
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <span className="font-bold text-slate-800">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'text-brand-700 bg-brand-50'
                        : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'
                    }`}
                  >
                    {item.href === '/converter' && <FileText className="w-4 h-4" />}
                    {item.href === '/compressor' && <Minimize2 className="w-4 h-4" />}
                    {item.href === '/downloader' && <Download className="w-4 h-4" />}
                    {item.href === '/image-tools' && <Eraser className="w-4 h-4" />}
                    {item.href === '/more-tools' && <Camera className="w-4 h-4" />}
                    {item.href === '/utilities' && <Wrench className="w-4 h-4" />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
