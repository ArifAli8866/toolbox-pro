'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  FileText, Minimize2, Download, ArrowRight, Zap, Shield, Globe,
  Code2, Type, Palette, Hash, Image, LockKeyhole, QrCode,
  Braces, FileType, Check, Star, Users, BarChart3, Sparkles,
  ChevronDown, Layers
} from 'lucide-react';

const stats = [
  { icon: Users, value: '150K+', label: 'Files Processed' },
  { icon: BarChart3, value: '15+', label: 'Free Tools' },
  { icon: Shield, value: '100%', label: 'Private & Secure' },
  { icon: Zap, value: '0ms', label: 'Upload Time' },
];

const tools = [
  {
    category: 'File Tools',
    items: [
      {
        title: 'File Converter',
        description: 'Convert between PNG, JPG, WEBP, BMP, GIF. Merge, split, rotate, and extract PDF pages.',
        href: '/converter',
        icon: FileText,
        gradient: 'from-blue-500 to-cyan-500',
        badge: 'Most Popular',
        features: ['7+ Image Formats', 'PDF Operations', 'Batch Processing'],
      },
      {
        title: 'File Compressor',
        description: 'Reduce image and PDF file sizes with adjustable quality. Real-time preview of compression results.',
        href: '/compressor',
        icon: Minimize2,
        gradient: 'from-green-500 to-emerald-500',
        badge: null,
        features: ['Quality Slider', 'Resize Options', 'Multi-format'],
      },
      {
        title: 'Media Downloader',
        description: 'Download videos and images from any link. Supports direct URLs and popular social platforms.',
        href: '/downloader',
        icon: Download,
        gradient: 'from-purple-500 to-pink-500',
        badge: null,
        features: ['YouTube/TikTok', 'Direct Links', 'No Login'],
      },
    ],
  },
  {
    category: 'Text & Code Tools',
    items: [
      {
        title: 'JSON Formatter',
        description: 'Format, validate, minify, and beautify JSON data with syntax highlighting.',
        href: '/text-tools#json',
        icon: Braces,
        gradient: 'from-amber-500 to-orange-500',
        badge: null,
        features: ['Format & Minify', 'Validate', 'Tree View'],
      },
      {
        title: 'Case Converter',
        description: 'Transform text to uppercase, lowercase, title case, sentence case, camelCase, and more.',
        href: '/text-tools#case',
        icon: Type,
        gradient: 'from-rose-500 to-red-500',
        badge: null,
        features: ['8+ Cases', 'One-click', 'Live Preview'],
      },
      {
        title: 'Word Counter',
        description: 'Count words, characters, sentences, paragraphs. Estimate reading and speaking time.',
        href: '/text-tools#counter',
        icon: FileType,
        gradient: 'from-indigo-500 to-blue-500',
        badge: null,
        features: ['Word Count', 'Reading Time', 'Keyword Density'],
      },
    ],
  },
  {
    category: 'Utilities',
    items: [
      {
        title: 'Password Generator',
        description: 'Generate strong, secure passwords with custom length, symbols, numbers, and entropy check.',
        href: '/utilities#password',
        icon: LockKeyhole,
        gradient: 'from-slate-600 to-slate-800',
        badge: null,
        features: ['Custom Length', 'Symbols/Numbers', 'Strength Meter'],
      },
      {
        title: 'QR Code Generator',
        description: 'Create QR codes for URLs, text, emails, phone numbers. Download as PNG.',
        href: '/utilities#qr',
        icon: QrCode,
        gradient: 'from-violet-500 to-purple-500',
        badge: 'New',
        features: ['URL & Text', 'Custom Size', 'PNG Download'],
      },
      {
        title: 'Base64 Encoder',
        description: 'Encode and decode text, images, and files to/from Base64 format instantly.',
        href: '/utilities#base64',
        icon: Code2,
        gradient: 'from-teal-500 to-cyan-500',
        badge: null,
        features: ['Text & Files', 'Encode/Decode', 'Copy Result'],
      },
      {
        title: 'Color Palette',
        description: 'Generate beautiful color palettes with HEX, RGB, and HSL values. Copy to clipboard.',
        href: '/utilities#color',
        icon: Palette,
        gradient: 'from-pink-500 to-rose-500',
        badge: null,
        features: ['Auto Generate', 'Copy Values', 'HEX/RGB/HSL'],
      },
      {
        title: 'SVG to PNG',
        description: 'Convert SVG vector graphics to PNG raster images with custom dimensions.',
        href: '/utilities#svg',
        icon: Image,
        gradient: 'from-orange-500 to-red-500',
        badge: null,
        features: ['Custom Size', 'Transparent BG', 'Instant'],
      },
      {
        title: 'Hash Generator',
        description: 'Generate MD5, SHA-1, SHA-256 hashes from text. Useful for verification and checksums.',
        href: '/utilities#hash',
        icon: Hash,
        gradient: 'from-emerald-500 to-green-500',
        badge: null,
        features: ['MD5/SHA-1/SHA-256', 'Text Input', 'Copy Result'],
      },
    ],
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Product Designer at Figma',
    content: 'ToolBox Pro saved me hours of work. I convert dozens of design assets daily without ever uploading them anywhere.',
    avatar: '👩‍🎨',
    stars: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Full-Stack Developer',
    content: 'The JSON formatter and password generator are bookmarks for me. Clean UI, fast, and completely free.',
    avatar: '👨‍💻',
    stars: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Content Creator',
    content: 'I compress all my blog images here. The quality slider is perfect — I can hit exactly the file size I need.',
    avatar: '👩‍💼',
    stars: 5,
  },
];

