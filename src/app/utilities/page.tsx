'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useToast } from '@/components/Toast';
import { recordRecentTool } from '@/lib/personalization';
import QRCode from 'qrcode';
import {
  LockKeyhole,
  QrCode,
  Code2,
  Link as LinkIcon,
  Palette,
  Eye,
  Image as ImageIcon,
  Hash,
  KeyRound,
  Fingerprint,
  Copy,
  RefreshCw,
  Shield,
  Download,
  EyeOff,
  Check,
  Upload,
  AlertCircle,
  Sliders,
} from 'lucide-react';

type UtilityTool =
  | 'password'
  | 'qr'
  | 'base64'
  | 'url'
  | 'color'
  | 'contrast'
  | 'svg'
  | 'hash'
  | 'jwt'
  | 'uuid';

const utilityTabs = [
  { id: 'password' as const, icon: LockKeyhole, label: 'Password' },
  { id: 'qr' as const, icon: QrCode, label: 'QR Generator' },
  { id: 'base64' as const, icon: Code2, label: 'Base64' },
  { id: 'url' as const, icon: LinkIcon, label: 'URL Encode' },
  { id: 'color' as const, icon: Palette, label: 'Color Palette' },
  { id: 'contrast' as const, icon: Eye, label: 'Contrast WCAG' },
  { id: 'svg' as const, icon: ImageIcon, label: 'SVG → PNG' },
  { id: 'hash' as const, icon: Hash, label: 'Hash Gen' },
  { id: 'jwt' as const, icon: KeyRound, label: 'JWT Decoder' },
  { id: 'uuid' as const, icon: Fingerprint, label: 'UUID Gen' },
];

export default function UtilitiesPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-sm text-slate-400">Loading Utilities...</div>}>
      <UtilitiesContent />
    </React.Suspense>
  );
}

