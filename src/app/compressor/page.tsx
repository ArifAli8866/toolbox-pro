'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import AppShell from '@/components/AppShell';
import { useToast } from '@/components/Toast';
import { compressImage, formatFileSize, CompressionResult } from '@/lib/imageCompressor';
import { compressPDF } from '@/lib/pdfUtils';
import { saveAs } from 'file-saver';
import { recordRecentTool } from '@/lib/personalization';
import {
  Upload,
  Download,
  Zap,
  Sliders,
  Check,
  X,
  Loader2,
  FileImage,
  FileText,
  Lock,
  Unlock,
  Eye,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

type CompressMode = 'image' | 'pdf';

interface DimensionPreset {
  label: string;
  width?: number;
  height?: number;
}

const presets: DimensionPreset[] = [
  { label: 'Original' },
  { label: '1080p FHD', width: 1920, height: 1080 },
  { label: '720p HD', width: 1280, height: 720 },
  { label: 'Square (1:1)', width: 1080, height: 1080 },
  { label: 'Web Banner', width: 1200, height: 630 },
];

export default function CompressorPage() {
  const [mode, setMode] = useState<CompressMode>('image');
  const [file, setFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [quality, setQuality] = useState(75);
  const [maxWidth, setMaxWidth] = useState('');
  const [maxHeight, setMaxHeight] = useState('');
  const [lockAspect, setLockAspect] = useState(true);
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'webp'>('webp');
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [pdfResult, setPdfResult] = useState<{ originalSize: number; compressedSize: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    recordRecentTool('compressor');
  }, []);

  // Cleanup object URLs when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (originalPreview) URL.revokeObjectURL(originalPreview);
      if (result?.previewUrl) URL.revokeObjectURL(result.previewUrl);
    };
  }, [originalPreview, result]);

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      setError(null);
      setResult(null);
      setPdfResult(null);

      if (mode === 'image' && !selectedFile.type.startsWith('image/')) {
        setError('Please select a valid image file (JPEG, PNG, WEBP, GIF, BMP).');
        return;
      }
      if (mode === 'pdf' && selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
        setError('Please select a valid PDF file.');
        return;
      }

      setFile(selectedFile);

      if (mode === 'image') {
        if (originalPreview) URL.revokeObjectURL(originalPreview);
        const url = URL.createObjectURL(selectedFile);
        setOriginalPreview(url);
      }
    },
    [mode, originalPreview]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) {
        handleFileSelect(dropped);
      }
    },
    [handleFileSelect]
  );

  const applyPreset = (preset: DimensionPreset) => {
    if (!preset.width) {
      setMaxWidth('');
      setMaxHeight('');
    } else {
      setMaxWidth(String(preset.width));
      setMaxHeight(String(preset.height));
    }
  };

  const handleCompress = async () => {
    if (!file) {
      setError('Please select a file to compress.');
      return;
    }

    setCompressing(true);
    setError(null);

    try {
      if (mode === 'image') {
        const res = await compressImage(file, {
          quality: quality / 100,
          maxWidth: maxWidth ? parseInt(maxWidth, 10) : undefined,
          maxHeight: maxHeight ? parseInt(maxHeight, 10) : undefined,
          format: outputFormat,
          maintainAspectRatio: lockAspect,
        });

        setResult(res);
        toast.success(
          res.reductionPercent > 0
            ? `Reduced by ${res.reductionPercent}% (${formatFileSize(res.originalSize)} → ${formatFileSize(res.compressedSize)})`
            : `Image optimized to ${formatFileSize(res.compressedSize)}`
        );
      } else {
        const compressed = await compressPDF(file);
        const blob = new Blob([new Uint8Array(compressed)], { type: 'application/pdf' });
        const originalSize = file.size;
        const compressedSize = compressed.length;
        setPdfResult({ originalSize, compressedSize });

        const name = file.name.replace(/\.pdf$/i, '') + '_optimized.pdf';
        saveAs(blob, name);
        toast.success(`PDF processed and downloaded: ${formatFileSize(compressedSize)}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Compression failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setCompressing(false);
    }
  };

  const handleDownloadResult = () => {
    if (!result || !file) return;
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const finalName = `${baseName}_compressed.${ext}`;
    saveAs(result.blob, finalName);
    toast.success('Downloaded compressed image!');
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: 'File & PDF', href: '/#category-file' },
        { label: 'File Compressor' },
      ]}
      title="File Compressor"
      subtitle="Reduce image and PDF file sizes with instant visual comparisons and granular quality controls."
      badge="Client-Side"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Mode Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-1.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <button
              onClick={() => {
                setMode('image');
                setFile(null);
                setResult(null);
                setPdfResult(null);
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'image'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileImage className="w-4 h-4" />
              <span>Image Compressor</span>
            </button>
            <button
              onClick={() => {
                setMode('pdf');
                setFile(null);
                setResult(null);
                setPdfResult(null);
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'pdf'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>PDF Optimizer</span>
            </button>
          </div>
        </div>

        {/* Compression Controls for Images */}
        {mode === 'image' && (
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Quality Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-500" />
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Target Quality: {quality}%
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    quality >= 80
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      : quality >= 50
                      ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                      : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {quality >= 80 ? 'High Fidelity' : quality >= 50 ? 'Balanced' : 'Maximum Shrink'}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={98}
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                className="w-full"
              />
              <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                <span>Smallest size (10%)</span>
                <span>Recommended (75%)</span>
                <span>Lossless feel (98%)</span>
              </div>
            </div>

            {/* Dimension Presets & Custom Dimensions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Max Dimensions &amp; Presets
                </span>
                <button
                  type="button"
                  onClick={() => setLockAspect(!lockAspect)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg border transition-colors ${
                    lockAspect
                      ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {lockAspect ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  <span>{lockAspect ? 'Aspect Ratio Locked' : 'Freeform Aspect'}</span>
                </button>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2 mb-3">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                    Max Width (px)
                  </label>
                  <input
                    type="number"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(e.target.value)}
                    placeholder="Auto (original)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                    Max Height (px)
                  </label>
                  <input
                    type="number"
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(e.target.value)}
                    placeholder="Auto (original)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Target Output Format */}
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mb-2.5">
                Output Format
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'webp' as const, label: 'WEBP', hint: 'Best web compression' },
                  { id: 'jpeg' as const, label: 'JPEG', hint: 'Universal photos' },
                  { id: 'png' as const, label: 'PNG', hint: 'Retains transparency' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setOutputFormat(fmt.id)}
                    className={`flex-1 min-w-[120px] p-2.5 rounded-xl border text-left transition-all ${
                      outputFormat === fmt.id
                        ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/30 text-brand-900 dark:text-brand-200 shadow-xs ring-1 ring-brand-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{fmt.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{fmt.hint}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer bg-white dark:bg-[#0f172a] ${
            dragOver
              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={mode === 'image' ? 'image/*' : '.pdf,application/pdf'}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Upload className="w-6 h-6" />
          </div>

          <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            {file ? file.name : `Drop your ${mode === 'image' ? 'image' : 'PDF'} here or click to browse`}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {file
              ? `Original Size: ${formatFileSize(file.size)}`
              : mode === 'image'
              ? 'Supports PNG, JPEG, WEBP, BMP, GIF up to 200MB'
              : 'Supports standard PDF documents up to 100MB'}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleCompress}
            disabled={!file || compressing}
            className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-600 hover:from-emerald-500 hover:to-brand-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {compressing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Optimizing Client-Side...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Compress &amp; Optimize Now</span>
              </>
            )}
          </button>

          {error && (
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 px-4 py-2.5 rounded-xl">
              <X className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Before and After Visual Comparison Results */}
        {result && mode === 'image' && (
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 animate-slide-up shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Compression Complete
                </h3>
              </div>
              <button
                onClick={handleDownloadResult}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Result</span>
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-center">
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-0.5">
                  Original
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {formatFileSize(result.originalSize)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {result.originalWidth} × {result.originalHeight}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-0.5">
                  Compressed
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatFileSize(result.compressedSize)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {result.outputWidth} × {result.outputHeight}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-0.5">
                  Space Saved
                </span>
                <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                  {result.reductionPercent}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  -{formatFileSize(Math.max(0, result.originalSize - result.compressedSize))}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-0.5">
                  Format
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase">
                  {outputFormat}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {quality}% quality
                </span>
              </div>
            </div>

            {/* Side by Side Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900">
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>Before (Original)</span>
                  <span>{formatFileSize(result.originalSize)}</span>
                </div>
                <div className="p-4 flex items-center justify-center min-h-[220px]">
                  {originalPreview && (
                    <img
                      src={originalPreview}
                      alt="Original image before compression"
                      className="max-h-60 max-w-full rounded-lg object-contain shadow-xs"
                    />
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 overflow-hidden bg-slate-50 dark:bg-slate-900">
                <div className="px-4 py-2 border-b border-emerald-100 dark:border-emerald-900/50 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
                  <span>After (Optimized)</span>
                  <span>{formatFileSize(result.compressedSize)}</span>
                </div>
                <div className="p-4 flex items-center justify-center min-h-[220px]">
                  <img
                    src={result.previewUrl}
                    alt="Optimized compressed result"
                    className="max-h-60 max-w-full rounded-lg object-contain shadow-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Compression Result */}
        {pdfResult && mode === 'pdf' && (
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-4 animate-slide-up shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600">
              <Check className="w-5 h-5" />
              <h3 className="font-bold text-base">PDF Optimization Finished</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Original Size</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatFileSize(pdfResult.originalSize)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">Optimized Size</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatFileSize(pdfResult.compressedSize)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">Status</span>
                <span className="font-bold text-brand-600 dark:text-brand-400">
                  Downloaded
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
