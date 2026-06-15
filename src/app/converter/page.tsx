'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';
import { convertImage, ImageFormat, getExtensionFromFormat } from '@/lib/imageConverter';
import { formatFileSize } from '@/lib/imageCompressor';
import { mergePDFs, extractPDFPages, splitPDF, rotatePDFPages, compressPDF, getPDFPageCount } from '@/lib/pdfUtils';
import { imageToPdf } from '@/lib/pdfConverter';
import { saveAs } from 'file-saver';
import { Upload, Download, FileText, Image, ArrowLeftRight, Layers, Scissors, RotateCw, FileMinus, Loader2, X, Check, Lock } from 'lucide-react';

type ConversionMode = 'image' | 'pdf-merge' | 'pdf-split' | 'pdf-extract' | 'pdf-rotate' | 'pdf-compress' | 'image-to-pdf' | 'pdf-password';

export default function ConverterPage() {
  return (
    <ToastProvider>
      <ConverterContent />
    </ToastProvider>
  );
}

function ConverterContent() {
  const [mode, setMode] = useState<ConversionMode>('image');
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<{ name: string; size: number } | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('png');
  const [pdfQuality, setPdfQuality] = useState(0.92);
  const [extractStart, setExtractStart] = useState(1);
  const [extractEnd, setExtractEnd] = useState(1);
  const [rotation, setRotation] = useState(90);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [pdfPassword, setPdfPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const imageFormats: ImageFormat[] = ['png', 'jpeg', 'webp', 'bmp', 'gif'];

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setError(null);
    setResult(null);
    
    if (mode === 'image' || mode === 'image-to-pdf') {
      setFiles(selected.slice(0, 1));
    } else {
      setFiles(selected);
    }
    
    if (selected.length > 0 && selected[0].type === 'application/pdf') {
      getPDFPageCount(selected[0]).then(count => setPdfPageCount(count)).catch(() => setPdfPageCount(null));
    }
  }, [mode]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setError(null);
    setResult(null);
    
    if (mode === 'image' || mode === 'image-to-pdf') {
      setFiles(dropped.slice(0, 1));
    } else {
      setFiles(dropped);
    }
    
    if (dropped.length > 0 && dropped[0].type === 'application/pdf') {
      getPDFPageCount(dropped[0]).then(count => setPdfPageCount(count)).catch(() => setPdfPageCount(null));
    }
  }, [mode]);

  const handleConvert = async () => {
    if (files.length === 0) {
      setError('Please select files first');
      return;
    }
    setConverting(true);
    setError(null);
    setResult(null);
    
    try {
      const uint8ToBlob = (u8: Uint8Array, type: string) => new Blob([new Uint8Array(u8)], { type });
      
      if (mode === 'image') {
        const converted = await convertImage(files[0], targetFormat, pdfQuality);
        const ext = getExtensionFromFormat(targetFormat);
        const name = files[0].name.replace(/\.[^.]+$/, '') + `.${ext}`;
        saveAs(converted, name);
        setResult({ name, size: converted.size });
      } else if (mode === 'image-to-pdf') {
        const pdfBytes = await imageToPdf(files[0]);
        const name = files[0].name.replace(/\.[^.]+$/, '') + '.pdf';
        saveAs(uint8ToBlob(pdfBytes, 'application/pdf'), name);
        setResult({ name, size: pdfBytes.length });
      } else if (mode === 'pdf-merge') {
        const merged = await mergePDFs(files);
        saveAs(uint8ToBlob(merged, 'application/pdf'), 'merged.pdf');
        setResult({ name: 'merged.pdf', size: merged.length });
      } else if (mode === 'pdf-extract') {
        const extracted = await extractPDFPages(files[0], extractStart, extractEnd);
        saveAs(uint8ToBlob(extracted, 'application/pdf'), `pages_${extractStart}-${extractEnd}.pdf`);
        setResult({ name: `pages_${extractStart}-${extractEnd}.pdf`, size: extracted.length });
      } else if (mode === 'pdf-split') {
        const pages = await splitPDF(files[0]);
        pages.forEach((page, i) => {
          setTimeout(() => {
            saveAs(uint8ToBlob(page, 'application/pdf'), `page_${i + 1}.pdf`);
          }, i * 200);
        });
        setResult({ name: `${pages.length} individual PDFs`, size: pages.reduce((a, b) => a + b.length, 0) });
      } else if (mode === 'pdf-rotate') {
        const rotated = await rotatePDFPages(files[0], rotation);
        saveAs(uint8ToBlob(rotated, 'application/pdf'), 'rotated.pdf');
        setResult({ name: 'rotated.pdf', size: rotated.length });
      } else if (mode === 'pdf-compress') {
        const compressed = await compressPDF(files[0]);
        saveAs(uint8ToBlob(compressed, 'application/pdf'), files[0].name);
        setResult({ name: files[0].name, size: compressed.length });
      } else if (mode === 'pdf-password') {
        if (!pdfPassword) { setError('Please enter a password'); setConverting(false); return; }
        const { encryptPDF } = await import('@pdfsmaller/pdf-encrypt-lite');
        const pdfBytes = new Uint8Array(await files[0].arrayBuffer());
        const encryptedBytes = await encryptPDF(pdfBytes, pdfPassword);
        const name = files[0].name.replace(/\.[^.]+$/, '') + '_protected.pdf';
        saveAs(uint8ToBlob(encryptedBytes as Uint8Array, 'application/pdf'), name);
        setResult({ name, size: (encryptedBytes as Uint8Array).length });
      }
    } catch (err: any) {
      setError(err.message || 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  const modes = [
    { id: 'image' as const, icon: Image, label: 'Image Format', desc: 'Convert between image formats' },
    { id: 'image-to-pdf' as const, icon: FileText, label: 'Image → PDF', desc: 'Convert image to PDF' },
    { id: 'pdf-merge' as const, icon: Layers, label: 'Merge PDFs', desc: 'Combine multiple PDFs' },
    { id: 'pdf-extract' as const, icon: Scissors, label: 'Extract Pages', desc: 'Extract specific pages' },
    { id: 'pdf-split' as const, icon: FileMinus, label: 'Split PDF', desc: 'Split into individual pages' },
    { id: 'pdf-rotate' as const, icon: RotateCw, label: 'Rotate PDF', desc: 'Rotate all pages' },
    { id: 'pdf-compress' as const, icon: ArrowLeftRight, label: 'Optimize PDF', desc: 'Re-compress PDF' },
    { id: 'pdf-password' as const, icon: Lock, label: 'Protect PDF', desc: 'Add password encryption' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">File Converter</h1>
          <p className="text-slate-600">Convert images, merge PDFs, split pages, and more — all in your browser.</p>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); setFiles([]); setResult(null); setError(null); }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                mode === m.id
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <m.icon className={`w-5 h-5 mb-2 ${mode === m.id ? 'text-primary-600' : 'text-slate-500'}`} />
              <div className={`text-sm font-semibold ${mode === m.id ? 'text-primary-700' : 'text-slate-700'}`}>{m.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{m.desc}</div>
            </button>
          ))}
        </div>

        {/* Conversion Options */}
        {mode === 'image' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h3 className="font-semibold text-slate-800 mb-4">Output Format</h3>
            <div className="flex flex-wrap gap-3">
              {imageFormats.map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setTargetFormat(fmt)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    targetFormat === fmt
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {getExtensionFromFormat(fmt).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === 'pdf-extract' && pdfPageCount && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Start Page</label>
              <input
                type="number"
                min={1}
                max={pdfPageCount}
                value={extractStart}
                onChange={(e) => setExtractStart(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">End Page</label>
              <input
                type="number"
                min={extractStart}
                max={pdfPageCount}
                value={extractEnd}
                onChange={(e) => setExtractEnd(Math.min(pdfPageCount, parseInt(e.target.value) || extractStart))}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="col-span-2 text-sm text-slate-500">
              PDF has {pdfPageCount} pages. Extracting pages {extractStart}–{Math.min(extractEnd, pdfPageCount)}.
            </div>
          </div>
        )}

        {mode === 'pdf-rotate' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h3 className="font-semibold text-slate-800 mb-4">Rotation Angle</h3>
            <div className="flex gap-3">
              {[90, 180, 270].map((deg) => (
                <button
                  key={deg}
                  onClick={() => setRotation(deg)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    rotation === deg
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === 'pdf-password' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Password Protection
            </h3>
            <input
              type="text"
              value={pdfPassword}
              onChange={(e) => setPdfPassword(e.target.value)}
              placeholder="Enter a password..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-slate-500 mt-2">
              Uses 256-bit AES encryption. Anyone opening the PDF will need this password.
            </p>
          </div>
        )}

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-primary-400 bg-primary-50'
              : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            multiple={mode !== 'image' && mode !== 'image-to-pdf'}
            accept={mode.startsWith('pdf') ? '.pdf' : 'image/*'}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700 mb-1">
            {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Drop files here or click to browse'}
          </p>
          <p className="text-sm text-slate-500">
            {mode.startsWith('pdf') ? 'PDF files' : 'Image files (PNG, JPG, WEBP, BMP, GIF)'}
            {mode === 'pdf-merge' ? ' (select 2 or more)' : ''}
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6 space-y-2">
            {files.slice(0, 10).map((file, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-700 truncate max-w-[300px]">{file.name}</div>
                    <div className="text-xs text-slate-500">{formatFileSize(file.size)}</div>
                  </div>
                </div>
                <Check className="w-5 h-5 text-green-500" />
              </div>
            ))}
          </div>
        )}

        {/* Convert Button */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={handleConvert}
            disabled={files.length === 0 || converting}
            className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-primary-500/40 hover:scale-105 transition-all flex items-center gap-2"
          >
            {converting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowLeftRight className="w-5 h-5" />
                Convert {files.length > 0 ? `(${files.length} file${files.length > 1 ? 's' : ''})` : ''}
              </>
            )}
          </button>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              <X className="w-4 h-4" />
              {error}
            </div>
          )}

          {result && !error && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-lg">
              <Check className="w-4 h-4" />
              Converted successfully! {result.name} ({formatFileSize(result.size)}) — Downloaded automatically.
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
