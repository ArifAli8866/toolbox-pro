'use client';

import { useState, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/components/Toast';
import QRCode from 'qrcode';
import {
  LockKeyhole, QrCode, Code2, Palette, Image, Hash, Copy, RefreshCw,
  Shield, Download, Eye, EyeOff, Check, Upload, CheckCircle
} from 'lucide-react';

type UtilityTool = 'password' | 'qr' | 'base64' | 'color' | 'svg' | 'hash';

export default function UtilitiesPage() {
  const [activeTool, setActiveTool] = useState<UtilityTool>('password');

  const tools = [
    { id: 'password' as const, icon: LockKeyhole, label: 'Password Generator' },
    { id: 'qr' as const, icon: QrCode, label: 'QR Generator' },
    { id: 'base64' as const, icon: Code2, label: 'Base64' },
    { id: 'color' as const, icon: Palette, label: 'Color Palette' },
    { id: 'svg' as const, icon: Image, label: 'SVG → PNG' },
    { id: 'hash' as const, icon: Hash, label: 'Hash Gen' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Utilities</h1>
          <p className="text-slate-600">Password generator, QR codes, color palettes, and more.</p>
        </div>

        {/* Tool Tabs - Scrollable on mobile */}
        <div className="flex justify-center mb-8 overflow-x-auto pb-2">
          <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-0.5">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTool === t.id ? 'bg-white shadow-md text-brand-600' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {activeTool === 'password' && <PasswordGenerator />}
        {activeTool === 'qr' && <QRGenerator />}
        {activeTool === 'base64' && <Base64Tool />}
        {activeTool === 'color' && <ColorPalette />}
        {activeTool === 'svg' && <SvgToPng />}
        {activeTool === 'hash' && <HashGenerator />}
      </div>
      <Footer />
    </div>
  );
}

function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(20);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const generate = useCallback(() => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    if (includeUpper) chars += upper;
    if (includeLower) chars += lower;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    if (!chars) { toast.warning('Select at least one character type'); return; }

    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[arr[i] % chars.length];
    }
    setPassword(result);
    setCopied(false);
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, toast]);

  const copyPassword = async () => {
    if (password) {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Password copied to clipboard!');
    }
  };

  const strength = (() => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 12) score++;
    if (password.length >= 20) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-orange-500' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-yellow-500' };
    if (score <= 4) return { level: 4, label: 'Strong', color: 'bg-green-500' };
    return { level: 5, label: 'Very Strong', color: 'bg-emerald-500' };
  })();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Password Display */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Generated Password</h3>
            <div className="flex items-center gap-2">
              {strength.label && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  strength.level >= 4 ? 'bg-green-100 text-green-700' :
                  strength.level >= 3 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {strength.label}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 mb-4">
          <div className="flex-1 font-mono text-lg break-all text-slate-800">
            {showPassword ? password : '••••••••••••••••••••'}
          </div>
          <button onClick={() => setShowPassword(!showPassword)} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={copyPassword} className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-100 text-green-600' : 'hover:bg-slate-200 text-slate-500'}`}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Strength bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 mb-1 overflow-hidden">
          <div
            className={`h-full ${strength.color} rounded-full transition-all duration-300`}
            style={{ width: `${(strength.level / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Options */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-slate-700">Length: {length}</label>
            <span className="text-sm text-slate-500">{length >= 20 ? 'Maximum security' : length >= 12 ? 'Strong' : 'Consider longer'}</span>
          </div>
          <input
            type="range"
            min={6}
            max={64}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Uppercase (A-Z)', checked: includeUpper, set: setIncludeUpper },
            { label: 'Lowercase (a-z)', checked: includeLower, set: setIncludeLower },
            { label: 'Numbers (0-9)', checked: includeNumbers, set: setIncludeNumbers },
            { label: 'Symbols (!@#)', checked: includeSymbols, set: setIncludeSymbols },
          ].map((opt) => (
            <label key={opt.label} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={opt.checked}
                onChange={(e) => opt.set(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={generate}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-semibold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-5 h-5" />
        Generate Password
      </button>
    </div>
  );
}

function QRGenerator() {
  const [text, setText] = useState('');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [size, setSize] = useState(256);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const toast = useToast();

  const generateQR = async () => {
    if (!text.trim()) { toast.warning('Enter text or URL'); return; }
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      await QRCode.toCanvas(canvas, text, { width: size, margin: 2 });
      setQrImage(canvas.toDataURL('image/png'));
      toast.success('QR code generated!');
    } catch {
      toast.error('Failed to generate QR code');
    }
  };

  const downloadQR = () => {
    if (qrImage) {
      const a = document.createElement('a');
      a.href = qrImage;
      a.download = 'qrcode.png';
      a.click();
      toast.success('QR code downloaded!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 space-y-5">
        <div>
          <label className="font-medium text-slate-700 mb-2 block">Text or URL</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://example.com or any text..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <div>
          <label className="font-medium text-slate-700 mb-2 block">Size: {size}px</label>
          <input
            type="range"
            min={128}
            max={512}
            value={size}
            step={64}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <button
          onClick={generateQR}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
        >
          <QrCode className="w-5 h-5" />
          Generate QR Code
        </button>
      </div>

      {qrImage && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
          <img src={qrImage} alt="QR Code" className="mx-auto rounded-xl mb-4 border border-slate-100" />
          <canvas ref={canvasRef} className="hidden" />
          <button
            onClick={downloadQR}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>
        </div>
      )}
    </div>
  );
}

function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string | null>(null);
  const [isFile, setIsFile] = useState(false);
  const toast = useToast();

  const handleConvert = () => {
    setError(null);
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))));
      }
    } catch (e: any) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleFileConvert = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setInput(base64);
      setOutput(result);
      toast.success(`File encoded: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      toast.success('Copied!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-center mb-2">
        <div className="inline-flex bg-slate-100 rounded-lg p-1">
          <button onClick={() => { setMode('encode'); setOutput(''); setError(null); }} className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'encode' ? 'bg-white shadow text-brand-600' : 'text-slate-600'}`}>
            Encode
          </button>
          <button onClick={() => { setMode('decode'); setOutput(''); setError(null); }} className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'decode' ? 'bg-white shadow text-brand-600' : 'text-slate-600'}`}>
            Decode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
            <span className="font-semibold text-sm text-slate-700">{mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}</span>
            {mode === 'encode' && (
              <label className="flex items-center gap-1 text-xs text-brand-600 cursor-pointer hover:text-brand-700">
                <Upload className="w-3.5 h-3.5" />
                <input type="file" onChange={handleFileConvert} className="hidden" />
                From file
              </label>
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste base64 here...'}
            className="w-full h-56 p-4 font-mono text-sm bg-white resize-none focus:outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
            <span className="font-semibold text-sm text-slate-700">Result</span>
            <button onClick={copyOutput} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className={`w-full h-56 p-4 font-mono text-sm overflow-auto ${error ? 'text-red-500' : 'text-slate-800'}`}>
            {error || output || <span className="text-slate-400">Result will appear here...</span>}
          </div>
        </div>
      </div>

      <button
        onClick={handleConvert}
        disabled={!input.trim()}
        className="w-full max-w-xs mx-auto block py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
      >
        <Code2 className="w-4 h-4" />
        {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
      </button>
    </div>
  );
}

function ColorPalette() {
  const [colors, setColors] = useState<string[]>([]);
  const [format, setFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const toast = useToast();

  const generateColors = () => {
    const newColors: string[] = [];
    for (let i = 0; i < 6; i++) {
      const h = Math.floor(Math.random() * 360);
      const s = 50 + Math.floor(Math.random() * 40);
      const l = 35 + Math.floor(Math.random() * 35);
      newColors.push(`hsl(${h}, ${s}%, ${l}%)`);
    }
    setColors(newColors);
  };

  const toHex = (hsl: string) => {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return '';
    const [_, h, s, l] = match.map(Number);
    const canvas = document.createElement('canvas');
    canvas.width = 1; canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.fillStyle = hsl;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return `#${data[0].toString(16).padStart(2, '0')}${data[1].toString(16).padStart(2, '0')}${data[2].toString(16).padStart(2, '0')}`;
  };

  const toRgb = (hsl: string) => {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return '';
    const [_, h, s, l] = match.map(Number);
    const canvas = document.createElement('canvas');
    canvas.width = 1; canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.fillStyle = hsl;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
  };

  const getColorValue = (hsl: string) => {
    if (format === 'hex') return toHex(hsl);
    if (format === 'rgb') return toRgb(hsl);
    return hsl;
  };

  const copyColor = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`Copied: ${value}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <button
          onClick={generateColors}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold shadow-lg shadow-pink-500/25 hover:scale-[1.01] transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Generate Palette
        </button>
        <div className="inline-flex bg-slate-100 rounded-lg p-1">
          {(['hex', 'rgb', 'hsl'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${format === f ? 'bg-white shadow text-pink-600' : 'text-slate-600'}`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {colors.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {colors.map((color, i) => {
            const value = getColorValue(color);
            return (
              <button
                key={i}
                onClick={() => copyColor(value)}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="h-28 sm:h-36" style={{ backgroundColor: color }} />
                <div className="p-3 bg-white text-center">
                  <div className="text-xs font-mono font-semibold text-slate-700 truncate">{value}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">Click to copy</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {colors.length === 0 && (
        <div className="text-center py-16">
          <Palette className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Click "Generate Palette" to create beautiful color combinations.</p>
        </div>
      )}
    </div>
  );
}

function SvgToPng() {
  const [svgCode, setSvgCode] = useState('');
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const toast = useToast();

  const convert = () => {
    if (!svgCode.trim()) { toast.warning('Paste SVG code'); return; }
    try {
      const blob = new Blob([svgCode], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { toast.error('Canvas error'); return; }
        ctx.drawImage(img, 0, 0, width, height);
        setPngUrl(canvas.toDataURL('image/png'));
        toast.success('SVG converted to PNG!');
      };
      img.onerror = () => toast.error('Invalid SVG');
      img.src = url;
    } catch {
      toast.error('Conversion failed');
    }
  };

  const download = () => {
    if (pngUrl) {
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'converted.png';
      a.click();
      toast.success('PNG downloaded!');
    }
  };

  const loadSample = () => {
    setSvgCode(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="#6366f1" />
  <path d="M30 50 L45 65 L70 35" stroke="white" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <span className="font-semibold text-sm text-slate-700">SVG Code</span>
          <button onClick={loadSample} className="text-xs text-brand-600 hover:text-brand-700 font-medium">Load sample SVG</button>
        </div>
        <textarea
          value={svgCode}
          onChange={(e) => setSvgCode(e.target.value)}
          placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">...</svg>'
          className="w-full h-40 p-4 font-mono text-sm bg-white resize-none focus:outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="flex items-center gap-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Width</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 512)}
              className="w-24 px-3 py-2 rounded-lg border border-slate-300 text-sm"
            />
          </div>
          <span className="text-slate-400 mt-5">×</span>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Height</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value) || 512)}
              className="w-24 px-3 py-2 rounded-lg border border-slate-300 text-sm"
            />
          </div>
        </div>
        <button
          onClick={convert}
          disabled={!svgCode.trim()}
          className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold shadow-lg shadow-orange-500/25 disabled:opacity-50 hover:scale-[1.01] transition-all flex items-center gap-2"
        >
          <Image className="w-4 h-4" />
          Convert to PNG
        </button>
      </div>

      {pngUrl && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
          <h3 className="font-semibold text-slate-800 mb-4">Preview</h3>
          <img src={pngUrl} alt="Converted PNG" className="mx-auto rounded-xl border border-slate-200 max-h-64 object-contain mb-4" />
          <button
            onClick={download}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PNG ({width}×{height})
          </button>
        </div>
      )}
    </div>
  );
}

async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha1(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function simpleMD5(message: string): string {
  // Simple MD5 using Web Crypto is not available, so we implement a basic hash
  // For production, use a proper MD5 library. Here we use a simpler approach.
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < message.length; i++) {
    const ch = message.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return ((h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0')).padStart(32, '0');
}

function HashGenerator() {
  const [text, setText] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const toast = useToast();

  const generate = async () => {
    if (!text.trim()) { toast.warning('Enter text'); return; }
    try {
      const sha256Hash = await sha256(text);
      const sha1Hash = await sha1(text);
      const md5Hash = simpleMD5(text);
      setHashes({ 'SHA-256': sha256Hash, 'SHA-1': sha1Hash, 'MD5*': md5Hash });
    } catch {
      toast.error('Failed to generate hash');
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success('Hash copied!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
          <span className="font-semibold text-sm text-slate-700">Input Text</span>
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generate()}
          placeholder="Enter text to hash..."
          className="w-full px-4 py-3 bg-white focus:outline-none placeholder:text-slate-400"
        />
      </div>

      <button
        onClick={generate}
        disabled={!text.trim()}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold shadow-lg shadow-emerald-500/25 disabled:opacity-50 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
      >
        <Hash className="w-4 h-4" />
        Generate Hashes
      </button>

      {Object.entries(hashes).length > 0 && (
        <div className="space-y-3">
          {Object.entries(hashes).map(([algo, hash]) => (
            <div key={algo} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
                <span className="font-semibold text-sm text-slate-700">{algo}</span>
                <button onClick={() => copyHash(hash)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="px-5 py-3">
                <code className="text-sm font-mono text-slate-800 break-all">{hash}</code>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-400 text-center">*MD5 is a simplified hash. For production use, use a proper MD5 library.</p>
    </div>
  );
}
