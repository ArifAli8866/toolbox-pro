'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useToast } from '@/components/Toast';
import { recordRecentTool } from '@/lib/personalization';
import { computeLineDiff, csvToJson, jsonToCsv, DiffLine } from '@/lib/diffUtils';
import {
  Braces,
  Type,
  FileType,
  GitCompare,
  ArrowLeftRight,
  Copy,
  Trash2,
  Download,
  Check,
  AlignLeft,
  Minus,
  Sparkles,
  ArrowDownUp,
  RotateCcw,
  Heading2,
  FileText,
} from 'lucide-react';

type TextTool = 'json' | 'diff' | 'csv' | 'case' | 'counter';

export default function TextToolsPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-sm text-slate-400">Loading Developer Tools...</div>}>
      <TextToolsContent />
    </React.Suspense>
  );
}

function TextToolsContent() {
  const searchParams = useSearchParams();
  const requestedTool = (searchParams.get('tool') as TextTool) || 'json';
  const [activeTool, setActiveTool] = useState<TextTool>('json');

  useEffect(() => {
    const t = searchParams.get('tool') as TextTool;
    if (t === 'json' || t === 'diff' || t === 'csv' || t === 'case' || t === 'counter') {
      setActiveTool(t);
    }
  }, [searchParams]);

  useEffect(() => {
    recordRecentTool(activeTool);
  }, [activeTool]);

  const toolLabels: Record<TextTool, { title: string; subtitle: string }> = {
    json: {
      title: 'Advanced JSON Workspace',
      subtitle: 'Format, validate, beautify, and minify JSON payloads with syntax error detection.',
    },
    diff: {
      title: 'Text & Code Diff Checker',
      subtitle: 'Compare two text snippets side-by-side with color-coded line additions and deletions.',
    },
    csv: {
      title: 'CSV ↔ JSON Converter',
      subtitle: 'Transform spreadsheet CSV records into structured JSON arrays and back in seconds.',
    },
    case: {
      title: 'Case Converter & Text Cleaner',
      subtitle: 'Convert between 12+ naming conventions, remove duplicate lines, and normalize whitespace.',
    },
    counter: {
      title: 'Word Counter & Reading Estimator',
      subtitle: 'Comprehensive text metrics: word count, reading time, speaking duration, and keyword density.',
    },
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Developer & Code', href: '/#category-developer' },
        { label: toolLabels[activeTool].title },
      ]}
      title={toolLabels[activeTool].title}
      subtitle={toolLabels[activeTool].subtitle}
      badge="100% In-Browser"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center overflow-x-auto pb-2">
          <div className="inline-flex bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-1.5 border border-slate-200/80 dark:border-slate-700/80 gap-1 shadow-xs">
            {[
              { id: 'json' as const, icon: Braces, label: 'JSON Workspace' },
              { id: 'diff' as const, icon: GitCompare, label: 'Diff Checker' },
              { id: 'csv' as const, icon: ArrowLeftRight, label: 'CSV ↔ JSON' },
              { id: 'case' as const, icon: Type, label: 'Case Converter' },
              { id: 'counter' as const, icon: FileType, label: 'Word Counter' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTool === t.id
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <t.icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Tool Content */}
        {activeTool === 'json' && <JSONFormatterWorkspace />}
        {activeTool === 'diff' && <DiffCheckerWorkspace />}
        {activeTool === 'csv' && <CsvJsonWorkspace />}
        {activeTool === 'case' && <CaseConverterWorkspace />}
        {activeTool === 'counter' && <WordCounterWorkspace />}
      </div>
    </AppShell>
  );
}

