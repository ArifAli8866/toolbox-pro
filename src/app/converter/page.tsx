'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import AppShell from '@/components/AppShell';
import { useToast } from '@/components/Toast';
import { convertImage, ImageFormat, getExtensionFromFormat } from '@/lib/imageConverter';
import { formatFileSize } from '@/lib/imageCompressor';
import {
  mergePDFs,
  extractPDFPages,
  splitPDF,
  rotatePDFPages,
  getPDFPageCount,
} from '@/lib/pdfUtils';
import { imageToPdf, imagesToPdf, pdfToImages } from '@/lib/pdfConverter';
import { saveAs } from 'file-saver';
import { recordRecentTool } from '@/lib/personalization';
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

const modes = [
  { id: 'image' as const, icon: ImageIcon, label: 'Image Format', desc: 'PNG, JPG, WEBP, BMP, GIF' },
  { id: 'image-to-pdf' as const, icon: FileText, label: 'Images → PDF', desc: 'Combine photos into a document' },
  { id: 'pdf-to-image' as const, icon: ImageIcon, label: 'PDF → Images', desc: 'Extract pages as crisp PNGs' },
  { id: 'pdf-merge' as const, icon: Layers, label: 'Merge PDFs', desc: 'Combine multiple documents' },
  { id: 'pdf-extract' as const, icon: Scissors, label: 'Extract Pages', desc: 'Extract page range' },
  { id: 'pdf-split' as const, icon: FileMinus, label: 'Split PDF', desc: 'Split into separate files' },
  { id: 'pdf-rotate' as const, icon: RotateCw, label: 'Rotate Pages', desc: '90°, 180°, 270° orientation' },
  { id: 'pdf-password' as const, icon: Lock, label: 'Encrypt PDF', desc: '256-bit AES password lock' },
];

const imageFormats: ImageFormat[] = ['png', 'jpeg', 'webp', 'bmp', 'gif'];

