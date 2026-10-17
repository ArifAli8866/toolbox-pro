'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import ToolCard from '@/components/ToolCard';
import { ALL_TOOLS, CATEGORIES, ToolItem } from '@/lib/toolsCatalog';
import {
  Sparkles,
  Search,
  Shield,
  Zap,
  Cpu,
  Layers,
  Star,
  Clock,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Lock,
  Workflow,
  Wrench,
} from 'lucide-react';

const stats = [
  {
    icon: Shield,
    value: '100% Private',
    label: 'Zero server uploads',
    desc: 'All file processing runs locally inside your browser memory.',
  },
  {
    icon: Zap,
    value: '0ms Transfer',
    label: 'Instant execution',
    desc: 'No uploading or downloading to third-party cloud servers.',
  },
  {
    icon: Cpu,
    value: '24+ Utilities',
    label: 'Production-ready tools',
    desc: 'From PDF manipulation to Web Crypto & AI neural nets.',
  },
  {
    icon: Layers,
    value: 'Free Forever',
    label: 'No subscriptions',
    desc: 'No credit cards, accounts, watermarks, or artificial limits.',
  },
];

const faqs = [
  {
    q: 'Are my files or text ever sent to a remote server?',
    a: 'No. Every single image conversion, PDF merge, background removal, JSON formatting, and hash generation executes 100% locally in your browser using WebAssembly, HTML5 Canvas, and the Web Crypto API. Your sensitive files and tokens never leave your device.',
  },
  {
    q: 'How does client-side AI and background removal work?',
    a: 'We leverage modern machine learning models compiled to WebAssembly via @imgly/background-removal and Tesseract.js. The model loads into your browser cache once, enabling fast, offline-capable processing without sending any pixel to external servers.',
  },
  {
    q: 'Can I use ToolBox Pro without an internet connection?',
    a: 'Yes! Once the application assets are cached by your browser, virtually all tools (except external links and live currency exchange rates) function fully offline.',
  },
  {
    q: 'What are the limits on file sizes?',
    a: 'Because processing happens directly in your browser memory, performance scales with your device. Most modern laptops and phones comfortably handle 50MB–200MB images and PDFs with zero throttling.',
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentTools, setRecentTools] = useState<string[]>([]);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({ 0: true });

  useEffect(() => {
    try {
      const storedFavs = JSON.parse(localStorage.getItem('toolbox-favorites') || '[]');
      setFavorites(storedFavs);
      const storedRecent = JSON.parse(localStorage.getItem('toolbox-recent') || '[]');
      setRecentTools(storedRecent);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleFavorite = (toolId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId];
      try {
        localStorage.setItem('toolbox-favorites', JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const clearRecent = () => {
    setRecentTools([]);
    try {
      localStorage.removeItem('toolbox-recent');
    } catch {
      // Ignore storage errors
    }
  };

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    let list = ALL_TOOLS;

    if (selectedCategory !== 'all') {
      list = list.filter((tool) => tool.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (tool) =>
          tool.title.toLowerCase().includes(q) ||
          tool.description.toLowerCase().includes(q) ||
          tool.categoryLabel.toLowerCase().includes(q) ||
          tool.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }

    return list;
  }, [searchQuery, selectedCategory]);

  const favoriteToolItems = useMemo(() => {
    return ALL_TOOLS.filter((t) => favorites.includes(t.id));
  }, [favorites]);

  const recentToolItems = useMemo(() => {
    return recentTools
      .map((id) => ALL_TOOLS.find((t) => t.id === id))
      .filter((t): t is ToolItem => Boolean(t));
  }, [recentTools]);

  return (
    <AppShell>
      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-brand-400/10 dark:bg-brand-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6 shadow-xs animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>24+ High-Performance In-Browser Utilities</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-5">
            Every File &amp; Developer Tool,
            <br />
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Processed Locally in Your Browser.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Convert formats, compress media, inspect tokens, and run machine learning models with zero server uploads, zero wait queues, and total privacy.
          </p>

          {/* Hero Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find a tool (e.g. compress pdf, json formatter, background remover, jwt)..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-lg shadow-black/5 dark:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              All Utilities ({ALL_TOOLS.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAVORITES & RECENT SECTION ===== */}
      {(favoriteToolItems.length > 0 || recentToolItems.length > 0) && (
        <section className="mb-12 space-y-8">
          {favoriteToolItems.length > 0 && (
            <div id="favorites" className="bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Favorite Tools ({favoriteToolItems.length})
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {favoriteToolItems.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </div>
          )}

          {recentToolItems.length > 0 && (
            <div id="recent" className="bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-500" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Recently Visited ({recentToolItems.length})
                  </h2>
                </div>
                <button
                  onClick={clearRecent}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
                >
                  Clear History
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recentToolItems.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isFavorite={favorites.includes(tool.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ===== TOOLS DIRECTORY GRID ===== */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {selectedCategory === 'all'
                ? 'All Tools Catalog'
                : CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Tools'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Showing {filteredTools.length} {filteredTools.length === 1 ? 'utility' : 'utilities'}
            </p>
          </div>
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFavorite={favorites.includes(tool.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <Search className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
              No matching tools found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
              We couldn&apos;t find any tool matching &quot;{searchQuery}&quot;. Try searching for &quot;pdf&quot;, &quot;image&quot;, or &quot;json&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* ===== STATS / ARCHITECTURE SECTION ===== */}
      <section className="mb-16 py-12 px-6 sm:px-10 rounded-3xl bg-gradient-to-b from-slate-100/80 to-white dark:from-slate-900/80 dark:to-[#0c1322] border border-slate-200/80 dark:border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3 border border-emerald-200 dark:border-emerald-800">
            <Lock className="w-3.5 h-3.5" />
            <span>Architecture &amp; Privacy First</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Designed for Speed, Engineered for Privacy
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            No telemetry on your files. No cloud uploads. Pure client-side computation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-6 text-center shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-2">
                  {stat.label}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {stat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== FREQUENTLY ASKED QUESTIONS ===== */}
      <section className="mb-16 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Everything you need to know about ToolBox Pro and browser processing.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = Boolean(faqOpen[i]);
            return (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen((prev) => ({ ...prev, [i]: !prev[i] }))}
                  className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 p-8 sm:p-12 text-center text-white mb-8 shadow-xl shadow-brand-500/10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Start Converting and Optimizing Today
          </h2>
          <p className="text-xs sm:text-sm text-brand-100 mb-6 leading-relaxed">
            No registration needed. Choose any tool above or launch the converter to begin.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/converter"
              className="px-6 py-3 rounded-xl bg-white text-brand-700 font-bold text-xs sm:text-sm hover:bg-brand-50 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <span>Open File Converter</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/text-tools"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-sm border border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Developer Tools
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