function UtilitiesContent() {
  const searchParams = useSearchParams();
  const requestedTool = (searchParams.get('tool') as UtilityTool) || 'password';
  const [activeTool, setActiveTool] = useState<UtilityTool>('password');

  useEffect(() => {
    const t = searchParams.get('tool') as UtilityTool;
    if (utilityTabs.some((tab) => tab.id === t)) {
      setActiveTool(t);
    }
  }, [searchParams]);

  useEffect(() => {
    recordRecentTool(activeTool);
  }, [activeTool]);

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Everyday Utilities', href: '/#category-utility' },
        { label: utilityTabs.find((t) => t.id === activeTool)?.label || 'Utility' },
      ]}
      title="Everyday Utilities Suite"
      subtitle="Cryptographic generators, secure tokens, QR codes, color tools, and decoders running purely in your browser."
      badge="Web Crypto API"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Horizontal Scrollable Tabs */}
        <div className="flex justify-center overflow-x-auto pb-2">
          <div className="inline-flex bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-1.5 border border-slate-200/80 dark:border-slate-700/80 gap-1 shadow-xs">
            {utilityTabs.map((t) => {
              const Icon = t.icon;
              const isSelected = activeTool === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTool(t.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Tool Component */}
        {activeTool === 'password' && <PasswordGeneratorTool />}
        {activeTool === 'qr' && <QRGeneratorTool />}
        {activeTool === 'base64' && <Base64Tool />}
        {activeTool === 'url' && <UrlEncoderTool />}
        {activeTool === 'color' && <ColorPaletteTool />}
        {activeTool === 'contrast' && <ContrastCheckerTool />}
        {activeTool === 'svg' && <SvgToPngTool />}
        {activeTool === 'hash' && <HashGeneratorTool />}
        {activeTool === 'jwt' && <JwtDecoderTool />}
        {activeTool === 'uuid' && <UuidGeneratorTool />}
      </div>
    </AppShell>
  );
}

// 1. Password Generator (Cryptographically Secure via Web Crypto API)
function PasswordGeneratorTool() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(24);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const generate = useCallback(() => {
    let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lower = 'abcdefghijklmnopqrstuvwxyz';
    let numbers = '0123456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeAmbiguous) {
      upper = upper.replace(/[IO]/g, '');
      lower = lower.replace(/[lo]/g, '');
      numbers = numbers.replace(/[01]/g, '');
      symbols = symbols.replace(/[{}\[\]()\/\\'"`~,;:.<>]/g, '');
    }

    let chars = '';
    if (includeUpper) chars += upper;
    if (includeLower) chars += lower;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    if (!chars) {
      toast.warning('Please select at least one character set.');
      return;
    }

    // Cryptographically secure Web Crypto random values
    const randomBuffer = new Uint32Array(length);
    window.crypto.getRandomValues(randomBuffer);

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[randomBuffer[i] % chars.length];
    }

    setPassword(result);
    setCopied(false);
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous, toast]);

  useEffect(() => {
    generate();
  }, [generate]);

  const copyPassword = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Secure password copied to clipboard!');
  };

  const strength = useMemo(() => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 12) score++;
    if (password.length >= 20) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-yellow-500' };
    if (score <= 4) return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
    return { level: 5, label: 'Very Strong', color: 'bg-emerald-600' };
  }, [password]);

  return (
    <div className="space-y-6">
      {/* Password Output Card */}
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Web Crypto Generated Password
            </span>
          </div>
          {strength.label && (
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                strength.level >= 4
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}
            >
              {strength.label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex-1 font-mono text-sm sm:text-base break-all text-slate-900 dark:text-white select-all">
            {showPassword ? password : '•'.repeat(password.length)}
          </div>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={copyPassword}
            className={`p-2 rounded-xl transition-all ${
              copied
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50'
            }`}
            aria-label="Copy password"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Strength Progress */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full ${strength.color} rounded-full transition-all duration-300`}
            style={{ width: `${(strength.level / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Options */}
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div>
          <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
            <span>Password Length: {length}</span>
            <span className="text-slate-400 font-normal">
              {length >= 24 ? 'Enterprise grade' : length >= 16 ? 'Recommended' : 'Moderate'}
            </span>
          </div>
          <input
            type="range"
            min={8}
            max={64}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { label: 'Uppercase Letters (A-Z)', checked: includeUpper, set: setIncludeUpper },
            { label: 'Lowercase Letters (a-z)', checked: includeLower, set: setIncludeLower },
            { label: 'Numbers (0-9)', checked: includeNumbers, set: setIncludeNumbers },
            { label: 'Special Symbols (!@#$)', checked: includeSymbols, set: setIncludeSymbols },
            { label: 'Exclude Ambiguous (0, O, 1, l, I)', checked: excludeAmbiguous, set: setExcludeAmbiguous },
          ].map((opt) => (
            <label
              key={opt.label}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={opt.checked}
                onChange={(e) => opt.set(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={generate}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Generate New Secure Password</span>
      </button>
    </div>
  );
}

// 2. QR Code Generator
function QRGeneratorTool() {
  const [text, setText] = useState('https://toolbox-pro-sooty.vercel.app');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [size, setSize] = useState(256);
  const toast = useToast();

  const generateQR = useCallback(async () => {
    if (!text.trim()) return;
    try {
      const data = await QRCode.toDataURL(text.trim(), {
        width: size,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setQrDataUrl(data);
    } catch {
      toast.error('Failed to generate QR code');
    }
  }, [text, size, toast]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'qrcode.png';
    a.click();
    toast.success('Downloaded QR code PNG!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
            Content, URL, or WiFi String
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://example.com or any plain text..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
            Resolution: {size} × {size} px
          </label>
          <input
            type="range"
            min={128}
            max={512}
            step={64}
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>

      {qrDataUrl && (
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 text-center shadow-xs animate-slide-up space-y-4">
          <div className="inline-block p-4 rounded-2xl bg-white shadow-md border border-slate-100">
            <img src={qrDataUrl} alt="Generated QR code" className="mx-auto rounded-lg" />
          </div>
          <div>
            <button
              onClick={downloadQR}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download High-Res PNG ({size}px)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 3. Base64 Tool
function Base64Tool() {
  const [input, setInput] = useState('Hello from ToolBox Pro!');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleConvert = () => {
    setError(null);
    try {
      if (mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        setOutput(encoded);
        toast.success('Encoded to Base64!');
      } else {
        const decoded = decodeURIComponent(escape(atob(input.trim())));
        setOutput(decoded);
        toast.success('Decoded from Base64!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Base64 conversion failed';
      setError(msg);
      setOutput('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-semibold">
          <button
            onClick={() => {
              setMode('encode');
              setOutput('');
              setError(null);
            }}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              mode === 'encode' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => {
              setMode('decode');
              setOutput('');
              setError(null);
            }}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              mode === 'decode' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            Decode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
            {mode === 'encode' ? 'Plain Text to Encode' : 'Base64 to Decode'}
          </span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-48 font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 focus:outline-none resize-y"
          />
        </div>

        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Result</span>
            {output && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  toast.success('Copied!');
                }}
                className="text-[11px] text-brand-600 font-semibold hover:underline"
              >
                Copy
              </button>
            )}
          </div>
          <div className="w-full h-48 font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 overflow-auto">
            {error ? (
              <span className="text-rose-500">{error}</span>
            ) : (
              <span className="text-slate-800 dark:text-slate-200 break-all">{output || 'Result will appear here...'}</span>
            )}
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleConvert}
          className="px-8 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-sm transition-all"
        >
          {mode === 'encode' ? 'Encode to Base64' : 'Decode Base64'}
        </button>
      </div>
    </div>
  );
}

// 4. URL Encoder / Decoder
function UrlEncoderTool() {
  const [input, setInput] = useState('https://example.com/search?q=ToolBox Pro&sort=desc&page=1');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const toast = useToast();

  const handleConvert = () => {
    try {
      if (mode === 'encode') {
        setOutput(encodeURIComponent(input));
        toast.success('URL encoded!');
      } else {
        setOutput(decodeURIComponent(input));
        toast.success('URL decoded!');
      }
    } catch {
      toast.error('Invalid URL sequence to decode.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-semibold">
          <button
            onClick={() => setMode('encode')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              mode === 'encode' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              mode === 'decode' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            Decode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">Input String</span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-44 font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 focus:outline-none resize-y"
          />
        </div>

        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Output</span>
            {output && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  toast.success('Copied!');
                }}
                className="text-[11px] text-brand-600 font-semibold hover:underline"
              >
                Copy
              </button>
            )}
          </div>
          <div className="w-full h-44 font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 overflow-auto break-all">
            {output || 'Output will appear here...'}
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleConvert}
          className="px-8 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-sm transition-all"
        >
          {mode === 'encode' ? 'Encode URI Component' : 'Decode URI Component'}
        </button>
      </div>
    </div>
  );
}

// 5. Color Palette Tool
function ColorPaletteTool() {
  const [colors, setColors] = useState<string[]>([]);
  const [format, setFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const toast = useToast();

  const generateColors = useCallback(() => {
    const list: string[] = [];
    const baseHue = Math.floor(Math.random() * 360);
    for (let i = 0; i < 6; i++) {
      const h = (baseHue + i * 40) % 360;
      const s = 65 + Math.floor(Math.random() * 25);
      const l = 40 + Math.floor(Math.random() * 30);
      list.push(`hsl(${h}, ${s}%, ${l}%)`);
    }
    setColors(list);
  }, []);

  useEffect(() => {
    generateColors();
  }, [generateColors]);

  const copyColor = (col: string) => {
    navigator.clipboard.writeText(col);
    toast.success(`Copied color: ${col}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={generateColors}
          className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Generate Harmonious Palette</span>
        </button>
        <span className="text-xs text-slate-500">Click any swatch to copy value</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {colors.map((color, i) => (
          <button
            key={i}
            onClick={() => copyColor(color)}
            className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs hover:shadow-lg transition-all text-left"
          >
            <div className="h-28" style={{ backgroundColor: color }} />
            <div className="p-3">
              <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 block truncate">
                {color}
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-brand-500 transition-colors">
                Click to copy
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// 6. Contrast Checker Tool (WCAG 2.1)
function ContrastCheckerTool() {
  const [fg, setFg] = useState('#0f172a');
  const [bg, setBg] = useState('#ffffff');

  const contrastRatio = useMemo(() => {
    const getLuminance = (hex: string) => {
      let clean = hex.replace('#', '');
      if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
      const r = parseInt(clean.substring(0, 2), 16) / 255;
      const g = parseInt(clean.substring(2, 4), 16) / 255;
      const b = parseInt(clean.substring(4, 6), 16) / 255;

      const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    try {
      const l1 = getLuminance(fg);
      const l2 = getLuminance(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      return parseFloat(ratio.toFixed(2));
    } catch {
      return 1;
    }
  }, [fg, bg]);

  const passAA = contrastRatio >= 4.5;
  const passAALarge = contrastRatio >= 3.0;
  const passAAA = contrastRatio >= 7.0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-3">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            Foreground (Text) Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
            />
            <input
              type="text"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs uppercase"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-3">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            Background Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
            />
            <input
              type="text"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs uppercase"
            />
          </div>
        </div>
      </div>

      {/* Live Preview Box */}
      <div
        className="rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center transition-colors"
        style={{ backgroundColor: bg, color: fg }}
      >
        <h3 className="text-2xl font-bold mb-2">WCAG Contrast Preview</h3>
        <p className="text-sm max-w-md mx-auto">
          The quick brown fox jumps over the lazy dog. Ensure readability across diverse screen brightness and accessibility requirements.
        </p>
      </div>

      {/* Score and Badges */}
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 block mb-0.5">Contrast Ratio</span>
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {contrastRatio} : 1
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span
            className={`px-3 py-1.5 rounded-xl border ${
              passAALarge
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-200'
            }`}
          >
            AA Large {passAALarge ? '✓ PASS' : '✗ FAIL'}
          </span>
          <span
            className={`px-3 py-1.5 rounded-xl border ${
              passAA
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-200'
            }`}
          >
            AA Normal (4.5:1) {passAA ? '✓ PASS' : '✗ FAIL'}
          </span>
          <span
            className={`px-3 py-1.5 rounded-xl border ${
              passAAA
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-200'
            }`}
          >
            AAA Enhanced (7:1) {passAAA ? '✓ PASS' : '✗ FAIL'}
          </span>
        </div>
      </div>
    </div>
  );
}

// 7. SVG to PNG Tool
function SvgToPngTool() {
  const [svgCode, setSvgCode] = useState(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="#6366f1" />
  <path d="M30 50 L45 65 L70 35" stroke="white" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  );
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const toast = useToast();

  const convert = () => {
    if (!svgCode.trim()) {
      toast.warning('Please enter valid SVG markup.');
      return;
    }

    try {
      const blob = new Blob([svgCode], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        setPngUrl(canvas.toDataURL('image/png'));
        toast.success('SVG rasterized to PNG!');
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast.error('Could not render SVG. Please check XML syntax.');
      };

      img.src = url;
    } catch {
      toast.error('Conversion failed.');
    }
  };

  const download = () => {
    if (!pngUrl) return;
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = 'vector_converted.png';
    a.click();
    toast.success('Downloaded PNG!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
          SVG Vector Markup
        </span>
        <textarea
          value={svgCode}
          onChange={(e) => setSvgCode(e.target.value)}
          className="w-full h-40 font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 resize-y focus:outline-none"
        />

        <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span>Width:</span>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value, 10) || 512)}
              className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>Height:</span>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value, 10) || 512)}
              className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <button
            onClick={convert}
            className="px-6 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-xs"
          >
            Render to PNG
          </button>
        </div>
      </div>

      {pngUrl && (
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 text-center space-y-4 shadow-xs animate-slide-up">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 inline-block border border-slate-200 dark:border-slate-800">
            <img src={pngUrl} alt="Rendered vector preview" className="max-h-60 mx-auto" />
          </div>
          <div>
            <button
              onClick={download}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG ({width}×{height})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 8. Hash Generator (Native Web Crypto API)
function HashGeneratorTool() {
  const [text, setText] = useState('ToolBox Pro 2026');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const toast = useToast();

  const computeHashes = useCallback(async () => {
    if (!text.trim()) {
      setHashes({});
      return;
    }

    const enc = new TextEncoder().encode(text);
    const algos = ['SHA-256', 'SHA-384', 'SHA-512', 'SHA-1'];
    const results: Record<string, string> = {};

    for (const algo of algos) {
      const buffer = await crypto.subtle.digest(algo, enc);
      const hex = Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      results[algo] = hex;
    }

    setHashes(results);
  }, [text]);

  useEffect(() => {
    computeHashes();
  }, [computeHashes]);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success('Checksum copied!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
          Input Text to Hash
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to generate cryptographic checksums..."
          className="w-full h-28 font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 resize-y focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        {Object.entries(hashes).map(([algo, val]) => (
          <div
            key={algo}
            className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
          >
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 block mb-0.5">
                {algo}
              </span>
              <p className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all">
                {val}
              </p>
            </div>
            <button
              onClick={() => copyHash(val)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 9. JWT Decoder Tool
function JwtDecoderTool() {
  const [token, setToken] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFyaWYgQWxpIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxODMxNjIzOTAyfQ.signature'
  );
  const [header, setHeader] = useState<Record<string, unknown> | null>(null);
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const decode = useCallback(() => {
    setError(null);
    setHeader(null);
    setPayload(null);

    const trimmed = token.trim();
    if (!trimmed) return;

    const parts = trimmed.split('.');
    if (parts.length < 2) {
      setError('JWT requires at least 2 dot-separated base64 encoded parts.');
      return;
    }

    try {
      const b64Decode = (str: string) => {
        const padded = str.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(decodeURIComponent(escape(atob(padded))));
      };

      setHeader(b64Decode(parts[0]));
      setPayload(b64Decode(parts[1]));
    } catch {
      setError('Invalid base64 encoding in JWT token.');
    }
  }, [token]);

  useEffect(() => {
    decode();
  }, [decode]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
          Paste Raw JSON Web Token (JWT)
        </label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOi..."
          className="w-full h-24 font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 resize-y focus:outline-none break-all"
        />
        {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
      </div>

      {(header || payload) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {header && (
            <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
              <span className="text-xs font-bold text-rose-500 block mb-2">Header (Algorithm &amp; Type)</span>
              <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-mono overflow-auto">
                {JSON.stringify(header, null, 2)}
              </pre>
            </div>
          )}

          {payload && (
            <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
              <span className="text-xs font-bold text-indigo-500 block mb-2">Payload (Claims &amp; Data)</span>
              <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-mono overflow-auto">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
        <strong>Security Notice:</strong> Tokens are decoded purely locally inside your browser. Because verification requires secret keys or JWKS public certificates, signature validation is not asserted.
      </div>
    </div>
  );
}

// 10. UUID Generator Tool
function UuidGeneratorTool() {
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [noHyphens, setNoHyphens] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);
  const toast = useToast();

  const generate = useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

      if (noHyphens) id = id.replace(/-/g, '');
      if (uppercase) id = id.toUpperCase();
      list.push(id);
    }
    setUuids(list);
  }, [count, uppercase, noHyphens]);

  useEffect(() => {
    generate();
  }, [generate]);

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    toast.success(`Copied ${uuids.length} UUIDs to clipboard!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Count:</span>
            {[1, 5, 10, 25].map((num) => (
              <button
                key={num}
                onClick={() => setCount(num)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  count === num
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600"
              />
              <span>Uppercase</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={noHyphens}
                onChange={(e) => setNoHyphens(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600"
              />
              <span>Remove Hyphens</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Generated UUIDs (v4 RFC-4122)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={generate}
              className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate
            </button>
            <button
              onClick={copyAll}
              className="text-xs px-3 py-1 rounded-lg bg-brand-600 text-white font-bold hover:bg-brand-500 transition-colors"
            >
              Copy All
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {uuids.map((id, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-mono"
            >
              <span className="text-slate-800 dark:text-slate-200 select-all">{id}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(id);
                  toast.success('Copied UUID!');
                }}
                className="text-slate-400 hover:text-brand-600 p-1"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
