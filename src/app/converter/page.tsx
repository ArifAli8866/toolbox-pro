'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import AppShell from '@/components/AppShell';
import { useToast } from '@/components/Toast';
import {
  convertImage,
  convertImages,
  createConvertedImagesZip,
  ImageFormat,
  getExtensionFromFormat,
  ConvertedImageResult,
} from '@/lib/imageConverter';
import { formatFileSize } from '@/lib/imageCompressor';
import {
  mergePDFs,
  extractPDFPages,
  splitPDF,
  rotatePDFPages,
  getPDFPageCount,
} from '@/lib/pdfUtils';
import { imagesToPdf, pdfToImages, ImagesToPdfOptions } from '@/lib/pdfConverter';
import { saveAs } from 'file-saver';
import { recordRecentTool } from '@/lib/personalization';
import { recordWorkflow } from '@/lib/workflowHistory';
import JSZip from 'jszip';
import {
  Upload,
  Download,
  FileText,
  Image as ImageIcon,
  ArrowLeftRight,
  Layers,
  Scissors,
  RotateCw,
  FileMinus,
  Loader2,
  X,
  Check,
  Lock,
  FileArchive,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Eye,
  Settings2,
} from 'lucide-react';

type ConversionMode =
  | 'image'
  | 'image-to-pdf'
  | 'pdf-to-image'
  | 'pdf-merge'
  | 'pdf-extract'
  | 'pdf-split'
  | 'pdf-rotate'
  | 'pdf-password';

interface FileQueueItem {
  id: string;
  file: File;
  previewUrl?: string;
  pageCount?: number;
  status: 'queued' | 'converting' | 'done' | 'error';
  error?: string;
}

const modes = [
  { id: 'image' as const, icon: ImageIcon, label: 'Image Format', desc: 'Batch PNG, JPG, WEBP, BMP, GIF' },
  { id: 'image-to-pdf' as const, icon: FileText, label: 'Images → PDF', desc: 'Combine & reorder photos into 1 PDF' },
  { id: 'pdf-to-image' as const, icon: ImageIcon, label: 'PDF → Images', desc: 'Extract pages as crisp PNGs/ZIP' },
  { id: 'pdf-merge' as const, icon: Layers, label: 'Merge PDFs', desc: 'Combine multiple documents in order' },
  { id: 'pdf-extract' as const, icon: Scissors, label: 'Extract Pages', desc: 'Extract page range' },
  { id: 'pdf-split' as const, icon: FileMinus, label: 'Split PDF', desc: 'Split into separate files' },
  { id: 'pdf-rotate' as const, icon: RotateCw, label: 'Rotate Pages', desc: '90°, 180°, 270° orientation' },
  { id: 'pdf-password' as const, icon: Lock, label: 'Encrypt PDF', desc: '256-bit AES password lock' },
];

const imageFormats: ImageFormat[] = ['png', 'jpeg', 'webp', 'bmp', 'gif'];