const faqs = [
  {
    q: 'Is ToolBox Pro really free?',
    a: 'Yes, 100% free with no hidden fees, no sign-ups, and no usage limits. All tools run in your browser.',
  },
  {
    q: 'Are my files uploaded to a server?',
    a: 'No! All file conversion, compression, and processing happens directly in your browser using JavaScript. Your files never leave your device.',
  },
  {
    q: 'What file formats are supported?',
    a: 'Images: PNG, JPG/JPEG, WEBP, BMP, GIF, SVG. Documents: PDF (merge, split, rotate, extract pages). And text/code tools for JSON, Base64, and more.',
  },
  {
    q: 'Can I use this offline?',
    a: 'Most tools work offline after the initial page load since all processing is done client-side. Bookmark the pages for quick access.',
  },
  {
    q: 'How do I report a bug or request a feature?',
    a: 'You can reach us through the GitHub repository or contact form. We welcome all feedback and feature requests!',
  },
];

// Animated counter component
function AnimatedCounter({ target }: { target: string }) {
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const numMatch = target.match(/[\d]+/);
    if (!numMatch) { setDisplay(target); return; }
    const num = parseInt(numMatch[0]);
    const suffix = target.replace(numMatch[0], '');
    let current = 0;
    const step = Math.ceil(num / 40);
    const interval = setInterval(() => {
      current += step;
      if (current >= num) {
        current = num;
        clearInterval(interval);
      }
      setDisplay(current + suffix);
    }, 30);
    return () => clearInterval(interval);
  }, [target]);

  return <span>{display}</span>;
}

function FAQItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-800">{q}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-slate-600 leading-relaxed animate-fade-in">{a}</div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/80 via-white to-slate-50" />
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold mb-8 border border-brand-200">
                <Sparkles className="w-4 h-4" />
                15+ Free Tools — No Sign-up Required
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8">
                <span className="text-slate-900">Every file tool</span>
                <br />
                <span className="bg-gradient-to-r from-brand-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                  you'll ever need.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                Convert, compress, download, format, generate — all free, all private, 
                all running directly in your browser. Zero uploads. Zero waiting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/converter"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold text-lg shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] transition-all"
                >
                  Start Using Tools
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#all-tools"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-slate-700 font-bold text-lg shadow-lg border border-slate-200 hover:border-slate-300 hover:scale-[1.02] transition-all"
                >
                  Browse All Tools
                  <ChevronDown className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                No sign-up
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                No file upload
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                No watermarks
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                No limits
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <stat.icon className="w-7 h-7 text-brand-500 mx-auto mb-3" />
                <div className="text-3xl font-extrabold text-slate-900">
                  <AnimatedCounter target={stat.value} />
                </div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FILE TOOLS ===== */}
      <section id="all-tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-4 uppercase tracking-wide">
            File Tools
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">File Conversion & Management</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Powerful tools to convert, compress, and manage your files — all in the browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools[0].items.map((tool, i) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-brand-200 hover:-translate-y-1 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {tool.badge && (
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-brand-600 to-purple-600 text-white text-xs font-bold shadow-md">
                  {tool.badge}
                </span>
              )}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                <tool.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{tool.title}</h3>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">{tool.description}</p>
              <div className="space-y-2">
                {tool.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-slate-500">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:gap-2 transition-all">
                Use Tool <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== TEXT & CODE TOOLS ===== */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-4 uppercase tracking-wide">
              Text & Code
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Developer & Text Tools</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Format JSON, convert cases, count words — handy tools for developers and writers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools[1].items.map((tool, i) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group bg-slate-50 rounded-2xl border border-slate-200 p-8 hover:bg-white hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{tool.title}</h3>
                <p className="text-sm text-slate-600 mb-5 leading-relaxed">{tool.description}</p>
                <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-purple-600 group-hover:gap-2 transition-all">
                  Use Tool <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== UTILITIES ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold mb-4 uppercase tracking-wide">
            Utilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Everyday Utilities</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Password generators, QR codes, color palettes, and more — essential tools at your fingertips.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools[2].items.map((tool, i) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {tool.badge && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-4">
                  {tool.badge}
                </span>
              )}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                <tool.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{tool.title}</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">{tool.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {tool.features.map((f) => (
                  <span key={f} className="px-2 py-1 rounded-md bg-slate-100 text-xs text-slate-600 font-medium">{f}</span>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:gap-2 transition-all">
                Use Tool <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Loved by Thousands</h2>
            <p className="text-lg text-slate-600">See what our users have to say.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={t.name} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed mb-6">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">{t.avatar}</div>
                  <div>
                    <div className="font-semibold text-sm text-slate-800">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} defaultOpen={i === 0} />
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-purple-600" />
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-brand-100 mb-10 max-w-xl mx-auto">
            Join thousands of users who trust ToolBox Pro for their daily file management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/converter"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-brand-700 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
            >
              Start Converting Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Email signup */}
          <div className="mt-12 max-w-md mx-auto">
            <p className="text-sm text-brand-200 mb-3">Get notified when we launch new tools</p>
            {subscribed ? (
              <div className="flex items-center justify-center gap-2 text-green-300 font-semibold">
                <Check className="w-5 h-5" />
                Subscribed! We'll keep you updated.
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (email) setSubscribed(true); }} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-white text-brand-700 font-bold hover:bg-brand-50 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
