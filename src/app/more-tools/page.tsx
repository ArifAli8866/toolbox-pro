'use client';

import { useState, useEffect, useMemo, useCallback, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { ToastProvider, useToast } from '@/components/Toast';
import {
  Camera, Coins, FileText, Download, Loader2, Copy, Check,
  ArrowRightLeft, RefreshCw, Sparkles, FolderArchive, History,
  Trash2, UploadCloud, FileIcon, ArrowRight
} from 'lucide-react';
import { generateFaviconPack, createFaviconZip, FaviconItem } from '@/lib/faviconGenerator';
import { computeRenamedFiles, createBatchRenamedZip, BatchRenameRule, RenamedFilePreview } from '@/lib/batchRenamer';
import { getWorkflowHistory, recordWorkflow, clearWorkflowHistory, WorkflowRecord } from '@/lib/workflowHistory';
import { formatFileSize } from '@/lib/imageCompressor';

type MoreToolTab = 'favicon' | 'batch' | 'screenshot' | 'currency' | 'markdown' | 'history';

export default function MoreToolsPage() {
  return (
    <ToastProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      }>
        <MoreToolsContent />
      </Suspense>
    </ToastProvider>
  );
}

function MoreToolsContent() {
  const searchParams = useSearchParams();
  const requestedTool = searchParams.get('tool') as MoreToolTab | null;

  const validTabs: MoreToolTab[] = ['favicon', 'batch', 'screenshot', 'currency', 'markdown', 'history'];
  const initialTab: MoreToolTab = requestedTool && validTabs.includes(requestedTool) ? requestedTool : 'favicon';

  const [activeTab, setActiveTab] = useState<MoreToolTab>(initialTab);

  useEffect(() => {
    if (requestedTool && validTabs.includes(requestedTool)) {
      setActiveTab(requestedTool);
    }
  }, [requestedTool]);

  const tabs: Array<{ id: MoreToolTab; label: string; icon: any; badge?: string }> = [
    { id: 'favicon', label: 'Favicon Studio', icon: Sparkles, badge: 'New' },
    { id: 'batch', label: 'Batch Renamer', icon: FolderArchive, badge: 'ZIP' },
    { id: 'screenshot', label: 'Web Screenshot', icon: Camera },
    { id: 'currency', label: 'Currency & Units', icon: Coins },
    { id: 'markdown', label: 'Markdown Editor', icon: FileText },
    { id: 'history', label: 'Activity Log', icon: History },
  ];

  return (
    <AppShell
      title="Productivity & Batch Utilities"
      subtitle="Asset generation, multi-file batch workflows, unit conversions, and live markdown preview."
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Productivity', href: '/more-tools' },
      ]}
    >
      <div className="space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold shadow-sm border border-brand-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    tab.badge === 'New'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes */}
        {activeTab === 'favicon' && <FaviconGeneratorTool />}
        {activeTab === 'batch' && <BatchRenamerTool />}
        {activeTab === 'screenshot' && <ScreenshotGeneratorTool />}
        {activeTab === 'currency' && <CurrencyUnitConverterTool />}
        {activeTab === 'markdown' && <MarkdownPreviewerTool />}
        {activeTab === 'history' && <ActivityHistoryTool />}
      </div>
    </AppShell>
  );
}

