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
  ChevronDown,
  Lock,
  Wrench,
  Check,
  AlertCircle,
  FileText,
  Minimize2,
  ScanText,
  Activity,
  HardDrive,
  CheckCircle2,
} from 'lucide-react';

const stats = [
  {
    icon: Shield,
    value: '100% Private',
    label: 'Zero server uploads',
    desc: 'All file processing runs locally inside your browser memory with WebAssembly.',
  },
  {
    icon: Zap,
    value: '0ms Transfer',
    label: 'Instant execution',
    desc: 'Zero upload or download network lag to third-party cloud servers.',
  },
  {
    icon: Cpu,
    value: '24+ Utilities',
    label: 'Production-ready tools',
    desc: 'From multi-page PDF generation to client-side ML neural networks.',
  },
  {
    icon: Layers,
    value: 'Free Forever',
    label: 'Zero subscriptions',
    desc: 'No credit cards, accounts, watermarks, or artificial daily quotas.',
  },
];

const painPoints = [
  {
    icon: AlertCircle,
    title: 'Too Many Shady Sites',
    subtitle: 'Ad-infested & queue throttling',
    desc: 'Legacy online converters force 30-second timers, limit batch sizes, and bombard you with intrusive popup ads.',
  },
  {
    icon: Lock,
    title: 'Zero Privacy Clarity',
    subtitle: 'Uncontrolled cloud uploads',
    desc: 'Sending confidential financial records, client contracts, or private photos to third-party cloud servers is a major risk.',
  },
  {
    icon: Activity,
    title: 'Slow Upload Latency',
    subtitle: 'Bandwidth bottlenecks',
    desc: 'Uploading 100MB+ images or multi-page documents crawls on mobile or remote Wi-Fi, wasting hours of productive time.',
  },
];

