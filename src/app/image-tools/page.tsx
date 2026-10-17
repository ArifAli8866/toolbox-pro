'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useToast } from '@/components/Toast';
import { recordRecentTool } from '@/lib/personalization';
import {
  Eraser,
  ScanText,
  Upload,
  Download,
  Loader2,
  Copy,
  Check,
  Sparkles,
  FileText,
  RefreshCw,
  Eye,
  X,
} from 'lucide-react';

type ImageTool = 'bg-remover' | 'ocr';

export default function ImageToolsPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-sm text-slate-400">Loading AI Studio...</div>}>
      <ImageToolsContent />
    </React.Suspense>
  );
}

function ImageToolsContent() {
  const searchParams = useSearchParams();
  const initialTool = searchParams.get('tool') === 'ocr' ? 'ocr' : 'bg-remover';
  const [activeTool, setActiveTool] = useState<ImageTool>(initialTool);

  useEffect(() => {
    const t = searchParams.get('tool');
    if (t === 'ocr' || t === 'bg-remover') {
      setActiveTool(t);
    }
  }, [searchParams]);

  useEffect(() => {
    recordRecentTool(activeTool === 'ocr' ? 'ocr' : 'bg-remover');
  }, [activeTool]);

  return (
    <AppShell
      breadcrumbs={[
        { label: 'AI Studio', href: '/#category-ai' },
        { label: activeTool === 'bg-remover' ? 'Background Remover' : 'Image to Text (OCR)' },
      ]}
      title={activeTool === 'bg-remover' ? 'AI Background Remover' : 'Image to Text OCR Engine'}
      subtitle={
        activeTool === 'bg-remover'
          ? 'Extract foreground subjects and create crisp transparent PNGs entirely in your browser memory.'
          : 'Extract high-accuracy text, labels, and numbers from scanned documents, screenshots, and photos.'
      }
      badge="100% Client AI"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Tool Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-1.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <button
              onClick={() => setActiveTool('bg-remover')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTool === 'bg-remover'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eraser className="w-4 h-4" />
              <span>Background Remover</span>
            </button>
            <button
              onClick={() => setActiveTool('ocr')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTool === 'ocr'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ScanText className="w-4 h-4" />
              <span>Image to Text (OCR)</span>
            </button>
          </div>
        </div>

        {activeTool === 'bg-remover' ? <BackgroundRemoverView /> : <ImageToTextView />}
      </div>
    </AppShell>
  );
}

function BackgroundRemoverView() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [originalUrl, resultUrl]);

  const handleFile = useCallback(
    (f: File) => {
      if (!f.type.startsWith('image/')) {
        toast.error('Please upload a valid image file (PNG, JPG, WEBP).');
        return;
      }
      setFile(f);
      setResultUrl(null);
      setProgress(0);
      setStatusText('');
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      const url = URL.createObjectURL(f);
      setOriginalUrl(url);
    },
    [originalUrl, toast]
  );

  const processImage = async () => {
    if (!file) {
      toast.warning('Please select an image first.');
      return;
    }
    setProcessing(true);
    setProgress(5);
    setStatusText('Initializing in-browser neural model...');

    try {
      const { removeBackground } = await import('@imgly/background-removal');
      setStatusText('Processing image tensors...');

      const blob = await removeBackground(file, {
        progress: (_key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100);
            setProgress(pct);
            setStatusText(`Processing subject masks: ${pct}%`);
          }
        },
      });

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      toast.success('Background removed with transparent alpha!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process image';
      toast.error(msg);
    } finally {
      setProcessing(false);
      setStatusText('');
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = (file?.name.replace(/\.[^.]+$/, '') || 'cutout') + '_transparent.png';
    a.click();
    toast.success('Downloaded transparent PNG!');
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer bg-white dark:bg-[#0f172a] ${
          dragOver
            ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/20'
            : 'border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        {originalUrl ? (
          <div className="max-w-xs mx-auto">
            <img
              src={originalUrl}
              alt="Selected original image"
              className="max-h-48 rounded-xl mx-auto shadow-md object-contain mb-3"
            />
            <p className="text-xs text-slate-500 truncate">{file?.name}</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-950 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
              Drop an image here or click to browse
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Photos with people, products, animals, or clear objects work best
            </p>
          </>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={processImage}
        disabled={!file || processing}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-brand-600 hover:from-fuchsia-500 hover:to-brand-500 text-white font-bold text-sm shadow-lg shadow-fuchsia-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{statusText || `Processing model... ${progress}%`}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Remove Background (100% In-Browser)</span>
          </>
        )}
      </button>

      {/* Progress Bar */}
      {processing && (
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-fuchsia-500 to-brand-500 transition-all duration-300"
            style={{ width: `${Math.max(progress, 5)}%` }}
          />
        </div>
      )}

      {/* Result Split View with Checkered Background */}
      {resultUrl && (
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 animate-slide-up shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              <span>Transparent Cutout Ready</span>
            </h3>
            <button
              onClick={downloadResult}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="text-center">
              <span className="text-xs font-semibold text-slate-500 block mb-2">Original</span>
              <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-4 flex items-center justify-center min-h-[240px]">
                {originalUrl && (
                  <img
                    src={originalUrl}
                    alt="Original source image"
                    className="max-h-56 max-w-full rounded-xl object-contain shadow-xs"
                  />
                )}
              </div>
            </div>

            <div className="text-center">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-2">
                Transparent Background (Alpha)
              </span>
              <div
                className="rounded-2xl p-4 flex items-center justify-center min-h-[240px] border border-slate-200 dark:border-slate-800"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                }}
              >
                <img
                  src={resultUrl}
                  alt="Transparent foreground cutout"
                  className="max-h-56 max-w-full rounded-xl object-contain drop-shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info disclosure */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
        <strong>Privacy Note:</strong> All image processing, mask calculations, and background removals are performed purely inside your browser memory using WebAssembly. No image data or metadata is ever transmitted across the internet.
      </div>
    </div>
  );
}