// 1. JSON Workspace
function JSONFormatterWorkspace() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState<2 | 4>(2);
  const [error, setError] = useState<{ message: string; line?: number; column?: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleFormat = (minify = false) => {
    if (!input.trim()) {
      setError({ message: 'Please enter JSON data to format.' });
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent));
      setError(null);
      toast.success(minify ? 'JSON minified!' : 'JSON formatted!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON';
      const posMatch = message.match(/position (\d+)/);
      let line: number | undefined;
      let column: number | undefined;

      if (posMatch && posMatch[1]) {
        const pos = parseInt(posMatch[1], 10);
        const lines = input.slice(0, pos).split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }

      setError({ message, line, column });
      setOutput('');
    }
  };

  const loadSample = () => {
    const sample = {
      project: 'ToolBox Pro',
      version: '2.0.0',
      features: ['client-side processing', 'zero cloud uploads', '24+ tools'],
      active: true,
      metrics: {
        stars: 120,
        latency_ms: 0,
      },
    };
    setInput(JSON.stringify(sample, null, 2));
    setError(null);
  };

  const copyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied JSON to clipboard!');
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'formatted.json';
    a.click();
    toast.success('Downloaded JSON file!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white dark:bg-[#1e1e21] rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
            <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
              Input JSON
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={loadSample}
                className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Sample Data
              </button>
              <button
                onClick={() => {
                  setInput('');
                  setOutput('');
                  setError(null);
                }}
                className="p-1 rounded text-slate-400 hover:text-rose-500"
                title="Clear"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste raw JSON here: {"key": "value"}'
            className="w-full h-80 p-5 font-mono text-xs sm:text-sm bg-transparent resize-y focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-[#1e1e21] rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
            <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
              Formatted Result
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={copyOutput}
                disabled={!output}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 disabled:opacity-40"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={downloadOutput}
                disabled={!output}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 disabled:opacity-40"
              >
                <Download className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          </div>
          <div className="w-full h-80 p-5 overflow-auto font-mono text-xs sm:text-sm">
            {error ? (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400">
                <p className="font-bold mb-1">JSON Syntax Error</p>
                <p className="text-xs leading-relaxed">{error.message}</p>
                {error.line && (
                  <p className="text-xs mt-2 font-mono font-bold">
                    → Line {error.line}, Column {error.column}
                  </p>
                )}
              </div>
            ) : (
              <pre className="text-slate-800 dark:text-slate-200">
                {output || <span className="text-slate-400">Formatted output will appear here...</span>}
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-semibold">
          <button
            onClick={() => setIndent(2)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              indent === 2 ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            2 Spaces
          </button>
          <button
            onClick={() => setIndent(4)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              indent === 4 ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            4 Spaces
          </button>
        </div>

        <button
          onClick={() => handleFormat(false)}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 hover:scale-[1.01] transition-all flex items-center gap-1.5"
        >
          <AlignLeft className="w-4 h-4" />
          <span>Format &amp; Validate</span>
        </button>

        <button
          onClick={() => handleFormat(true)}
          className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5"
        >
          <Minus className="w-4 h-4" />
          <span>Minify (Compact)</span>
        </button>
      </div>
    </div>
  );
}

// 2. Diff Checker Workspace
function DiffCheckerWorkspace() {
  const [leftText, setLeftText] = useState(`function calculateTotal(items) {
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    sum += items[i].price;
  }
  return sum;
}`);

  const [rightText, setRightText] = useState(`function calculateTotal(items) {
  // Use array reduce for cleaner functional code
  return items.reduce((acc, item) => {
    return acc + (item.price || 0);
  }, 0);
}`);

  const diffResult = useMemo(() => {
    return computeLineDiff(leftText, rightText);
  }, [leftText, rightText]);

  const stats = useMemo(() => {
    const added = diffResult.filter((d) => d.type === 'added').length;
    const removed = diffResult.filter((d) => d.type === 'removed').length;
    const unchanged = diffResult.filter((d) => d.type === 'unchanged').length;
    return { added, removed, unchanged };
  }, [diffResult]);

  return (
    <div className="space-y-6">
      {/* Editor Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#1e1e21] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
            Original Text (Before)
          </span>
          <textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            className="w-full h-48 font-mono text-xs bg-slate-50/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none resize-y"
          />
        </div>
        <div className="bg-white dark:bg-[#1e1e21] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
            Modified Text (After)
          </span>
          <textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            className="w-full h-48 font-mono text-xs bg-slate-50/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none resize-y"
          />
        </div>
      </div>

      {/* Diff Stat Badges */}
      <div className="flex items-center justify-between px-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
            +{stats.added} additions
          </span>
          <span className="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900">
            -{stats.removed} deletions
          </span>
          <span className="text-slate-400">{stats.unchanged} unchanged lines</span>
        </div>
      </div>

      {/* Visual Diff View */}
      <div className="bg-white dark:bg-[#1e1e21] rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>Unified Diff Output</span>
        </div>
        <div className="font-mono text-xs overflow-x-auto divide-y divide-slate-100/40 dark:divide-slate-800/40 max-h-96">
          {diffResult.map((line, idx) => (
            <div
              key={idx}
              className={`flex items-start px-4 py-1.5 transition-colors ${
                line.type === 'added'
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold'
                  : line.type === 'removed'
                  ? 'bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="w-8 text-[11px] text-slate-400 select-none flex-shrink-0 text-right pr-3">
                {line.leftLineNumber || ''}
              </span>
              <span className="w-8 text-[11px] text-slate-400 select-none flex-shrink-0 text-right pr-3">
                {line.rightLineNumber || ''}
              </span>
              <span className="w-4 select-none font-bold text-slate-400 flex-shrink-0">
                {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
              </span>
              <pre className="flex-1 whitespace-pre-wrap font-mono">{line.value || ' '}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. CSV ↔ JSON Workspace
function CsvJsonWorkspace() {
  const [csvInput, setCsvInput] = useState(`name,role,department,active\nAlice,Architect,Core,true\nBob,Engineer,Infrastructure,true\nCharlie,Designer,Product,false`);
  const [jsonInput, setJsonInput] = useState('');
  const toast = useToast();

  const handleCsvToJson = () => {
    const res = csvToJson(csvInput);
    if (res.error) {
      toast.error(res.error);
    } else {
      setJsonInput(JSON.stringify(res.data, null, 2));
      toast.success('Converted CSV to JSON!');
    }
  };

  const handleJsonToCsv = () => {
    const res = jsonToCsv(jsonInput);
    if (res.error) {
      toast.error(res.error);
    } else {
      setCsvInput(res.csv);
      toast.success('Converted JSON to CSV!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV */}
        <div className="bg-white dark:bg-[#1e1e21] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">CSV Data</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(csvInput);
                toast.success('Copied CSV!');
              }}
              className="text-[11px] text-brand-600 font-semibold hover:underline"
            >
              Copy
            </button>
          </div>
          <textarea
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            placeholder="name,age,city\nJohn,30,New York"
            className="w-full h-72 font-mono text-xs p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 resize-y focus:outline-none"
          />
        </div>

        {/* JSON */}
        <div className="bg-white dark:bg-[#1e1e21] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">JSON Array</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(jsonInput);
                toast.success('Copied JSON!');
              }}
              className="text-[11px] text-brand-600 font-semibold hover:underline"
            >
              Copy
            </button>
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="[ { &quot;name&quot;: &quot;John&quot;, &quot;age&quot;: 30 } ]"
            className="w-full h-72 font-mono text-xs p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 resize-y focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={handleCsvToJson}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-sm transition-all"
        >
          Convert CSV → JSON
        </button>
        <button
          onClick={handleJsonToCsv}
          className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs transition-all"
        >
          Convert JSON → CSV
        </button>
      </div>
    </div>
  );
}

// 4. Case Converter Workspace
function CaseConverterWorkspace() {
  const [text, setText] = useState('Transform any text into camelCase, snake_case, PascalCase, or clean duplicates.');
  const toast = useToast();

  const cases: Record<string, (s: string) => string> = {
    UPPERCASE: (s) => s.toUpperCase(),
    lowercase: (s) => s.toLowerCase(),
    'Title Case': (s) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
    'Sentence case': (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
    camelCase: (s) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()),
    PascalCase: (s) => s.replace(/(?:^|\s|[-_])\w/g, (c) => c.toUpperCase()).replace(/[\s-_]/g, ''),
    snake_case: (s) => s.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
    'kebab-case': (s) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    CONSTANT_CASE: (s) => s.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, ''),
    'dot.case': (s) => s.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, ''),
    aLtErNaTiNg: (s) => s.split('').map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase())).join(''),
    InVeRsE: (s) => s.split('').map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(''),
  };

  const handleCleanWhitespace = () => {
    setText((prev) => prev.replace(/\s+/g, ' ').trim());
    toast.success('Normalized whitespace!');
  };

  const handleRemoveDuplicateLines = () => {
    const lines = text.split('\n');
    const unique = Array.from(new Set(lines));
    setText(unique.join('\n'));
    toast.success(`Removed ${lines.length - unique.length} duplicate lines!`);
  };

  const convertAndCopy = (name: string) => {
    const fn = cases[name];
    if (!fn || !text) return;
    const res = fn(text);
    navigator.clipboard.writeText(res);
    toast.success(`Copied ${name}!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1e1e21] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Enter Input Text</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCleanWhitespace}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            >
              Trim Spaces
            </button>
            <button
              onClick={handleRemoveDuplicateLines}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            >
              Unique Lines
            </button>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-36 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs sm:text-sm focus:outline-none resize-y"
          placeholder="Type or paste text..."
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Object.keys(cases).map((name) => {
          const fn = cases[name];
          const result = text ? fn(text) : '';
          return (
            <button
              key={name}
              type="button"
              onClick={() => convertAndCopy(name)}
              disabled={!text}
              className="p-4 rounded-2xl bg-white dark:bg-[#1e1e21] border border-slate-200/80 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md text-left transition-all disabled:opacity-50 group"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1 group-hover:text-brand-500 transition-colors">
                {name}
              </span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {result || '—'}
              </p>
              <div className="mt-2 text-[10px] text-brand-600 dark:text-brand-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Copy className="w-3 h-3" />
                <span>Click to copy</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 5. Word Counter Workspace
function WordCounterWorkspace() {
  const [text, setText] = useState('ToolBox Pro offers in-browser file converters, image compressors, developer utilities, and privacy tools with zero server processing.');

  const metrics = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/) : [];
    const wordCount = words.length;
    const charCount = text.length;
    const charNoSpaces = text.replace(/\s/g, '').length;
    const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
    const paragraphCount = text.split(/\n\s*\n/).filter(Boolean).length || (trimmed ? 1 : 0);
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    const speakingTime = Math.max(1, Math.ceil(wordCount / 130));

    const density: Record<string, number> = {};
    words.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean.length > 2) {
        density[clean] = (density[clean] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(density)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return {
      wordCount,
      charCount,
      charNoSpaces,
      sentenceCount,
      paragraphCount,
      readingTime,
      speakingTime,
      topKeywords,
    };
  }, [text]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1e1e21] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
          Your Text Content
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or write your article, essay, or copy here..."
          className="w-full h-44 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs sm:text-sm focus:outline-none resize-y"
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Words', val: metrics.wordCount },
          { label: 'Characters', val: metrics.charCount },
          { label: 'No Spaces', val: metrics.charNoSpaces },
          { label: 'Sentences', val: metrics.sentenceCount },
          { label: 'Paragraphs', val: metrics.paragraphCount },
          { label: 'Reading', val: `${metrics.readingTime} min` },
          { label: 'Speaking', val: `${metrics.speakingTime} min` },
        ].map((item) => (
          <div
            key={item.label}
            className="p-4 rounded-2xl bg-white dark:bg-[#1e1e21] border border-slate-200/80 dark:border-slate-800 text-center"
          >
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">{item.val}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Keyword Density */}
      {metrics.topKeywords.length > 0 && (
        <div className="bg-white dark:bg-[#1e1e21] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Heading2 className="w-3.5 h-3.5 text-brand-500" />
            <span>Keyword Density</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {metrics.topKeywords.map(([word, count]) => (
              <div key={word} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-24 truncate">
                  {word}
                </span>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${(count / metrics.wordCount) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-400 w-16 text-right">
                  {count} ({((count / metrics.wordCount) * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
