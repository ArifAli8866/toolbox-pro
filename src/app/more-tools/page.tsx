'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ToastProvider, useToast } from '@/components/Toast';
import {
  Camera, Coins, FileText, Download, Loader2, Copy, Check,
  ArrowRightLeft, RefreshCw
} from 'lucide-react';

type MoreTool = 'screenshot' | 'currency' | 'markdown';

export default function MoreToolsPage() {
  return (
    <ToastProvider>
      <MoreToolsContent />
    </ToastProvider>
  );
}

function MoreToolsContent() {
  const [activeTool, setActiveTool] = useState<MoreTool>('screenshot');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">More Tools</h1>
          <p className="text-slate-600">Screenshots, currency/unit conversion, and markdown preview.</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-100 rounded-xl p-1">
            {[
              { id: 'screenshot' as const, icon: Camera, label: 'Screenshot' },
              { id: 'currency' as const, icon: Coins, label: 'Currency & Units' },
              { id: 'markdown' as const, icon: FileText, label: 'Markdown' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTool === t.id ? 'bg-white shadow-md text-brand-600' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <t.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {activeTool === 'screenshot' && <ScreenshotGenerator />}
        {activeTool === 'currency' && <CurrencyUnitConverter />}
        {activeTool === 'markdown' && <MarkdownPreviewer />}
      </div>
      <Footer />
    </div>
  );
}

function ScreenshotGenerator() {
  const [url, setUrl] = useState('');
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const generate = async () => {
    let target = url.trim();
    if (!target) { toast.warning('Enter a website URL'); return; }
    if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
    setLoading(true);
    setImgUrl(null);
    try {
      // Using a free screenshot API
      const shotUrl = `https://api.microlink.io/?url=${encodeURIComponent(target)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1280&viewport.height=720`;
      // We verify the image loads
      const img = new window.Image();
      img.onload = () => { setImgUrl(shotUrl); setLoading(false); toast.success('Screenshot captured!'); };
      img.onerror = () => { setLoading(false); toast.error('Failed to capture screenshot. Try another URL.'); };
      img.src = shotUrl;
    } catch {
      setLoading(false);
      toast.error('Failed to generate screenshot');
    }
  };

  const download = async () => {
    if (!imgUrl) return;
    try {
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'screenshot.png';
      a.click();
      toast.success('Screenshot downloaded!');
    } catch {
      // Fallback: open in new tab
      window.open(imgUrl, '_blank');
    }
  };

  const copyUrl = () => {
    if (imgUrl) {
      navigator.clipboard.writeText(imgUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Image URL copied!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 space-y-4">
        <div>
          <label className="font-medium text-slate-700 mb-2 block">Website URL</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
              placeholder="example.com"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            <button
              onClick={generate}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-semibold shadow-lg shadow-brand-500/25 disabled:opacity-50 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Capturing...</> : <><Camera className="w-5 h-5" /> Capture</>}
            </button>
          </div>
        </div>
      </div>

      {imgUrl && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center animate-slide-up">
          <img src={imgUrl} alt="Screenshot" className="mx-auto rounded-xl border border-slate-200 shadow-lg max-w-full mb-4" />
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={download} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" /> Download
            </button>
            <button onClick={copyUrl} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-colors ${copied ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy URL
            </button>
          </div>
        </div>
      )}
      <p className="mt-6 text-xs text-slate-400 text-center">Screenshots powered by Microlink free API. Some sites may block automated capture.</p>
    </div>
  );
}

function CurrencyUnitConverter() {
  const [mode, setMode] = useState<'currency' | 'unit'>('currency');
  const toast = useToast();

  // ===== Currency =====
  const [rates, setRates] = useState<Record<string, number>>({});
  const [fromCur, setFromCur] = useState('USD');
  const [toCur, setToCur] = useState('EUR');
  const [curAmount, setCurAmount] = useState('100');
  const [loadingRates, setLoadingRates] = useState(false);

  const fetchRates = useCallback(async () => {
    setLoadingRates(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      if (data.rates) { setRates(data.rates); }
    } catch {
      toast.error('Failed to load exchange rates');
    } finally {
      setLoadingRates(false);
    }
  }, [toast]);

  useEffect(() => { if (mode === 'currency' && Object.keys(rates).length === 0) fetchRates(); }, [mode, rates, fetchRates]);

  const currencyResult = useMemo(() => {
    const amt = parseFloat(curAmount) || 0;
    if (!rates[fromCur] || !rates[toCur]) return '0.00';
    const usd = amt / rates[fromCur];
    return (usd * rates[toCur]).toFixed(2);
  }, [curAmount, fromCur, toCur, rates]);

  // ===== Units =====
  const unitCategories = {
    length: { label: 'Length', units: { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Mile: 1609.34, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254 } },
    weight: { label: 'Weight', units: { Gram: 1, Kilogram: 1000, Pound: 453.592, Ounce: 28.3495, Tonne: 1000000 } },
    temperature: { label: 'Temperature', units: { Celsius: 1, Fahrenheit: 1, Kelvin: 1 } },
    area: { label: 'Area', units: { 'Sq Meter': 1, 'Sq Kilometer': 1000000, 'Sq Foot': 0.092903, Acre: 4046.86, Hectare: 10000 } },
    volume: { label: 'Volume', units: { Liter: 1, Milliliter: 0.001, Gallon: 3.78541, Cup: 0.236588, 'Cubic Meter': 1000 } },
    speed: { label: 'Speed', units: { 'm/s': 1, 'km/h': 0.277778, 'mph': 0.44704, 'knot': 0.514444 } },
  } as const;

  const [cat, setCat] = useState<keyof typeof unitCategories>('length');
  const [fromUnit, setFromUnit] = useState('Kilometer');
  const [toUnit, setToUnit] = useState('Mile');
  const [unitAmount, setUnitAmount] = useState('1');

  const switchCategory = (c: keyof typeof unitCategories) => {
    setCat(c);
    const keys = Object.keys(unitCategories[c].units);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
  };

  const unitResult = useMemo(() => {
    const amt = parseFloat(unitAmount) || 0;
    const category = unitCategories[cat];
    if (cat === 'temperature') {
      // Special handling for temperature
      let celsius: number;
      if (fromUnit === 'Celsius') celsius = amt;
      else if (fromUnit === 'Fahrenheit') celsius = (amt - 32) * 5 / 9;
      else celsius = amt - 273.15;
      if (toUnit === 'Celsius') return celsius.toFixed(2);
      if (toUnit === 'Fahrenheit') return (celsius * 9 / 5 + 32).toFixed(2);
      return (celsius + 273.15).toFixed(2);
    }
    const baseValue = amt * category.units[fromUnit as keyof typeof category.units];
    return (baseValue / category.units[toUnit as keyof typeof category.units]).toFixed(4);
  }, [unitAmount, fromUnit, toUnit, cat]);

  const currencyList = Object.keys(rates).sort();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-slate-100 rounded-lg p-1">
          <button onClick={() => setMode('currency')} className={`px-5 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${mode === 'currency' ? 'bg-white shadow text-brand-600' : 'text-slate-600'}`}>
            <Coins className="w-4 h-4" /> Currency
          </button>
          <button onClick={() => setMode('unit')} className={`px-5 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${mode === 'unit' ? 'bg-white shadow text-brand-600' : 'text-slate-600'}`}>
            <ArrowRightLeft className="w-4 h-4" /> Units
          </button>
        </div>
      </div>

      {mode === 'currency' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Currency Converter</h3>
            <button onClick={fetchRates} className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 ${loadingRates ? 'animate-spin' : ''}`} /> Refresh rates
            </button>
          </div>
          {loadingRates && currencyList.length === 0 ? (
            <div className="text-center py-8 text-slate-400 flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading exchange rates...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Amount</label>
                <input type="number" value={curAmount} onChange={(e) => setCurAmount(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500" />
                <select value={fromCur} onChange={(e) => setFromCur(e.target.value)} className="w-full mt-2 px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 bg-white">
                  {currencyList.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Converted</label>
                <input type="text" readOnly value={currencyResult} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-green-600" />
                <select value={toCur} onChange={(e) => setToCur(e.target.value)} className="w-full mt-2 px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 bg-white">
                  {currencyList.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}
          {currencyResult !== '0.00' && (
            <div className="mt-4 p-3 bg-brand-50 rounded-lg text-center text-sm text-slate-700">
              <span className="font-semibold">{curAmount || 0} {fromCur}</span> = <span className="font-bold text-brand-600">{currencyResult} {toCur}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Unit Converter</h3>
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-5">
            {Object.entries(unitCategories).map(([key, val]) => (
              <button key={key} onClick={() => switchCategory(key as keyof typeof unitCategories)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${cat === key ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {val.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">From</label>
              <input type="number" value={unitAmount} onChange={(e) => setUnitAmount(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 mb-2" />
              <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 bg-white">
                {Object.keys(unitCategories[cat].units).map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">To</label>
              <input type="text" readOnly value={unitResult} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-green-600 mb-2" />
              <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 bg-white">
                {Object.keys(unitCategories[cat].units).map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4 p-3 bg-brand-50 rounded-lg text-center text-sm text-slate-700">
            <span className="font-semibold">{unitAmount || 0} {fromUnit}</span> = <span className="font-bold text-brand-600">{unitResult} {toUnit}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MarkdownPreviewer() {
  const [markdown, setMarkdown] = useState(`# Hello World 👋

This is a **markdown** previewer with *live* rendering.

## Features
- Bold and italic text
- [Links](https://example.com)
- \`inline code\`

\`\`\`javascript
function hello() {
  console.log("Hello from code block!");
}
\`\`\`

> Blockquotes look like this.

| Tool | Status |
|------|--------|
| Markdown | ✅ |
| Preview | ✅ |
`);
  const [copied, setCopied] = useState(false);
  const [html, setHtml] = useState('');
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { marked } = await import('marked');
        const DOMPurifyMod = await import('dompurify');
        const DOMPurify = (DOMPurifyMod as any).default || DOMPurifyMod;
        marked.setOptions({ breaks: true, gfm: true } as any);
        const raw = marked.parse(markdown);
        const clean = DOMPurify.sanitize(raw);
        if (!cancelled) setHtml(clean);
      } catch {
        if (!cancelled) setHtml('<p class="text-red-500">Error parsing markdown</p>');
      }
    })();
    return () => { cancelled = true; };
  }, [markdown]);

  const copyHtml = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('HTML copied!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <span className="font-semibold text-sm text-slate-700">Markdown Input</span>
          <button onClick={() => setMarkdown('')} className="text-xs text-slate-500 hover:text-slate-700">Clear</button>
        </div>
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className="w-full h-96 p-4 font-mono text-sm bg-white resize-none focus:outline-none"
          spellCheck={false}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <span className="font-semibold text-sm text-slate-700">Live Preview</span>
          <button onClick={copyHtml} className={`text-xs flex items-center gap-1 ${copied ? 'text-green-600' : 'text-slate-500 hover:text-slate-700'}`}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy HTML
          </button>
        </div>
        <div
          className="markdown-preview w-full h-96 p-4 overflow-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
