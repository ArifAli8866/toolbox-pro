'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';
import { useToast } from '@/components/Toast';
import { Braces, Type, FileType, Copy, Trash2, ArrowDownUp, Minus, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2 } from 'lucide-react';

type TextTool = 'json' | 'case' | 'counter';

export default function TextToolsPage() {
  return (
    <ToastProvider>
      <TextToolsContent />
    </ToastProvider>
  );
}

function TextToolsContent() {
  const [activeTool, setActiveTool] = useState<TextTool>('json');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Text & Code Tools</h1>
          <p className="text-slate-600">Format JSON, convert text cases, count words — all in your browser.</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-100 rounded-xl p-1">
            {[
              { id: 'json' as const, icon: Braces, label: 'JSON Formatter' },
              { id: 'case' as const, icon: Type, label: 'Case Converter' },
              { id: 'counter' as const, icon: FileType, label: 'Word Counter' },
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

        {activeTool === 'json' && <JSONFormatter />}
        {activeTool === 'case' && <CaseConverter />}
        {activeTool === 'counter' && <WordCounter />}
      </div>
      <Footer />
    </div>
  );
}

function JSONFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'format' | 'minify'>('format');
  const toast = useToast();

  const handleFormat = () => {
    if (!input.trim()) { setError('Please enter JSON data'); return; }
    try {
      const parsed = JSON.parse(input);
      if (mode === 'format') {
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        setOutput(JSON.stringify(parsed));
      }
      setError(null);
      toast.success(`JSON ${mode === 'format' ? 'formatted' : 'minified'} successfully!`);
    } catch (e: any) {
      setError(e.message);
      setOutput('');
    }
  };

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      toast.success('Copied to clipboard!');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <span className="font-semibold text-sm text-slate-700">Input JSON</span>
          <div className="flex gap-2">
            <button onClick={() => setInput('')} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors" title="Clear">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"name": "John", "age": 30}'
          className="w-full h-72 p-4 font-mono text-sm bg-white resize-none focus:outline-none placeholder:text-slate-400"
          spellCheck={false}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <span className="font-semibold text-sm text-slate-700">Output</span>
          <button onClick={copyOutput} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors" title="Copy">
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <pre className={`w-full h-72 p-4 font-mono text-sm overflow-auto ${error ? 'text-red-500' : 'text-slate-800'}`}>
          {error || output || 'Output will appear here...'}
        </pre>
      </div>

      <div className="lg:col-span-2 flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button onClick={() => setMode('format')} className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'format' ? 'bg-white shadow text-brand-600' : 'text-slate-600'}`}>
            <AlignLeft className="w-4 h-4 inline mr-1" /> Format
          </button>
          <button onClick={() => setMode('minify')} className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'minify' ? 'bg-white shadow text-brand-600' : 'text-slate-600'}`}>
            <Minus className="w-4 h-4 inline mr-1" /> Minify
          </button>
        </div>
        <button
          onClick={handleFormat}
          className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-semibold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <ArrowDownUp className="w-4 h-4" />
          {mode === 'format' ? 'Format JSON' : 'Minify JSON'}
        </button>
      </div>
    </div>
  );
}

function CaseConverter() {
  const [text, setText] = useState('');
  const toast = useToast();

  const cases: Record<string, (s: string) => string> = {
    'UPPERCASE': (s) => s.toUpperCase(),
    'lowercase': (s) => s.toLowerCase(),
    'Title Case': (s) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
    'Sentence case': (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
    'camelCase': (s) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()),
    'PascalCase': (s) => s.replace(/(?:^|\s|[-_])\w/g, (c) => c.toUpperCase()).replace(/[\s-_]/g, ''),
    'snake_case': (s) => s.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
    'kebab-case': (s) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    'CONSTANT_CASE': (s) => s.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, ''),
    'dot.case': (s) => s.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, ''),
    'aLtErNaTiNg': (s) => s.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(''),
    'InVeRsE': (s) => s.split('').map((c) => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''),
  };

  const convertAndCopy = (name: string) => {
    const fn = cases[name];
    if (!fn || !text) return;
    const result = fn(text);
    navigator.clipboard.writeText(result);
    toast.success(`${name} copied!`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
          <span className="font-semibold text-sm text-slate-700">Enter your text</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full h-40 p-4 text-sm bg-white resize-none focus:outline-none placeholder:text-slate-400"
        />
        {text && (
          <div className="px-5 py-2 border-t border-slate-100 text-xs text-slate-500">
            {text.length} characters · {text.split(/\s+/).filter(Boolean).length} words · {text.split(/\n/).length} lines
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Object.keys(cases).map((name) => {
          const fn = cases[name];
          const result = text ? fn(text) : '';
          return (
            <button
              key={name}
              onClick={() => convertAndCopy(name)}
              disabled={!text}
              className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:border-brand-300 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="text-xs font-semibold text-slate-500 mb-2 group-hover:text-brand-600 transition-colors">{name}</div>
              <div className="text-sm text-slate-700 truncate" title={result || name}>
                {result || <span className="text-slate-400">—</span>}
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <Copy className="w-3 h-3" /> Click to copy
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WordCounter() {
  const [text, setText] = useState('');

  const words = text.trim() ? text.trim().split(/\s+/) : [];
  const wordCount = words.length;
  const charCount = text.length;
  const charNoSpaces = text.replace(/\s/g, '').length;
  const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
  const paragraphCount = text.split(/\n\s*\n/).filter(Boolean).length || (text.trim() ? 1 : 0);
  const readingTime = Math.ceil(wordCount / 200);
  const speakingTime = Math.ceil(wordCount / 130);

  const keywordDensity: Record<string, number> = {};
  words.forEach((w) => {
    const lower = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (lower.length > 2) {
      keywordDensity[lower] = (keywordDensity[lower] || 0) + 1;
    }
  });
  const topKeywords = Object.entries(keywordDensity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const stats = [
    { label: 'Words', value: wordCount },
    { label: 'Characters', value: charCount },
    { label: 'No Spaces', value: charNoSpaces },
    { label: 'Sentences', value: sentenceCount },
    { label: 'Paragraphs', value: paragraphCount },
    { label: 'Reading', value: `${readingTime} min` },
    { label: 'Speaking', value: `${speakingTime} min` },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
          <span className="font-semibold text-sm text-slate-700">Enter your text</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here..."
          className="w-full h-48 p-4 text-sm bg-white resize-none focus:outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {topKeywords.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Heading2 className="w-4 h-4" />
            Top Keywords
          </h3>
          <div className="space-y-2">
            {topKeywords.map(([word, count]) => (
              <div key={word} className="flex items-center gap-3">
                <span className="text-sm text-slate-700 font-medium w-24 truncate">{word}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${(count / wordCount) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-slate-500 w-16 text-right">{count} ({((count / wordCount) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
