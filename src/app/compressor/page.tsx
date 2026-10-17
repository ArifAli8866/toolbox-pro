'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import AppShell from '@/components/AppShell';
import { useToast } from '@/components/Toast';
import {
  compressImage,
  formatFileSize,
  CompressionResult,
  createCompressedImagesZip,
} from '@/lib/imageCompressor';
import { compressPDF } from '@/lib/pdfUtils';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
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
  Trash2,
  Plus,
  Archive,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

type CompressMode = 'image' | 'pdf';

interface ImageQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'idle' | 'compressing' | 'done' | 'error';
  result?: CompressionResult;
  error?: string;
}

interface PdfQueueItem {
  id: string;
  file: File;
  status: 'idle' | 'compressing' | 'done' | 'error';
  originalSize: number;
  compressedSize?: number;
  compressedData?: Uint8Array;
  error?: string;
}

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

  // Image queue
  const [imageQueue, setImageQueue] = useState<ImageQueueItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // PDF queue
  const [pdfQueue, setPdfQueue] = useState<PdfQueueItem[]>([]);

  // Image compression options
  const [quality, setQuality] = useState(75);
  const [maxWidth, setMaxWidth] = useState('');
  const [maxHeight, setMaxHeight] = useState('');
  const [lockAspect, setLockAspect] = useState(true);
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'webp'>('webp');

  // Batch states
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    recordRecentTool('compressor');
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imageQueue.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.result?.previewUrl) URL.revokeObjectURL(item.result.previewUrl);
      });
    };
  }, [imageQueue]);

  const addFilesToQueue = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files);
      if (incoming.length === 0) return;

      if (mode === 'image') {
        const validImages = incoming.filter((f) => f.type.startsWith('image/'));
        const invalidCount = incoming.length - validImages.length;

        if (invalidCount > 0) {
          toast.error(`Skipped ${invalidCount} non-image file(s).`);
        }

        if (validImages.length === 0) return;

        const newItems: ImageQueueItem[] = validImages.map((file) => ({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          status: 'idle',
        }));

        setImageQueue((prev) => {
          const next = [...prev, ...newItems];
          if (!selectedImageId && next.length > 0) {
            setSelectedImageId(next[0].id);
          }
          return next;
        });

        toast.success(`Added ${validImages.length} image(s) to compression queue`);
      } else {
        const validPdfs = incoming.filter(
          (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        );
        const invalidCount = incoming.length - validPdfs.length;

        if (invalidCount > 0) {
          toast.error(`Skipped ${invalidCount} non-PDF file(s).`);
        }

        if (validPdfs.length === 0) return;

        const newItems: PdfQueueItem[] = validPdfs.map((file) => ({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          status: 'idle',
          originalSize: file.size,
        }));

        setPdfQueue((prev) => [...prev, ...newItems]);
        toast.success(`Added ${validPdfs.length} PDF(s) to queue`);
      }
    },
    [mode, selectedImageId, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files) {
        addFilesToQueue(e.dataTransfer.files);
      }
    },
    [addFilesToQueue]
  );

  const removeImageItem = (id: string) => {
    setImageQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.result?.previewUrl) URL.revokeObjectURL(item.result.previewUrl);
      }
      const filtered = prev.filter((i) => i.id !== id);
      if (selectedImageId === id) {
        setSelectedImageId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const removePdfItem = (id: string) => {
    setPdfQueue((prev) => prev.filter((i) => i.id !== id));
  };

  const clearQueue = () => {
    if (mode === 'image') {
      imageQueue.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.result?.previewUrl) URL.revokeObjectURL(item.result.previewUrl);
      });
      setImageQueue([]);
      setSelectedImageId(null);
    } else {
      setPdfQueue([]);
    }
  };

  const applyPreset = (preset: DimensionPreset) => {
    if (!preset.width) {
      setMaxWidth('');
      setMaxHeight('');
    } else {
      setMaxWidth(String(preset.width));
      setMaxHeight(String(preset.height));
    }
  };

  // Compress all images in queue
  const handleCompressImages = async () => {
    if (imageQueue.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;
    let failCount = 0;

    const total = imageQueue.length;

    for (let i = 0; i < total; i++) {
      const current = imageQueue[i];
      setProgressText(`Compressing ${i + 1} of ${total}: ${current.file.name}...`);

      setImageQueue((prev) =>
        prev.map((item) => (item.id === current.id ? { ...item, status: 'compressing' } : item))
      );

      try {
        const res = await compressImage(current.file, {
          quality: quality / 100,
          maxWidth: maxWidth ? parseInt(maxWidth, 10) : undefined,
          maxHeight: maxHeight ? parseInt(maxHeight, 10) : undefined,
          format: outputFormat,
          maintainAspectRatio: lockAspect,
        });

        setImageQueue((prev) =>
          prev.map((item) =>
            item.id === current.id ? { ...item, status: 'done', result: res, error: undefined } : item
          )
        );
        successCount++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Compression failed';
        setImageQueue((prev) =>
          prev.map((item) =>
            item.id === current.id ? { ...item, status: 'error', error: msg } : item
          )
        );
        failCount++;
      }
    }

    setIsProcessing(false);
    setProgressText('');

    if (failCount === 0) {
      toast.success(`Successfully compressed all ${successCount} image(s)!`);
    } else {
      toast.info(`Compressed ${successCount} image(s); ${failCount} failed.`);
    }
  };

  // Optimize all PDFs in queue
  const handleOptimizePdfs = async () => {
    if (pdfQueue.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;
    let failCount = 0;

    const total = pdfQueue.length;

    for (let i = 0; i < total; i++) {
      const current = pdfQueue[i];
      setProgressText(`Optimizing ${i + 1} of ${total}: ${current.file.name}...`);

      setPdfQueue((prev) =>
        prev.map((item) => (item.id === current.id ? { ...item, status: 'compressing' } : item))
      );

      try {
        const compressed = await compressPDF(current.file);
        setPdfQueue((prev) =>
          prev.map((item) =>
            item.id === current.id
              ? {
                  ...item,
                  status: 'done',
                  compressedSize: compressed.length,
                  compressedData: compressed,
                  error: undefined,
                }
              : item
          )
        );
        successCount++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'PDF optimization failed';
        setPdfQueue((prev) =>
          prev.map((item) =>
            item.id === current.id ? { ...item, status: 'error', error: msg } : item
          )
        );
        failCount++;
      }
    }

    setIsProcessing(false);
    setProgressText('');

    if (failCount === 0) {
      toast.success(`Successfully optimized all ${successCount} PDF(s)!`);
    } else {
      toast.info(`Optimized ${successCount} PDF(s); ${failCount} failed.`);
    }
  };

  // Download single image
  const handleDownloadSingleImage = (item: ImageQueueItem) => {
    if (!item.result) return;
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    const baseName = item.file.name.replace(/\.[^.]+$/, '');
    saveAs(item.result.blob, `${baseName}_optimized.${ext}`);
    toast.success(`Downloaded ${baseName}_optimized.${ext}`);
  };

  // Download all images as ZIP
  const handleDownloadImagesZip = async () => {
    const doneItems = imageQueue.filter((i) => i.status === 'done' && i.result);
    if (doneItems.length === 0) return;

    try {
      const zipBlob = await createCompressedImagesZip(
        doneItems.map((item) => ({
          file: item.file,
          blob: item.result!.blob,
          format: outputFormat,
        }))
      );
      saveAs(zipBlob, `compressed_images_${Date.now()}.zip`);
      toast.success(`Downloaded ${doneItems.length} images as ZIP archive`);
    } catch {
      toast.error('Failed to create ZIP archive.');
    }
  };

  // Download single PDF
  const handleDownloadSinglePdf = (item: PdfQueueItem) => {
    if (!item.compressedData) return;
    const blob = new Blob([new Uint8Array(item.compressedData)], { type: 'application/pdf' });
    const baseName = item.file.name.replace(/\.pdf$/i, '');
    saveAs(blob, `${baseName}_optimized.pdf`);
    toast.success(`Downloaded ${baseName}_optimized.pdf`);
  };

  // Download all PDFs as ZIP
  const handleDownloadPdfsZip = async () => {
    const doneItems = pdfQueue.filter((i) => i.status === 'done' && i.compressedData);
    if (doneItems.length === 0) return;

    try {
      const zip = new JSZip();
      doneItems.forEach((item) => {
        const baseName = item.file.name.replace(/\.pdf$/i, '');
        zip.file(`${baseName}_optimized.pdf`, item.compressedData!);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `optimized_pdfs_${Date.now()}.zip`);
      toast.success(`Downloaded ${doneItems.length} PDFs as ZIP archive`);
    } catch {
      toast.error('Failed to create PDF ZIP archive.');
    }
  };

  // Compute aggregate stats for images
  const totalImageOriginalBytes = imageQueue.reduce((acc, i) => acc + i.file.size, 0);
  const doneImages = imageQueue.filter((i) => i.status === 'done' && i.result);
  const totalImageCompressedBytes = doneImages.reduce(
    (acc, i) => acc + (i.result?.compressedSize || 0),
    0
  );
  const totalImageDoneOriginalBytes = doneImages.reduce((acc, i) => acc + i.file.size, 0);
  const overallImageReduction =
    totalImageDoneOriginalBytes > 0
      ? Math.max(
          0,
          Math.round(
            ((totalImageDoneOriginalBytes - totalImageCompressedBytes) /
              totalImageDoneOriginalBytes) *
              100
          )
        )
      : 0;

  // Selected item for Before/After view
  const activeImage =
    imageQueue.find((i) => i.id === selectedImageId) || (imageQueue.length > 0 ? imageQueue[0] : null);

  return (
    <AppShell
      breadcrumbs={[
        { label: 'File & PDF', href: '/#category-file' },
        { label: 'File Compressor' },
      ]}
      title="File Compressor"
      subtitle="Reduce image and PDF file sizes client-side with multi-file batch queues, instant side-by-side previews, and granular quality controls."
      badge="Multi-File Batch"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Mode Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-1.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <button
              onClick={() => {
                setMode('image');
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'image'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileImage className="w-4 h-4" />
              <span>Multi-Image Compressor</span>
              {imageQueue.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 text-[11px] rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold">
                  {imageQueue.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setMode('pdf');
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'pdf'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>PDF Optimizer</span>
              {pdfQueue.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 text-[11px] rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold">
                  {pdfQueue.length}
                </span>
              )}
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
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
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
                className="w-full accent-brand-600"
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
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
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
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer bg-white dark:bg-[#0f172a] ${
            dragOver
              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={mode === 'image' ? 'image/*' : '.pdf,application/pdf'}
            onChange={(e) => {
              if (e.target.files) addFilesToQueue(e.target.files);
              e.target.value = '';
            }}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Upload className="w-6 h-6" />
          </div>

          <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            Drop multiple {mode === 'image' ? 'images' : 'PDFs'} here or click to browse
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mode === 'image'
              ? 'Select single or multiple PNG, JPEG, WEBP, BMP, GIF files (Shift/Ctrl+click)'
              : 'Select one or more PDF documents to optimize'}
          </p>
        </div>

        {/* Hidden input for "Add More" */}
        <input
          ref={addMoreInputRef}
          type="file"
          multiple
          accept={mode === 'image' ? 'image/*' : '.pdf,application/pdf'}
          onChange={(e) => {
            if (e.target.files) addFilesToQueue(e.target.files);
            e.target.value = '';
          }}
          className="hidden"
        />

        {/* IMAGE QUEUE SECTION */}
        {mode === 'image' && imageQueue.length > 0 && (
          <div className="space-y-6">
            {/* Queue Header & Actions */}
            <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Image Queue ({imageQueue.length})
                    </h3>
                    {doneImages.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        {doneImages.length} of {imageQueue.length} optimized
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Total queue size: {formatFileSize(totalImageOriginalBytes)}
                    {doneImages.length > 0 && (
                      <>
                        {' '}
                        → {formatFileSize(totalImageCompressedBytes)} (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          -{overallImageReduction}% space saved
                        </span>
                        )
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => addMoreInputRef.current?.click()}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add More</span>
                  </button>

                  <button
                    onClick={clearQueue}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Queue</span>
                  </button>

                  {doneImages.length > 1 && (
                    <button
                      onClick={handleDownloadImagesZip}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Download All as ZIP</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress indicator during batch */}
              {isProcessing && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-medium text-brand-600 dark:text-brand-400 mb-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{progressText}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-500 h-full transition-all duration-300"
                      style={{
                        width: `${Math.round(
                          (imageQueue.filter((i) => i.status === 'done' || i.status === 'error')
                            .length /
                            imageQueue.length) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Primary Batch Action */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                <button
                  onClick={handleCompressImages}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-600 hover:from-emerald-500 hover:to-brand-500 text-white font-bold text-sm shadow-md shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Optimizing {imageQueue.length} Images...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>
                        {doneImages.length > 0 ? 'Re-compress' : 'Compress'} All ({imageQueue.length}{' '}
                        images)
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Queue Item List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {imageQueue.map((item, idx) => {
                const isSelected = activeImage?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedImageId(item.id)}
                    className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 ring-2 ring-brand-500/20 shadow-xs'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0f172a] hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60">
                        {item.previewUrl ? (
                          <img
                            src={item.previewUrl}
                            alt={item.file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileImage className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                            #{idx + 1}
                          </span>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {item.file.name}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {formatFileSize(item.file.size)}
                        </p>

                        {/* Status / Reduction */}
                        <div className="mt-1.5">
                          {item.status === 'compressing' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Compressing...</span>
                            </span>
                          )}
                          {item.status === 'done' && item.result && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                                -{item.result.reductionPercent}%
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                {formatFileSize(item.result.compressedSize)}
                              </span>
                            </div>
                          )}
                          {item.status === 'error' && (
                            <span className="text-[10px] text-rose-500 font-semibold truncate block">
                              {item.error || 'Failed'}
                            </span>
                          )}
                          {item.status === 'idle' && (
                            <span className="text-[10px] text-slate-400">Ready to compress</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImageItem(item.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {/* Bottom Action inside card */}
                    {item.status === 'done' && item.result && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">
                          {isSelected ? 'Viewing comparison' : 'Click to inspect'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadSingleImage(item);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Before and After Visual Comparison Results for Active Selected Item */}
            {activeImage && activeImage.status === 'done' && activeImage.result && (
              <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs animate-slide-up">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        Inspecting: {activeImage.file.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Side-by-side Before/After inspection with pixel metrics
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadSingleImage(activeImage)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download this Image</span>
                  </button>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-center">
                  <div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-0.5">
                      Original
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {formatFileSize(activeImage.result.originalSize)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {activeImage.result.originalWidth} × {activeImage.result.originalHeight}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-0.5">
                      Optimized
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatFileSize(activeImage.result.compressedSize)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {activeImage.result.outputWidth} × {activeImage.result.outputHeight}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-0.5">
                      Space Saved
                    </span>
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                      {activeImage.result.reductionPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      -
                      {formatFileSize(
                        Math.max(
                          0,
                          activeImage.result.originalSize - activeImage.result.compressedSize
                        )
                      )}
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
                      <span>{formatFileSize(activeImage.result.originalSize)}</span>
                    </div>
                    <div className="p-4 flex items-center justify-center min-h-[220px]">
                      {activeImage.previewUrl && (
                        <img
                          src={activeImage.previewUrl}
                          alt="Original image before compression"
                          className="max-h-60 max-w-full rounded-lg object-contain shadow-xs"
                        />
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 overflow-hidden bg-slate-50 dark:bg-slate-900">
                    <div className="px-4 py-2 border-b border-emerald-100 dark:border-emerald-900/50 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
                      <span>After (Optimized)</span>
                      <span>{formatFileSize(activeImage.result.compressedSize)}</span>
                    </div>
                    <div className="p-4 flex items-center justify-center min-h-[220px]">
                      <img
                        src={activeImage.result.previewUrl}
                        alt="Optimized compressed result"
                        className="max-h-60 max-w-full rounded-lg object-contain shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PDF QUEUE SECTION */}
        {mode === 'pdf' && pdfQueue.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    PDF Optimization Queue ({pdfQueue.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Linearize streams and remove unreferenced structures client-side
                  </p>
                </div>

                <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => addMoreInputRef.current?.click()}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add More</span>
                  </button>

                  <button
                    onClick={clearQueue}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>

                  {pdfQueue.filter((i) => i.status === 'done').length > 1 && (
                    <button
                      onClick={handleDownloadPdfsZip}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Download All ZIP</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress */}
              {isProcessing && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-medium text-brand-600 dark:text-brand-400 mb-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{progressText}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-500 h-full transition-all duration-300"
                      style={{
                        width: `${Math.round(
                          (pdfQueue.filter((i) => i.status === 'done' || i.status === 'error')
                            .length /
                            pdfQueue.length) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                <button
                  onClick={handleOptimizePdfs}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-600 hover:from-emerald-500 hover:to-brand-500 text-white font-bold text-sm shadow-md shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Optimizing {pdfQueue.length} PDFs...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Optimize All ({pdfQueue.length} PDFs)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* PDF Item List */}
            <div className="space-y-2.5">
              {pdfQueue.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 flex items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                          {item.file.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>Original: {formatFileSize(item.originalSize)}</span>
                        {item.compressedSize && (
                          <>
                            <span>→</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {formatFileSize(item.compressedSize)}
                            </span>
                          </>
                        )}
                        {item.status === 'compressing' && (
                          <span className="text-brand-600 dark:text-brand-400 font-medium flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Optimizing...
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span className="text-rose-500 font-medium">{item.error}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.status === 'done' && item.compressedData && (
                      <button
                        onClick={() => handleDownloadSinglePdf(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    )}
                    <button
                      onClick={() => removePdfItem(item.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Remove PDF"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