const pricingTiers = [
  {
    name: 'Community',
    badge: 'Standard',
    price: 'Free',
    period: '/ forever',
    desc: 'For developers, students, and creators who need fast everyday tools.',
    buttonText: 'Start Converting Now',
    buttonHref: '/converter',
    popular: false,
    features: [
      'All 24+ In-Browser Utilities',
      'Unlimited Multi-File Batch Queues',
      'Zero Server Uploads & Total Privacy',
      'Full Dark & Light SaaS Modes',
      'Zero Ads, Watermarks, or Quotas',
    ],
  },
  {
    name: 'Pro Developer',
    badge: 'Popular',
    price: '$0',
    period: '/ open-source',
    desc: 'For power users, designers, and software engineers who build daily.',
    buttonText: 'Open Developer Tools',
    buttonHref: '/text-tools',
    popular: true,
    features: [
      'Everything in Community',
      'Client-Side Neural AI OCR & Background Removal',
      'Ordered Multi-Image to PDF Engine',
      'Offline PWA & Local Storage State',
      'Web Crypto & JWT Inspector',
    ],
  },
  {
    name: 'Enterprise Teams',
    badge: 'Self-Hostable',
    price: 'Free',
    period: '/ MIT License',
    desc: 'For organizations and internal security-first engineering workflows.',
    buttonText: 'View on GitHub',
    buttonHref: 'https://github.com/ArifAli8866/toolbox-pro',
    popular: false,
    external: true,
    features: [
      'Air-Gapped & Offline Ready',
      'Zero Network Telemetry on Files',
      'Docker & Static CDN Deployable',
      'Permissive Open-Source License',
      'Community Pull Requests Welcome',
    ],
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
      <section className="relative pt-6 pb-10 sm:pt-12 sm:pb-16 overflow-hidden">
        {/* Soft atmospheric ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-blue-400/10 via-indigo-400/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1e1e21] border border-black/[0.06] dark:border-white/[0.08] shadow-saas-pill text-xs font-semibold text-[#0f172a] dark:text-[#f1f1f4] mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse" />
            <span>Client-Side Architecture • 24+ Production Utilities • 100% Private</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0f172a] dark:text-white leading-[1.12] mb-5">
            The Next-Gen SaaS Utility
            <br />
            <span className="bg-gradient-to-r from-[#2563eb] via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Command Center.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#475569] dark:text-[#a1a1ab] max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
            Convert, compress, manipulate PDFs, inspect tokens, and run on-device AI models with zero server uploads, zero wait queues, and total data privacy.
          </p>

          {/* Dual SaaS Call-to-Action Buttons */}
          <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
            <Link
              href="/converter"
              className="px-6 py-3 rounded-[9px] bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#tools-catalog"
              className="px-6 py-3 rounded-[9px] bg-white dark:bg-[#1e1e21] hover:bg-[#f0f2f7] dark:hover:bg-[#232327] text-[#0f172a] dark:text-[#f1f1f4] border border-black/[0.06] dark:border-white/[0.08] font-semibold text-sm shadow-saas-pill transition-all"
            >
              Explore All 24 Tools
            </a>
          </div>

          {/* Hero Search Bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-[#64748b] dark:text-[#7b7b85] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find a tool (e.g. compress pdf, json formatter, background remover, jwt)..."
                className="w-full pl-12 pr-10 py-3.5 rounded-full bg-white dark:bg-[#1e1e21] border border-black/[0.06] dark:border-white/[0.08] text-[#0f172a] dark:text-white placeholder-[#94a3b8] dark:placeholder-[#5c5c66] shadow-saas-pill focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs font-semibold text-[#64748b] hover:text-[#0f172a] dark:text-[#a1a1ab] dark:hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Live Command Center Preview Showcase Card */}
          <div className="rounded-2xl bg-white dark:bg-[#1e1e21] border border-black/[0.06] dark:border-white/[0.08] shadow-saas-card p-6 sm:p-8 text-left transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.05] dark:border-white/[0.07]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-base font-bold text-[#0f172a] dark:text-white">
                    Client Engine Active
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#e9ecf2] dark:bg-[#232327] text-[#475569] dark:text-[#a1a1ab]">
                    v2.5 Modern
                  </span>
                </div>
                <p className="text-xs text-[#64748b] dark:text-[#a1a1ab] mt-1">
                  Ready to process documents, photos, tokens, and code directly inside browser RAM.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/converter"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] bg-[#e9ecf2] dark:bg-[#232327] hover:bg-[#e2e6ee] dark:hover:bg-[#2c2c32] text-[#0f172a] dark:text-[#f1f1f4] text-xs font-semibold transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-[#2563eb]" />
                  <span>Batch Converter</span>
                </Link>
                <Link
                  href="/compressor"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] bg-[#e9ecf2] dark:bg-[#232327] hover:bg-[#e2e6ee] dark:hover:bg-[#2c2c32] text-[#0f172a] dark:text-[#f1f1f4] text-xs font-semibold transition-colors"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Compressor</span>
                </Link>
              </div>
            </div>

            {/* 3 Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="p-4 rounded-xl bg-[#f0f2f7]/80 dark:bg-[#131316]/80 border border-black/[0.04] dark:border-white/[0.05] shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1ab]">
                    Processing Mode
                  </span>
                  <HardDrive className="w-4 h-4 text-[#2563eb]" />
                </div>
                <div className="text-xl font-bold text-[#0f172a] dark:text-white">100% Client-Side</div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                  ✓ Zero bytes sent to cloud
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#f0f2f7]/80 dark:bg-[#131316]/80 border border-black/[0.04] dark:border-white/[0.05] shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1ab]">
                    Network Latency
                  </span>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-xl font-bold text-[#0f172a] dark:text-white">0ms Server Lag</div>
                <p className="text-[11px] text-[#64748b] dark:text-[#a1a1ab] mt-0.5">
                  Instant HTML5 &amp; WASM execution
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#f0f2f7]/80 dark:bg-[#131316]/80 border border-black/[0.04] dark:border-white/[0.05] shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1ab]">
                    Tools Available
                  </span>
                  <Sparkles className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-xl font-bold text-[#0f172a] dark:text-white">24 Utilities</div>
                <p className="text-[11px] text-[#64748b] dark:text-[#a1a1ab] mt-0.5">
                  Multi-file queue &amp; ZIP exports
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY DEVELOPERS CHOOSE CLIENT-SIDE SECTION ===== */}
      <section className="mb-20 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#1e1e21] border border-black/[0.06] dark:border-white/[0.08] shadow-saas-pill text-[11px] font-semibold text-[#0f172a] dark:text-[#f1f1f4] mb-3">
            <span>Problem vs Solution</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
            Why Teams Avoid Legacy Cloud Converters
          </h2>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#a1a1ab] mt-2 max-w-xl mx-auto">
            Built for founders, engineers, and creators who need speed and clarity without trusting remote servers.
          </p>
        </div>

        {/* 3 Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {painPoints.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#1e1e21] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] p-7 shadow-saas-card hover:shadow-saas-hover hover:-translate-y-0.5 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[#f0f2f7] dark:bg-[#131316] text-[#0f172a] dark:text-[#f1f1f4] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#2563eb] dark:text-[#0a84ff]" />
                </div>
                <h3 className="text-[15px] font-bold text-[#0f172a] dark:text-white mb-1">
                  {item.title}
                </h3>
                <div className="text-xs font-semibold text-[#2563eb] dark:text-[#0a84ff] mb-2">
                  {item.subtitle}
                </div>
                <p className="text-xs text-[#64748b] dark:text-[#a1a1ab] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Full-width Capsule Solution Banner */}
        <div className="rounded-xl bg-white dark:bg-[#1e1e21] border border-black/[0.06] dark:border-white/[0.08] py-3.5 px-6 text-center text-xs sm:text-sm font-medium text-[#475569] dark:text-[#a1a1ab] shadow-saas-pill max-w-3xl mx-auto">
          With <span className="font-bold text-[#2563eb] dark:text-[#0a84ff]">ToolBox Pro</span>, your files are processed directly in browser RAM with HTML5 Canvas &amp; WASM. Zero uploads, zero telemetry, and instant results.
        </div>
      </section>

      {/* ===== FAVORITES & RECENT SECTION ===== */}
      {(favoriteToolItems.length > 0 || recentToolItems.length > 0) && (
        <section className="mb-14 space-y-8">
          {favoriteToolItems.length > 0 && (
            <div id="favorites" className="bg-white dark:bg-[#1e1e21] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-7 shadow-saas-card">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h2 className="text-base font-bold text-[#0f172a] dark:text-white">
                    Favorite Tools ({favoriteToolItems.length})
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
            <div id="recent" className="bg-white dark:bg-[#1e1e21] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-7 shadow-saas-card">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2563eb] dark:text-[#0a84ff]" />
                  <h2 className="text-base font-bold text-[#0f172a] dark:text-white">
                    Recently Visited ({recentToolItems.length})
                  </h2>
                </div>
                <button
                  onClick={clearRecent}
                  className="text-xs text-[#64748b] hover:text-[#0f172a] dark:text-[#a1a1ab] dark:hover:text-white font-medium"
                >
                  Clear History
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
      <section id="tools-catalog" className="mb-20 scroll-mt-24">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#1e1e21] border border-black/[0.06] dark:border-white/[0.08] shadow-saas-pill text-[11px] font-semibold text-[#0f172a] dark:text-[#f1f1f4] mb-2">
              <span>Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
              {selectedCategory === 'all'
                ? 'All Utilities Catalog'
                : CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Tools'}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#a1a1ab] mt-1">
              Showing {filteredTools.length} {filteredTools.length === 1 ? 'utility' : 'utilities'} with local browser processing
            </p>
          </div>

          {/* Category Filter Pills (Sift style) */}
          <div className="flex items-center flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-[9px] text-xs font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#18181b] dark:bg-[#27272a] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1e1e21] text-[#475569] dark:text-[#a1a1ab] border border-black/[0.06] dark:border-white/[0.08] hover:text-[#0f172a] dark:hover:text-white shadow-xs'
              }`}
            >
              All ({ALL_TOOLS.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-[9px] text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#18181b] dark:bg-[#27272a] text-white shadow-xs'
                    : 'bg-white dark:bg-[#1e1e21] text-[#475569] dark:text-[#a1a1ab] border border-black/[0.06] dark:border-white/[0.08] hover:text-[#0f172a] dark:hover:text-white shadow-xs'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
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
          <div className="text-center py-16 bg-white dark:bg-[#1e1e21] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] p-8 shadow-saas-card">
            <Search className="w-10 h-10 text-[#94a3b8] dark:text-[#5c5c66] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#0f172a] dark:text-[#f1f1f4] mb-1">
              No matching tools found
            </h3>
            <p className="text-xs text-[#64748b] dark:text-[#a1a1ab] max-w-sm mx-auto mb-4">
              We couldn&apos;t find any tool matching &quot;{searchQuery}&quot;. Try searching for &quot;pdf&quot;, &quot;image&quot;, or &quot;json&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-[9px] bg-[#2563eb] text-white text-xs font-semibold shadow-xs hover:bg-[#1d4ed8] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* ===== ARCHITECTURE & PRINCIPLES SECTION ===== */}
      <section className="mb-20 py-10 px-6 sm:px-8 rounded-2xl bg-white dark:bg-[#1e1e21] border border-black/[0.06] dark:border-white/[0.08] shadow-saas-card">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f2f7] dark:bg-[#131316] border border-black/[0.04] dark:border-white/[0.06] shadow-xs text-[11px] font-semibold text-[#0f172a] dark:text-[#f1f1f4] mb-3">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Architecture &amp; Principles</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
            Engineered for Maximum Speed &amp; Total Privacy
          </h2>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#a1a1ab] mt-2">
            No file telemetry. No cloud databases. Pure, high-performance client computation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-[#f0f2f7]/80 dark:bg-[#131316]/80 rounded-xl border border-black/[0.04] dark:border-white/[0.05] p-5 text-center shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1e1e21] text-[#2563eb] dark:text-[#0a84ff] flex items-center justify-center mx-auto mb-3 shadow-xs border border-black/[0.04] dark:border-white/[0.06]">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-lg font-bold text-[#0f172a] dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-[#2563eb] dark:text-[#0a84ff] mb-1.5">
                  {stat.label}
                </div>
                <p className="text-xs text-[#64748b] dark:text-[#a1a1ab] leading-relaxed">
                  {stat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== TRANSPARENT PRICING / PLANS SECTION ===== */}
      <section className="mb-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#1e1e21] border border-black/[0.06] dark:border-white/[0.08] shadow-saas-pill text-[11px] font-semibold text-[#0f172a] dark:text-[#f1f1f4] mb-3">
            <span>Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
            Transparent, Open &amp; 100% Free Forever
          </h2>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#a1a1ab] mt-2 max-w-xl mx-auto">
            No credit cards, no tier upgrades, and no artificial daily conversion limits.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`relative bg-white dark:bg-[#1e1e21] rounded-2xl border p-7 flex flex-col justify-between shadow-saas-card hover:shadow-saas-hover transition-all ${
                tier.popular
                  ? 'border-[#2563eb] ring-2 ring-[#2563eb]/20'
                  : 'border-black/[0.06] dark:border-white/[0.08]'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#2563eb] text-white text-[11px] font-bold shadow-xs">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#f0f2f7] dark:bg-[#131316] flex items-center justify-center text-[#0f172a] dark:text-[#f1f1f4]">
                    <Wrench className="w-4 h-4 text-[#2563eb] dark:text-[#0a84ff]" />
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#f0f2f7] dark:bg-[#131316] text-[#475569] dark:text-[#a1a1ab]">
                    {tier.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#0f172a] dark:text-white mb-1">
                  {tier.name}
                </h3>
                <p className="text-xs text-[#64748b] dark:text-[#a1a1ab] mb-4 min-h-[36px]">
                  {tier.desc}
                </p>

                <div className="flex items-baseline gap-1.5 mb-5">
                  <span className="text-3xl font-black text-[#0f172a] dark:text-white">
                    {tier.price}
                  </span>
                  <span className="text-xs font-semibold text-[#94a3b8] dark:text-[#64748b]">
                    {tier.period}
                  </span>
                </div>

                {/* Checklist */}
                <div className="space-y-2.5 pt-4 border-t border-black/[0.05] dark:border-white/[0.06] mb-6">
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-[#475569] dark:text-[#a1a1ab]">
                      <Check className="w-4 h-4 text-[#2563eb] dark:text-[#0a84ff] flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              {tier.external ? (
                <a
                  href={tier.buttonHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-[9px] bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold text-center shadow-xs transition-all"
                >
                  {tier.buttonText}
                </a>
              ) : (
                <Link
                  href={tier.buttonHref}
                  className="w-full py-2.5 rounded-[9px] bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold text-center shadow-xs transition-all"
                >
                  {tier.buttonText}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== FREQUENTLY ASKED QUESTIONS ===== */}
      <section className="mb-20 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#1e1e21] border border-black/[0.06] dark:border-white/[0.08] shadow-saas-pill text-[11px] font-semibold text-[#0f172a] dark:text-[#f1f1f4] mb-3">
            <span>FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#a1a1ab] mt-1">
            Everything you need to know about ToolBox Pro and browser processing.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = Boolean(faqOpen[i]);
            return (
              <div
                key={i}
                className="bg-white dark:bg-[#1e1e21] rounded-xl border border-black/[0.06] dark:border-white/[0.08] shadow-saas-card overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen((prev) => ({ ...prev, [i]: !prev[i] }))}
                  className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                >
                  <span className="font-semibold text-xs sm:text-sm text-[#0f172a] dark:text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#64748b] dark:text-[#7b7b85] transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-[#475569] dark:text-[#a1a1ab] leading-relaxed border-t border-black/[0.05] dark:border-white/[0.06] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== BOTTOM CTA BANNER ===== */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] p-8 sm:p-10 text-center text-white mb-8 shadow-md shadow-blue-500/20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Start Converting and Optimizing Today
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mb-6 leading-relaxed">
            No registration needed. Choose any tool above or launch the converter to begin.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/converter"
              className="px-6 py-3 rounded-[9px] bg-white text-[#0f172a] font-semibold text-xs sm:text-sm shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <span>Open File Converter</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/text-tools"
              className="px-6 py-3 rounded-[9px] bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-sm border border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Developer Tools
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