export default function ConverterPage() {
  const [mode, setMode] = useState<ConversionMode>('image');
  const [queue, setQueue] = useState<FileQueueItem[]>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  // Conversion options
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('png');
  const [imageQuality, setImageQuality] = useState(92);
  const [pdfPageSize, setPdfPageSize] = useState<'fit' | 'a4'>('fit');
  const [pdfMargin, setPdfMargin] = useState<number>(0);
  const [extractStart, setExtractStart] = useState(1);
  const [extractEnd, setExtractEnd] = useState(1);
  const [rotation, setRotation] = useState(90);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [pdfPassword, setPdfPassword] = useState('');

  // Results state
  const [convertedImages, setConvertedImages] = useState<ConvertedImageResult[]>([]);
  const [extractedPages, setExtractedPages] = useState<Array<{ pageNum: number; blob: Blob; url: string }>>([]);
  const [combinedPdfBlob, setCombinedPdfBlob] = useState<{ blob: Blob; name: string; size: number } | null>(null);
  const [singleResult, setSingleResult] = useState<{ name: string; size: number; count?: number } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    recordRecentTool('converter');
  }, []);

  // Cleanup object URLs when queue or results change
  useEffect(() => {
    return () => {
      queue.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      convertedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      extractedPages.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [queue, convertedImages, extractedPages]);

  const validateAndAddFiles = useCallback(
    (newFiles: File[]) => {
      setError(null);
      if (newFiles.length === 0) return;

      const isImageMode = mode === 'image' || mode === 'image-to-pdf';
      const validItems: FileQueueItem[] = [];
      const invalidNames: string[] = [];

      for (const file of newFiles) {
        if (isImageMode) {
          if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif|svg)$/i.test(file.name)) {
            const previewUrl = URL.createObjectURL(file);
            validItems.push({
              id: `${file.name}-${file.size}-${Math.random()}`,
              file,
              previewUrl,
              status: 'queued',
            });
          } else {
            invalidNames.push(file.name);
          }
        } else {
          // PDF modes
          if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            validItems.push({
              id: `${file.name}-${file.size}-${Math.random()}`,
              file,
              status: 'queued',
            });
          } else {
            invalidNames.push(file.name);
          }
        }
      }

      if (invalidNames.length > 0) {
        toast.error(
          `Skipped ${invalidNames.length} unsupported file(s): ${invalidNames.slice(0, 2).join(', ')}${
            invalidNames.length > 2 ? '...' : ''
          }`
        );
      }

      if (validItems.length === 0) return;

      // Single-file modes vs multi-file modes
      const isMultiFileMode = mode === 'image' || mode === 'image-to-pdf' || mode === 'pdf-merge';

      if (isMultiFileMode) {
        setQueue((prev) => [...prev, ...validItems]);
        // Read page counts for PDFs in merge mode
        if (mode === 'pdf-merge') {
          validItems.forEach((item) => {
            getPDFPageCount(item.file)
              .then((count) => {
                setQueue((curr) =>
                  curr.map((q) => (q.id === item.id ? { ...q, pageCount: count } : q))
                );
              })
              .catch(() => {});
          });
        }
      } else {
        // Single file mode: take only the first valid file
        setQueue([validItems[0]]);
        if (mode === 'pdf-extract' || mode === 'pdf-split' || mode === 'pdf-rotate' || mode === 'pdf-to-image') {
          getPDFPageCount(validItems[0].file)
            .then((count) => {
              setPdfPageCount(count);
              setExtractStart(1);
              setExtractEnd(Math.min(count, 5));
            })
            .catch(() => setPdfPageCount(null));
        }
      }

      // Reset previous results
      setConvertedImages([]);
      setExtractedPages([]);
      setCombinedPdfBlob(null);
      setSingleResult(null);
    },
    [mode, toast]
  );

  const removeQueueItem = (index: number) => {
    setQueue((prev) => {
      const item = prev[index];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const moveQueueItem = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= queue.length) return;

    setQueue((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const clearQueue = () => {
    queue.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setQueue([]);
    setConvertedImages([]);
    setExtractedPages([]);
    setCombinedPdfBlob(null);
    setSingleResult(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (queue.length === 0) {
      setError('Please add at least one file to convert.');
      return;
    }

    setConverting(true);
    setError(null);
    setProgress({ current: 0, total: queue.length });

    try {
      const rawFiles = queue.map((q) => q.file);

      // ============================================
      // 1. IMAGE FORMAT CONVERSION (BATCH OR SINGLE)
      // ============================================
      if (mode === 'image') {
        const results = await convertImages(
          rawFiles,
          targetFormat,
          imageQuality / 100,
          (current, total) => setProgress({ current, total })
        );

        if (results.length === 0) {
          throw new Error('Image conversion produced no valid files.');
        }

        setConvertedImages(results);

        // If only 1 file, auto-save as well
        if (results.length === 1) {
          saveAs(results[0].blob, results[0].outputName);
        }

        recordWorkflow({
          toolId: 'converter-image',
          toolName: 'Image Converter',
          action: `Converted ${results.length} image(s) to ${targetFormat.toUpperCase()}`,
          itemCount: results.length,
          status: 'success',
        });

        toast.success(`Converted ${results.length} image(s) to ${targetFormat.toUpperCase()}!`);
      }

      // ============================================
      // 2. IMAGES TO SINGLE COMBINED PDF (ORDERED)
      // ============================================
      else if (mode === 'image-to-pdf') {
        const options: ImagesToPdfOptions = {
          pageSize: pdfPageSize,
          margin: pdfMargin,
          orientation: 'auto',
          onProgress: (current, total) => setProgress({ current, total }),
        };

        const pdfBytes = await imagesToPdf(rawFiles, options);
        const name =
          rawFiles.length === 1
            ? rawFiles[0].name.replace(/\.[^.]+$/, '') + '.pdf'
            : 'combined_images_document.pdf';
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

        setCombinedPdfBlob({ blob, name, size: blob.size });
        saveAs(blob, name);

        recordWorkflow({
          toolId: 'converter-image-to-pdf',
          toolName: 'Images to PDF',
          action: `Created combined PDF with ${rawFiles.length} page(s) in selected order`,
          itemCount: rawFiles.length,
          status: 'success',
        });

        toast.success(`Combined ${rawFiles.length} images into ${name}!`);
      }

      // ============================================
      // 3. PDF TO IMAGES (EXTRACTION)
      // ============================================
      else if (mode === 'pdf-to-image') {
        const file = rawFiles[0];
        const pageBlobs = await pdfToImages(file, 'png', 30);

        if (pageBlobs.length === 0) {
          throw new Error('No pages could be extracted from PDF.');
        }

        const pages = pageBlobs.map((blob, idx) => ({
          pageNum: idx + 1,
          blob,
          url: URL.createObjectURL(blob),
        }));

        setExtractedPages(pages);

        // If 1 page, download directly; otherwise notify user of ZIP option
        if (pages.length === 1) {
          saveAs(pages[0].blob, `${file.name.replace(/\.pdf$/i, '')}_page_1.png`);
        }

        recordWorkflow({
          toolId: 'converter-pdf-to-image',
          toolName: 'PDF to Images',
          action: `Extracted ${pages.length} pages from ${file.name}`,
          itemCount: pages.length,
          status: 'success',
        });

        toast.success(`Extracted ${pages.length} page(s) as crisp PNG images!`);
      }

      // ============================================
      // 4. MERGE MULTIPLE PDFS (ORDERED)
      // ============================================
      else if (mode === 'pdf-merge') {
        if (rawFiles.length < 2) {
          throw new Error('Please select at least 2 PDF documents to merge.');
        }

        const merged = await mergePDFs(rawFiles);
        const name = 'merged_document.pdf';
        const blob = new Blob([new Uint8Array(merged)], { type: 'application/pdf' });

        saveAs(blob, name);
        setSingleResult({ name, size: blob.size, count: rawFiles.length });

        recordWorkflow({
          toolId: 'converter-pdf-merge',
          toolName: 'PDF Merger',
          action: `Merged ${rawFiles.length} PDFs into one combined document`,
          itemCount: rawFiles.length,
          status: 'success',
        });

        toast.success(`Merged ${rawFiles.length} PDFs into one document!`);
      }

      // ============================================
      // 5. EXTRACT PDF PAGES
      // ============================================
      else if (mode === 'pdf-extract') {
        const extracted = await extractPDFPages(rawFiles[0], extractStart, extractEnd);
        const name = `${rawFiles[0].name.replace(/\.pdf$/i, '')}_p${extractStart}-p${extractEnd}.pdf`;
        const blob = new Blob([new Uint8Array(extracted)], { type: 'application/pdf' });

        saveAs(blob, name);
        setSingleResult({ name, size: blob.size });
        toast.success(`Extracted pages ${extractStart} to ${extractEnd}!`);
      }

      // ============================================
      // 6. SPLIT PDF INTO PAGES
      // ============================================
      else if (mode === 'pdf-split') {
        const pages = await splitPDF(rawFiles[0]);
        const zip = new JSZip();

        pages.forEach((page, idx) => {
          zip.file(`page_${idx + 1}.pdf`, page);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipName = `${rawFiles[0].name.replace(/\.pdf$/i, '')}_split_pages.zip`;
        saveAs(zipBlob, zipName);

        setSingleResult({
          name: zipName,
          size: zipBlob.size,
          count: pages.length,
        });

        toast.success(`Split PDF into ${pages.length} documents (downloaded as ZIP)!`);
      }

      // ============================================
      // 7. ROTATE PDF PAGES
      // ============================================
      else if (mode === 'pdf-rotate') {
        const rotated = await rotatePDFPages(rawFiles[0], rotation);
        const name = `${rawFiles[0].name.replace(/\.pdf$/i, '')}_rotated_${rotation}deg.pdf`;
        const blob = new Blob([new Uint8Array(rotated)], { type: 'application/pdf' });

        saveAs(blob, name);
        setSingleResult({ name, size: blob.size });
        toast.success(`Rotated all pages by ${rotation}°!`);
      }

      // ============================================
      // 8. ENCRYPT PDF PASSWORD
      // ============================================
      else if (mode === 'pdf-password') {
        if (!pdfPassword.trim()) {
          throw new Error('Please enter a password to encrypt the PDF.');
        }

        const { encryptPDF } = await import('@pdfsmaller/pdf-encrypt-lite');
        const pdfBytes = new Uint8Array(await rawFiles[0].arrayBuffer());
        const encryptedBytes = await encryptPDF(pdfBytes, pdfPassword);
        const name = `${rawFiles[0].name.replace(/\.pdf$/i, '')}_protected.pdf`;
        const blob = new Blob([new Uint8Array(encryptedBytes)], { type: 'application/pdf' });

        saveAs(blob, name);
        setSingleResult({ name, size: blob.size });
        toast.success('PDF successfully password protected!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Conversion failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setConverting(false);
      setProgress(null);
    }
  };

  const handleDownloadAllConvertedZip = async () => {
    if (convertedImages.length === 0) return;
    try {
      const zipBlob = await createConvertedImagesZip(convertedImages);
      saveAs(zipBlob, `converted_images_${targetFormat}.zip`);
      toast.success('Downloaded all converted images in ZIP!');
    } catch {
      toast.error('Failed to bundle ZIP archive.');
    }
  };

  const handleDownloadAllExtractedZip = async () => {
    if (extractedPages.length === 0) return;
    try {
      const zip = new JSZip();
      extractedPages.forEach((p) => {
        zip.file(`page_${p.pageNum}.png`, p.blob);
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'extracted_pdf_pages.zip');
      toast.success('Downloaded all extracted pages in ZIP!');
    } catch {
      toast.error('Failed to bundle ZIP archive.');
    }
  };

  const isMultiFileMode = mode === 'image' || mode === 'image-to-pdf' || mode === 'pdf-merge';

  return (
    <AppShell
      breadcrumbs={[
        { label: 'File & PDF', href: '/#category-file' },
        { label: 'File Converter' },
      ]}
      title="Universal File Converter"
      subtitle="Convert formats, merge multi-page documents, extract pages, and password-lock PDFs with zero server uploads."
      badge="Client-Side"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Mode Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m.id);
                  clearQueue();
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/40 shadow-sm ring-1 ring-brand-500'
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1e1e21] shadow-saas-card hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mb-2 ${
                    isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <div
                  className={`text-xs sm:text-sm font-bold ${
                    isSelected ? 'text-brand-900 dark:text-brand-100' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {m.label}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {m.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Mode Settings */}

        {/* 1. Image Format Settings */}
        {mode === 'image' && (
          <div className="bg-white dark:bg-[#1e1e21] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                  Target Output Format
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Select which format all {queue.length > 0 ? queue.length : ''} images will be converted to.
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {imageFormats.map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setTargetFormat(fmt)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      targetFormat === fmt
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {getExtensionFromFormat(fmt).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {targetFormat !== 'png' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Quality Compression: <span className="font-bold text-brand-600">{imageQuality}%</span>
                </span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={imageQuality}
                  onChange={(e) => setImageQuality(parseInt(e.target.value, 10))}
                  className="w-48 accent-brand-600"
                />
              </div>
            )}
          </div>
        )}

        {/* 2. Image to PDF Settings */}
        {mode === 'image-to-pdf' && (
          <div className="bg-white dark:bg-[#1e1e21] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Settings2 className="w-4 h-4 text-brand-500" />
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                PDF Layout Configuration
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
                  Page Sizing Mode
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPdfPageSize('fit')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      pdfPageSize === 'fit'
                        ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Fit Original Photos
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfPageSize('a4')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      pdfPageSize === 'a4'
                        ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Standard A4 Document
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
                  Page Margin
                </label>
                <div className="flex gap-2">
                  {[
                    { label: 'None (0)', val: 0 },
                    { label: 'Compact', val: 16 },
                    { label: 'Normal', val: 28 },
                  ].map((m) => (
                    <button
                      key={m.val}
                      type="button"
                      onClick={() => setPdfMargin(m.val)}
                      className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                        pdfMargin === m.val
                          ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              💡 Reorder the images below to control which photo appears as Page 1, Page 2, etc. in the combined PDF.
            </p>
          </div>
        )}

        {/* 3. PDF Extract Settings */}
        {mode === 'pdf-extract' && pdfPageCount && (
          <div className="bg-white dark:bg-[#1e1e21] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
              Page Range Selection (Document has {pdfPageCount} pages)
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">From Page</label>
                <input
                  type="number"
                  min="1"
                  max={extractEnd}
                  value={extractStart}
                  onChange={(e) => setExtractStart(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">To Page</label>
                <input
                  type="number"
                  min={extractStart}
                  max={pdfPageCount}
                  value={extractEnd}
                  onChange={(e) =>
                    setExtractEnd(Math.min(pdfPageCount, parseInt(e.target.value) || extractStart))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. PDF Rotate Settings */}
        {mode === 'pdf-rotate' && (
          <div className="bg-white dark:bg-[#1e1e21] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
              Rotation Degree
            </span>
            <div className="flex gap-2">
              {[90, 180, 270].map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => setRotation(deg)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    rotation === deg
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  +{deg}° Clockwise
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. PDF Password Settings */}
        {mode === 'pdf-password' && (
          <div className="bg-white dark:bg-[#1e1e21] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
              Set Document Protection Password
            </span>
            <input
              type="text"
              value={pdfPassword}
              onChange={(e) => setPdfPassword(e.target.value)}
              placeholder="Enter secure password..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Uses AES-256 military-grade encryption. PDF viewers will prompt for this key on opening.
            </p>
          </div>
        )}

        {/* File Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files) {
              validateAndAddFiles(Array.from(e.dataTransfer.files));
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer bg-white dark:bg-[#1e1e21] ${
            dragOver
              ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={isMultiFileMode}
            accept={mode === 'image' || mode === 'image-to-pdf' ? 'image/*' : '.pdf,application/pdf'}
            onChange={(e) => {
              if (e.target.files) {
                validateAndAddFiles(Array.from(e.target.files));
                e.target.value = ''; // Reset input to allow re-selecting same files
              }
            }}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Upload className="w-6 h-6" />
          </div>

          <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            {queue.length > 0
              ? `${queue.length} file${queue.length > 1 ? 's' : ''} loaded`
              : 'Drop your files here or click to browse'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mode === 'image'
              ? 'Select multiple photos (PNG, JPG, WEBP, BMP, GIF) to batch-convert'
              : mode === 'image-to-pdf'
              ? 'Select multiple photos to combine into 1 PDF (reorder anytime)'
              : mode === 'pdf-merge'
              ? 'Select multiple PDFs to merge in custom order'
              : 'Upload a PDF document to process'}
          </p>
        </div>

        {/* Selected Files Queue with Thumbnails and Reorder */}
        {queue.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                File Queue ({queue.length})
                {mode === 'image-to-pdf' && ' — Reorder photos to set PDF page order'}
              </span>
              <div className="flex items-center gap-3">
                {isMultiFileMode && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add More Files
                  </button>
                )}
                {queue.length > 1 && (
                  <button
                    type="button"
                    onClick={clearQueue}
                    className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* List of files in queue */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {queue.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#1e1e21] border border-slate-100 dark:border-slate-800 shadow-xs hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Mode specific badge / page indicator */}
                    {mode === 'image-to-pdf' ? (
                      <span className="w-16 flex-shrink-0 text-[10px] font-bold text-center px-1.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                        Page {index + 1}
                      </span>
                    ) : mode === 'pdf-merge' ? (
                      <span className="w-14 flex-shrink-0 text-[10px] font-bold text-center px-1.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        Doc {index + 1}
                      </span>
                    ) : null}

                    {/* Thumbnail preview for images */}
                    {item.previewUrl ? (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500">
                        <FileText className="w-5 h-5 text-brand-500" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate" title={item.file.name}>
                        {item.file.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{formatFileSize(item.file.size)}</span>
                        {item.pageCount && <span>• {item.pageCount} pages</span>}
                      </div>
                    </div>
                  </div>

                  {/* Reordering and Actions */}
                  <div className="flex items-center gap-1">
                    {(mode === 'image-to-pdf' || mode === 'pdf-merge') && queue.length > 1 && (
                      <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2 mr-1">
                        <button
                          type="button"
                          onClick={() => moveQueueItem(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded-lg text-slate-400 hover:text-brand-600 disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Move earlier"
                          aria-label={`Move ${item.file.name} up`}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveQueueItem(index, 'down')}
                          disabled={index === queue.length - 1}
                          className="p-1 rounded-lg text-slate-400 hover:text-brand-600 disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Move later"
                          aria-label={`Move ${item.file.name} down`}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeQueueItem(index)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      aria-label={`Remove ${item.file.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Convert Action Button and Live Progress */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleConvert}
            disabled={queue.length === 0 || converting}
            className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-brand-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {converting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {progress && progress.total > 0
                    ? `Processing ${progress.current} of ${progress.total}...`
                    : 'Processing Client-Side...'}
                </span>
              </>
            ) : (
              <>
                <ArrowLeftRight className="w-4 h-4" />
                <span>
                  {mode === 'image-to-pdf'
                    ? `Convert to PDF (${queue.length} photo${queue.length === 1 ? '' : 's'})`
                    : mode === 'image'
                    ? `Convert All to ${targetFormat.toUpperCase()} (${queue.length} image${queue.length === 1 ? '' : 's'})`
                    : mode === 'pdf-merge'
                    ? `Merge into 1 Document (${queue.length} PDFs)`
                    : `Process File`}
                </span>
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

        {/* ============================================
            RESULTS SECTION
            ============================================ */}

        {/* 1. Combined PDF Result (Images to PDF or PDF Merge) */}
        {combinedPdfBlob && (
          <div className="bg-white dark:bg-[#1e1e21] rounded-2xl border border-emerald-200 dark:border-emerald-800/80 p-6 shadow-sm space-y-4 animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Combined PDF Document Ready!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {combinedPdfBlob.name} ({formatFileSize(combinedPdfBlob.size)})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => saveAs(combinedPdfBlob.blob, combinedPdfBlob.name)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        )}

        {/* 2. Converted Images Batch Results (Image to Format) */}
        {convertedImages.length > 0 && (
          <div className="bg-white dark:bg-[#1e1e21] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm space-y-4 animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Converted Images ({convertedImages.length})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ready for download individually or as a single packaged ZIP archive.
                </p>
              </div>
              {convertedImages.length > 1 && (
                <button
                  type="button"
                  onClick={handleDownloadAllConvertedZip}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md transition-all"
                >
                  <FileArchive className="w-4 h-4" /> Download All as ZIP
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {convertedImages.map((img, idx) => (
                <div
                  key={`${img.outputName}-${idx}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={img.previewUrl}
                      alt={img.outputName}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate" title={img.outputName}>
                        {img.outputName}
                      </p>
                      <span className="text-[11px] text-slate-400">{formatFileSize(img.size)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => saveAs(img.blob, img.outputName)}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-brand-600 dark:text-brand-400 hover:bg-brand-50 hover:border-brand-200 transition-colors"
                    title="Download image"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Extracted PDF Pages Gallery (PDF to Images) */}
        {extractedPages.length > 0 && (
          <div className="bg-white dark:bg-[#1e1e21] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm space-y-4 animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Extracted Pages ({extractedPages.length})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Crisp PNG images extracted from PDF document.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadAllExtractedZip}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md transition-all"
              >
                <FileArchive className="w-4 h-4" /> Download All Pages as ZIP
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-1">
              {extractedPages.map((page) => (
                <div
                  key={page.pageNum}
                  className="rounded-xl border border-slate-200/90 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-between gap-2"
                >
                  <img
                    src={page.url}
                    alt={`Page ${page.pageNum}`}
                    className="w-full h-36 object-contain rounded bg-white shadow-xs"
                  />
                  <div className="w-full flex items-center justify-between text-xs pt-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Page {page.pageNum}
                    </span>
                    <button
                      type="button"
                      onClick={() => saveAs(page.blob, `page_${page.pageNum}.png`)}
                      className="p-1 rounded text-slate-400 hover:text-brand-600 transition-colors"
                      title="Download page"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Single Output Confirmation */}
        {singleResult && !error && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-5 py-3 rounded-2xl animate-slide-up">
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>
              Success! Generated {singleResult.name} ({formatFileSize(singleResult.size)}) — downloaded automatically.
            </span>
          </div>
        )}
      </div>
    </AppShell>
  );
}