export default function ConverterPage() {
  const [mode, setMode] = useState<ConversionMode>('image');
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<{ name: string; size: number; count?: number } | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('png');
  const [extractStart, setExtractStart] = useState(1);
  const [extractEnd, setExtractEnd] = useState(1);
  const [rotation, setRotation] = useState(90);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [pdfPassword, setPdfPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    recordRecentTool('converter');
  }, []);

  const handleFilesSelect = useCallback(
    (selectedFiles: File[]) => {
      setError(null);
      setResult(null);

      if (selectedFiles.length === 0) return;

      if (mode === 'image') {
        const valid = selectedFiles.filter((f) => f.type.startsWith('image/'));
        if (valid.length === 0) {
          setError('Please select valid image files.');
          return;
        }
        setFiles(valid.slice(0, 1));
      } else if (mode === 'image-to-pdf') {
        const valid = selectedFiles.filter((f) => f.type.startsWith('image/'));
        if (valid.length === 0) {
          setError('Please select image files to convert to PDF.');
          return;
        }
        setFiles(valid);
      } else {
        // PDF modes
        const valid = selectedFiles.filter(
          (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        );
        if (valid.length === 0) {
          setError('Please select valid PDF documents.');
          return;
        }

        if (mode === 'pdf-merge') {
          setFiles((prev) => [...prev, ...valid]);
        } else {
          setFiles(valid.slice(0, 1));
          getPDFPageCount(valid[0])
            .then((count) => {
              setPdfPageCount(count);
              setExtractStart(1);
              setExtractEnd(Math.min(count, 5));
            })
            .catch(() => setPdfPageCount(null));
        }
      }
    },
    [mode]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      setError('Please select files first.');
      return;
    }

    setConverting(true);
    setError(null);
    setResult(null);

    try {
      const uint8ToBlob = (u8: Uint8Array, type: string) =>
        new Blob([new Uint8Array(u8)], { type });

      if (mode === 'image') {
        const converted = await convertImage(files[0], targetFormat, 0.95);
        const ext = getExtensionFromFormat(targetFormat);
        const name = files[0].name.replace(/\.[^.]+$/, '') + `.${ext}`;
        saveAs(converted, name);
        setResult({ name, size: converted.size });
        toast.success(`Converted ${files[0].name} to ${name}!`);
      } else if (mode === 'image-to-pdf') {
        const pdfBytes = await imagesToPdf(files);
        const name =
          files.length === 1
            ? files[0].name.replace(/\.[^.]+$/, '') + '.pdf'
            : 'images_document.pdf';
        const blob = uint8ToBlob(pdfBytes, 'application/pdf');
        saveAs(blob, name);
        setResult({ name, size: pdfBytes.length, count: files.length });
        toast.success(`Generated PDF with ${files.length} pages!`);
      } else if (mode === 'pdf-to-image') {
        const blobs = await pdfToImages(files[0], 'png', 30);
        blobs.forEach((blob, idx) => {
          setTimeout(() => {
            saveAs(blob, `${files[0].name.replace(/\.pdf$/i, '')}_page_${idx + 1}.png`);
          }, idx * 150);
        });
        setResult({
          name: `${blobs.length} page images`,
          size: blobs.reduce((acc, b) => acc + b.size, 0),
          count: blobs.length,
        });
        toast.success(`Extracted ${blobs.length} pages as PNG!`);
      } else if (mode === 'pdf-merge') {
        if (files.length < 2) {
          setError('Please select at least 2 PDF files to merge.');
          setConverting(false);
          return;
        }
        const merged = await mergePDFs(files);
        const name = 'merged_document.pdf';
        saveAs(uint8ToBlob(merged, 'application/pdf'), name);
        setResult({ name, size: merged.length, count: files.length });
        toast.success(`Merged ${files.length} PDFs into one document!`);
      } else if (mode === 'pdf-extract') {
        const extracted = await extractPDFPages(files[0], extractStart, extractEnd);
        const name = `${files[0].name.replace(/\.pdf$/i, '')}_p${extractStart}-p${extractEnd}.pdf`;
        saveAs(uint8ToBlob(extracted, 'application/pdf'), name);
        setResult({ name, size: extracted.length });
        toast.success(`Extracted pages ${extractStart} to ${extractEnd}!`);
      } else if (mode === 'pdf-split') {
        const pages = await splitPDF(files[0]);
        pages.forEach((page, idx) => {
          setTimeout(() => {
            saveAs(uint8ToBlob(page, 'application/pdf'), `page_${idx + 1}.pdf`);
          }, idx * 150);
        });
        setResult({
          name: `${pages.length} separate PDF pages`,
          size: pages.reduce((a, b) => a + b.length, 0),
          count: pages.length,
        });
        toast.success(`Split PDF into ${pages.length} documents!`);
      } else if (mode === 'pdf-rotate') {
        const rotated = await rotatePDFPages(files[0], rotation);
        const name = `${files[0].name.replace(/\.pdf$/i, '')}_rotated_${rotation}deg.pdf`;
        saveAs(uint8ToBlob(rotated, 'application/pdf'), name);
        setResult({ name, size: rotated.length });
        toast.success(`Rotated all pages by ${rotation}°!`);
      } else if (mode === 'pdf-password') {
        if (!pdfPassword.trim()) {
          setError('Please enter a password to encrypt the PDF.');
          setConverting(false);
          return;
        }
        const { encryptPDF } = await import('@pdfsmaller/pdf-encrypt-lite');
        const pdfBytes = new Uint8Array(await files[0].arrayBuffer());
        const encryptedBytes = await encryptPDF(pdfBytes, pdfPassword);
        const name = files[0].name.replace(/\.pdf$/i, '') + '_protected.pdf';
        saveAs(uint8ToBlob(encryptedBytes as Uint8Array, 'application/pdf'), name);
        setResult({ name, size: (encryptedBytes as Uint8Array).length });
        toast.success('PDF encrypted with 256-bit AES protection!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Conversion failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setConverting(false);
    }
  };

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
                  setFiles([]);
                  setResult(null);
                  setError(null);
                  setPdfPageCount(null);
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/40 shadow-sm ring-1 ring-brand-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] hover:border-slate-300 dark:hover:border-slate-700'
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
        {mode === 'image' && (
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mb-3">
              Choose Target Output Format
            </span>
            <div className="flex flex-wrap gap-2">
              {imageFormats.map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setTargetFormat(fmt)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
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
        )}

        {mode === 'pdf-extract' && pdfPageCount && (
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
              Page Range Selection (Document has {pdfPageCount} pages)
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">From Page</label>
                <input
                  type="number"
                  min={1}
                  max={pdfPageCount}
                  value={extractStart}
                  onChange={(e) => setExtractStart(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand-500"
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
                    setExtractEnd(Math.min(pdfPageCount, parseInt(e.target.value, 10) || extractStart))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Extracting pages {extractStart} to {extractEnd} into a standalone PDF.
            </p>
          </div>
        )}

        {mode === 'pdf-rotate' && (
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
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

        {mode === 'pdf-password' && (
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
              Set Document Protection Password
            </span>
            <input
              type="text"
              value={pdfPassword}
              onChange={(e) => setPdfPassword(e.target.value)}
              placeholder="Enter secure password..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-brand-500"
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
              handleFilesSelect(Array.from(e.dataTransfer.files));
            }
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
            multiple={mode === 'pdf-merge' || mode === 'image-to-pdf'}
            accept={mode === 'image' || mode === 'image-to-pdf' ? 'image/*' : '.pdf,application/pdf'}
            onChange={(e) => e.target.files && handleFilesSelect(Array.from(e.target.files))}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Upload className="w-6 h-6" />
          </div>

          <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            {files.length > 0
              ? `${files.length} file${files.length > 1 ? 's' : ''} loaded`
              : 'Drop your files here or click to browse'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mode === 'image'
              ? 'PNG, JPG, WEBP, BMP, GIF'
              : mode === 'image-to-pdf'
              ? 'Select multiple photos to merge into a single PDF'
              : mode === 'pdf-merge'
              ? 'Select 2 or more PDFs to combine'
              : 'Upload a PDF document'}
          </p>
        </div>

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Selected Files ({files.length})
              </span>
              {files.length > 1 && (
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {files.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-sm">
                        {file.name}
                      </p>
                      <span className="text-[11px] text-slate-400">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500"
                    aria-label={`Remove ${file.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Convert Action Button */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleConvert}
            disabled={files.length === 0 || converting}
            className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-brand-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {converting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Client-Side...</span>
              </>
            ) : (
              <>
                <ArrowLeftRight className="w-4 h-4" />
                <span>Convert &amp; Process ({files.length} file{files.length === 1 ? '' : 's'})</span>
              </>
            )}
          </button>

          {error && (
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 px-4 py-2.5 rounded-xl">
              <X className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && !error && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-5 py-3 rounded-2xl animate-slide-up">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>
                Success! Generated {result.name} ({formatFileSize(result.size)}) — downloaded automatically.
              </span>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