function ImageToTextView() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('eng');
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const handleFile = useCallback(
    (f: File) => {
      if (!f.type.startsWith('image/')) {
        toast.error('Please upload an image with text.');
        return;
      }
      setFile(f);
      setText('');
      setProgressText('');
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      setImageUrl(URL.createObjectURL(f));
    },
    [imageUrl, toast]
  );

  const processOCR = async () => {
    if (!file) {
      toast.warning('Select an image with text first.');
      return;
    }

    setProcessing(true);
    setProgressText('Booting Tesseract OCR worker...');

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker(language, 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            setProgressText(`Recognizing characters: ${Math.round(m.progress * 100)}%`);
          } else if (m.status === 'loading tesseract core') {
            setProgressText('Loading OCR neural core...');
          }
        },
      });

      const {
        data: { text: extractedText },
      } = await worker.recognize(file);

      setText(extractedText);
      await worker.terminate();

      if (extractedText.trim()) {
        toast.success('Text extracted successfully!');
      } else {
        toast.warning('No legible text recognized in this image.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'OCR failed';
      toast.error(msg);
    } finally {
      setProcessing(false);
      setProgressText('');
    }
  };

  const copyText = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied text to clipboard!');
  };

  const downloadText = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (file?.name.replace(/\.[^.]+$/, '') || 'extracted_text') + '.txt';
    a.click();
    toast.success('Saved text file!');
  };

  return (
    <div className="space-y-6">
      {/* Settings Row */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ScanText className="w-4 h-4 text-brand-500" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Recognition Language
          </span>
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500"
        >
          <option value="eng">English (eng)</option>
          <option value="spa">Spanish (spa)</option>
          <option value="fra">French (fra)</option>
          <option value="deu">German (deu)</option>
        </select>
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer bg-white dark:bg-[#0f172a] ${
          dragOver
            ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/20'
            : 'border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        {imageUrl ? (
          <div className="max-w-xs mx-auto">
            <img
              src={imageUrl}
              alt="Uploaded document or photo"
              className="max-h-48 rounded-xl mx-auto shadow-md object-contain mb-3"
            />
            <p className="text-xs text-slate-500 truncate">{file?.name}</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
              Drop an image with text here or click to browse
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Scanned documents, bills, screenshots, signboards, book pages
            </p>
          </>
        )}
      </div>

      {/* Process Button */}
      <button
        onClick={processOCR}
        disabled={!file || processing}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{progressText || 'Extracting characters...'}</span>
          </>
        ) : (
          <>
            <ScanText className="w-5 h-5" />
            <span>Extract Text (Tesseract OCR)</span>
          </>
        )}
      </button>

      {/* Extracted Output Area */}
      {text && (
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm animate-slide-up">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-500" />
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Extracted Text ({text.trim().length} characters, {text.trim().split(/\s+/).filter(Boolean).length} words)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={downloadText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save .txt</span>
              </button>
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-72 p-6 font-mono text-xs sm:text-sm bg-transparent resize-y focus:outline-none text-slate-800 dark:text-slate-100 leading-relaxed"
            placeholder="Extracted text will appear here..."
          />
        </div>
      )}
    </div>
  );
}