// ==========================================
// 1. FAVICON GENERATOR TOOL
// ==========================================
function FaviconGeneratorTool() {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [favicons, setFavicons] = useState<FaviconItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, SVG, WebP)');
      return;
    }
    setSourceImage(file);
    const url = URL.createObjectURL(file);
    setPreviewSrc(url);
    generateIcons(file);
  };

  const generateIcons = async (file: File) => {
    setGenerating(true);
    try {
      const items = await generateFaviconPack(file);
      setFavicons(items);
      recordWorkflow({
        toolId: 'favicon',
        toolName: 'Favicon Generator',
        action: `Generated ${items.length} favicon sizes for ${file.name}`,
        itemCount: items.length,
        status: 'success',
      });
      toast.success(`Generated ${items.length} favicon assets!`);
    } catch {
      toast.error('Failed to generate favicons. Please try another image.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadZip = async () => {
    if (favicons.length === 0) return;
    setZipping(true);
    try {
      const zipBlob = await createFaviconZip(favicons);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'favicon_pack.zip';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Downloaded favicon_pack.zip with HTML tags!');
    } catch {
      toast.error('Failed to bundle ZIP package');
    } finally {
      setZipping(false);
    }
  };

  const handleDownloadSingle = (icon: FaviconItem) => {
    const a = document.createElement('a');
    a.href = icon.dataUrl;
    a.download = icon.name;
    a.click();
  };

  const htmlTags = `<!-- Favicon Package generated with Toolbox Pro -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">`;

  const copyTags = () => {
    navigator.clipboard.writeText(htmlTags);
    setCopiedSnippet(true);
    toast.success('HTML snippet copied to clipboard!');
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) loadFile(file);
        }}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-400 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-white dark:bg-slate-900 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
          {sourceImage ? sourceImage.name : 'Choose an image or drop it here'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Square SVG or high-resolution PNG (512x512 or higher recommended) for crisp rendering across retina displays.
        </p>
      </div>

      {generating && (
        <div className="flex items-center justify-center gap-3 py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Rendering multi-size favicon package...</span>
        </div>
      )}

      {favicons.length > 0 && !generating && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Generated Icons ({favicons.length})</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ready for modern browsers, iOS Home Screen, and Android PWA.</p>
            </div>
            <button
              onClick={handleDownloadZip}
              disabled={zipping}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {zipping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download All as ZIP
            </button>
          </div>

          {/* Grid of Favicon Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favicons.map((icon) => (
              <div
                key={icon.name}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between hover:border-brand-500/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-1.5 border border-slate-200 dark:border-slate-700">
                    <img
                      src={icon.dataUrl}
                      alt={icon.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">{icon.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{icon.size}x{icon.size} • {icon.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadSingle(icon)}
                  className="p-2 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Download single file"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* HTML Snippet Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                HTML &lt;head&gt; tags
              </span>
              <button
                onClick={copyTags}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSnippet ? 'Copied' : 'Copy HTML'}
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre">
              {htmlTags}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. BATCH RENAMER TOOL
// ==========================================
function BatchRenamerTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [rule, setRule] = useState<BatchRenameRule>({
    mode: 'prefix-suffix',
    prefix: '',
    suffix: '',
    findText: '',
    replaceText: '',
    caseType: 'lower',
    startNumber: 1,
    paddingDigits: 3,
    basePattern: '{name}_{n}',
  });
  const [zipping, setZipping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const array = Array.from(incoming);
    setFiles((prev) => [...prev, ...array]);
    toast.success(`Added ${array.length} file(s) to queue`);
  };

  const previews = useMemo<RenamedFilePreview[]>(() => {
    return computeRenamedFiles(files, rule);
  }, [files, rule]);

  const handleDownloadZip = async () => {
    if (previews.length === 0) return;
    setZipping(true);
    try {
      const zipBlob = await createBatchRenamedZip(previews);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'renamed_files.zip';
      a.click();
      URL.revokeObjectURL(url);

      recordWorkflow({
        toolId: 'batch',
        toolName: 'Batch Renamer',
        action: `Batch renamed and archived ${previews.length} files`,
        itemCount: previews.length,
        status: 'success',
      });

      toast.success(`Downloaded ${previews.length} renamed files in ZIP!`);
    } catch {
      toast.error('Failed to create ZIP');
    } finally {
      setZipping(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Upload files */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-white dark:bg-slate-900 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
          <FolderArchive className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Drop multiple files here or click to browse
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Supports any file format (photos, documents, assets). Processed locally with 0 server uploads.
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-6">
          {/* Controls Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Batch Renaming Rules</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configure formatting rule to apply to all {files.length} files.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFiles([])}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Mode selector */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'prefix-suffix' as const, label: 'Prefix & Suffix' },
                { id: 'replace' as const, label: 'Find & Replace' },
                { id: 'numbering' as const, label: 'Sequential Numbering' },
                { id: 'case' as const, label: 'Case Convert' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setRule((prev) => ({ ...prev, mode: m.id }))}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    rule.mode === m.id
                      ? 'bg-brand-600 text-white font-semibold shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Conditional input fields */}
            {rule.mode === 'prefix-suffix' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Prefix to add</label>
                  <input
                    type="text"
                    value={rule.prefix || ''}
                    onChange={(e) => setRule((prev) => ({ ...prev, prefix: e.target.value }))}
                    placeholder="e.g. 2026_"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Suffix to add</label>
                  <input
                    type="text"
                    value={rule.suffix || ''}
                    onChange={(e) => setRule((prev) => ({ ...prev, suffix: e.target.value }))}
                    placeholder="e.g. _v1"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            )}

            {rule.mode === 'replace' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Find Text</label>
                  <input
                    type="text"
                    value={rule.findText || ''}
                    onChange={(e) => setRule((prev) => ({ ...prev, findText: e.target.value }))}
                    placeholder="e.g. IMG_"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Replace With</label>
                  <input
                    type="text"
                    value={rule.replaceText || ''}
                    onChange={(e) => setRule((prev) => ({ ...prev, replaceText: e.target.value }))}
                    placeholder="e.g. photo_"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            )}

            {rule.mode === 'numbering' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Pattern</label>
                  <input
                    type="text"
                    value={rule.basePattern || '{name}_{n}'}
                    onChange={(e) => setRule((prev) => ({ ...prev, basePattern: e.target.value }))}
                    placeholder="{name}_{n}"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Start Number</label>
                  <input
                    type="number"
                    value={rule.startNumber || 1}
                    onChange={(e) => setRule((prev) => ({ ...prev, startNumber: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Digits (Padding)</label>
                  <select
                    value={rule.paddingDigits || 3}
                    onChange={(e) => setRule((prev) => ({ ...prev, paddingDigits: parseInt(e.target.value) || 3 }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500"
                  >
                    <option value={1}>1 (1, 2, 3...)</option>
                    <option value={2}>2 (01, 02, 03...)</option>
                    <option value={3}>3 (001, 002, 003...)</option>
                    <option value={4}>4 (0001, 0002...)</option>
                  </select>
                </div>
              </div>
            )}

            {rule.mode === 'case' && (
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Case Transform</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'lower' as const, label: 'lowercase' },
                    { id: 'upper' as const, label: 'UPPERCASE' },
                    { id: 'kebab' as const, label: 'kebab-case' },
                    { id: 'snake' as const, label: 'snake_case' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setRule((prev) => ({ ...prev, caseType: c.id }))}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        rule.caseType === c.id
                          ? 'bg-brand-600 text-white font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Table Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Rename Preview ({previews.length} items)
              </span>
              <button
                onClick={handleDownloadZip}
                disabled={zipping}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
              >
                {zipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Download ZIP
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
              {previews.map((item, idx) => (
                <div key={item.id} className="p-3.5 sm:px-5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <FileIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="font-mono text-slate-500 truncate max-w-[200px]" title={item.originalName}>
                      {item.originalName}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-mono font-semibold text-brand-600 dark:text-brand-400 truncate max-w-[240px]" title={item.newName}>
                      {item.newName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px]">{formatFileSize(item.size)}</span>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. SCREENSHOT GENERATOR TOOL
// ==========================================
function ScreenshotGeneratorTool() {
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
      const shotUrl = `https://api.microlink.io/?url=${encodeURIComponent(target)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1280&viewport.height=720`;
      const img = new Image();
      img.onload = () => {
        setImgUrl(shotUrl);
        setLoading(false);
        recordWorkflow({
          toolId: 'screenshot',
          toolName: 'Website Screenshot',
          action: `Captured screenshot for ${target}`,
          status: 'success',
        });
        toast.success('Screenshot captured!');
      };
      img.onerror = () => {
        setLoading(false);
        toast.error('Failed to capture screenshot. The target site may block automated rendering.');
      };
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div>
          <label className="font-medium text-slate-800 dark:text-slate-200 mb-2 block text-sm">Target Website URL</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
              placeholder="e.g. github.com or https://example.com"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={generate}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Capturing...</> : <><Camera className="w-4 h-4" /> Capture</>}
            </button>
          </div>
        </div>
      </div>

      {imgUrl && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4 animate-in fade-in duration-300">
          <img src={imgUrl} alt="Screenshot" className="mx-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-md max-w-full" />
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={download}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" /> Download PNG
            </button>
            <button
              onClick={copyUrl}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied URL' : 'Copy Image URL'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. CURRENCY & UNIT CONVERTER TOOL
// ==========================================
function CurrencyUnitConverterTool() {
  const [mode, setMode] = useState<'currency' | 'unit'>('currency');
  const toast = useToast();

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
      if (data.rates) {
        setRates(data.rates);
        toast.success('Live exchange rates updated!');
      }
    } catch {
      toast.error('Could not load live rates, using cached baseline');
      // Fallback baseline
      setRates({ USD: 1, EUR: 0.92, GBP: 0.78, JPY: 154.2, CAD: 1.36, AUD: 1.52, CHF: 0.9, CNY: 7.23, INR: 83.4 });
    } finally {
      setLoadingRates(false);
    }
  }, [toast]);

  useEffect(() => {
    if (mode === 'currency' && Object.keys(rates).length === 0) {
      fetchRates();
    }
  }, [mode, rates, fetchRates]);

  const currencyResult = useMemo(() => {
    const amt = parseFloat(curAmount) || 0;
    if (!rates[fromCur] || !rates[toCur]) return '0.00';
    const usd = amt / rates[fromCur];
    return (usd * rates[toCur]).toFixed(2);
  }, [curAmount, fromCur, toCur, rates]);

  // Unit categories
  const unitCategories = {
    length: { label: 'Length', units: { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001, Mile: 1609.34, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254 } },
    weight: { label: 'Weight', units: { Gram: 1, Kilogram: 1000, Milligram: 0.001, Pound: 453.592, Ounce: 28.3495, Tonne: 1000000 } },
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
      let celsius: number;
      if (fromUnit === 'Celsius') celsius = amt;
      else if (fromUnit === 'Fahrenheit') celsius = ((amt - 32) * 5) / 9;
      else celsius = amt - 273.15;

      if (toUnit === 'Celsius') return celsius.toFixed(2);
      if (toUnit === 'Fahrenheit') return ((celsius * 9) / 5 + 32).toFixed(2);
      return (celsius + 273.15).toFixed(2);
    }
    const baseValue = amt * category.units[fromUnit as keyof typeof category.units];
    return (baseValue / category.units[toUnit as keyof typeof category.units]).toFixed(4);
  }, [unitAmount, fromUnit, toUnit, cat]);

  const currencyList = Object.keys(rates).sort();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setMode('currency')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              mode === 'currency'
                ? 'bg-white dark:bg-slate-900 shadow-sm text-brand-600 dark:text-brand-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Coins className="w-4 h-4" /> Currency
          </button>
          <button
            onClick={() => setMode('unit')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              mode === 'unit'
                ? 'bg-white dark:bg-slate-900 shadow-sm text-brand-600 dark:text-brand-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" /> Units & Measures
          </button>
        </div>
      </div>

      {mode === 'currency' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Live Forex Exchange Rates</h3>
            <button
              onClick={fetchRates}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRates ? 'animate-spin' : ''}`} /> Refresh rates
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">From Amount</label>
              <input
                type="number"
                value={curAmount}
                onChange={(e) => setCurAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500"
              />
              <select
                value={fromCur}
                onChange={(e) => setFromCur(e.target.value)}
                className="w-full mt-2 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500"
              >
                {currencyList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Converted Value</label>
              <input
                type="text"
                readOnly
                value={currencyResult}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-emerald-600 dark:text-emerald-400 text-sm"
              />
              <select
                value={toCur}
                onChange={(e) => setToCur(e.target.value)}
                className="w-full mt-2 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500"
              >
                {currencyList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3.5 bg-brand-500/10 rounded-xl text-center text-sm text-slate-700 dark:text-slate-300">
            <span className="font-semibold">{curAmount || 0} {fromCur}</span> = <span className="font-bold text-brand-600 dark:text-brand-400">{currencyResult} {toCur}</span>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Unit Converter</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(unitCategories).map(([key, val]) => (
              <button
                key={key}
                onClick={() => switchCategory(key as keyof typeof unitCategories)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  cat === key
                    ? 'bg-brand-600 text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {val.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">From Unit</label>
              <input
                type="number"
                value={unitAmount}
                onChange={(e) => setUnitAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500 mb-2"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500"
              >
                {Object.keys(unitCategories[cat].units).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">To Unit</label>
              <input
                type="text"
                readOnly
                value={unitResult}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-emerald-600 dark:text-emerald-400 text-sm mb-2"
              />
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500"
              >
                {Object.keys(unitCategories[cat].units).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3.5 bg-brand-500/10 rounded-xl text-center text-sm text-slate-700 dark:text-slate-300">
            <span className="font-semibold">{unitAmount || 0} {fromUnit}</span> = <span className="font-bold text-brand-600 dark:text-brand-400">{unitResult} {toUnit}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. MARKDOWN PREVIEWER TOOL
// ==========================================
function MarkdownPreviewerTool() {
  const [markdown, setMarkdown] = useState(`# Live Markdown Studio ⚡

Welcome to the **Toolbox Pro** live editor.

### Features
- Real-time sanitized rendering via **DOMPurify**
- GitHub Flavored Markdown (tables, checklists, code blocks)
- One-click HTML export and copy

\`\`\`typescript
interface UserSession {
  id: string;
  name: string;
  role: 'admin' | 'creator';
}
\`\`\`

> All document transformations execute locally inside your browser with 100% privacy.

| Utility | Status | Engine |
| :--- | :--- | :--- |
| Markdown Parser | Online | Marked.js |
| HTML Sanitizer | Active | DOMPurify |
| Export | Ready | Client-side |
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
        if (!cancelled) setHtml('<p class="text-rose-500">Error parsing markdown document</p>');
      }
    })();
    return () => { cancelled = true; };
  }, [markdown]);

  const copyHtml = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Sanitized HTML copied to clipboard!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <span className="font-semibold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Markdown Input
          </span>
          <button
            onClick={() => setMarkdown('')}
            className="text-xs text-slate-500 hover:text-rose-500 transition-colors"
          >
            Clear
          </button>
        </div>
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className="w-full h-[450px] p-4 font-mono text-xs sm:text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 resize-none focus:outline-none"
          spellCheck={false}
          placeholder="Type or paste markdown content here..."
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <span className="font-semibold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Live Preview (HTML)
          </span>
          <button
            onClick={copyHtml}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy HTML'}
          </button>
        </div>
        <div
          className="markdown-preview w-full h-[450px] p-5 overflow-auto bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm leading-relaxed prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

// ==========================================
// 6. ACTIVITY HISTORY TOOL
// ==========================================
function ActivityHistoryTool() {
  const [history, setHistory] = useState<WorkflowRecord[]>([]);
  const toast = useToast();

  const loadHistory = useCallback(() => {
    setHistory(getWorkflowHistory());
  }, []);

  useEffect(() => {
    loadHistory();
    const handleRecorded = () => loadHistory();
    window.addEventListener('toolbox:workflow_recorded', handleRecorded);
    window.addEventListener('toolbox:workflow_cleared', handleRecorded);
    return () => {
      window.removeEventListener('toolbox:workflow_recorded', handleRecorded);
      window.removeEventListener('toolbox:workflow_cleared', handleRecorded);
    };
  }, [loadHistory]);

  const handleClear = () => {
    clearWorkflowHistory();
    toast.success('Activity log cleared');
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Local Activity & Workflow Log</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recent browser operations stored strictly in localStorage. Never sent to any server.
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Log
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <History className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
            No activity recorded yet. Run any tool to populate your local workflow log.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {history.map((record) => (
              <div key={record.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{record.toolName}</div>
                  <div className="text-slate-600 dark:text-slate-400 mt-0.5">{record.action}</div>
                </div>
                <div className="text-right text-[11px] text-slate-400 flex-shrink-0">
                  {formatDate(record.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
