'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';
import { compressImage, formatFileSize, CompressionResult } from '@/lib/imageCompressor';
import { compressPDF } from '@/lib/pdfUtils';
import { saveAs } from 'file-saver';
import { Upload, Download, Zap, Sliders, Check, X, Loader2, FileImage, FileText, Minimize2 } from 'lucide-react';

type CompressMode = 'image' | 'pdf';

export default function CompressorPage() {
  return (
    <ToastProvider>
      <CompressorContent />
    </ToastProvider>
  );
}

function CompressorContent() {
  const [mode, setMode] = useState<CompressMode>('image');
  const [file, setFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [quality, setQuality] = useState(60);
  const [maxWidth, setMaxWidth] = useState('');
  const [maxHeight, setMaxHeight] = useState('');
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [results, setResults] = useState<CompressionResult | null>(null);
  const [pdfResult, setPdfResult] = useState<{ originalSize: number; compressedSize: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResults(null);
      setPdfResult(null);
      setError(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setResults(null);
      setPdfResult(null);
      setError(null);
    }
  }, []);

  const handleCompress = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    setCompressing(true);
    setError(null);
    
    try {
      if (mode === 'image') {
        const result = await compressImage(file, {
          quality: quality / 100,
          maxWidth: maxWidth ? parseInt(maxWidth) : undefined,
          maxHeight: maxHeight ? parseInt(maxHeight) : undefined,
          format: outputFormat,
        });
        setResults(result);
        
        const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
        const name = file.name.replace(/\.[^.]+$/, '') + `_compressed.${ext}`;
        saveAs(result.blob, name);
      } else {
        const compressed = await compressPDF(file);
        const compressedBlob = new Blob([new Uint8Array(compressed)], { type: 'application/pdf' });
        const originalSize = file.size;
        const compressedSize = compressed.length;
        setPdfResult({ originalSize, compressedSize });
        
        saveAs(compressedBlob, file.name);
      }
    } catch (err: any) {
      setError(err.message || 'Compression failed');
    } finally {
      setCompressing(false);
    }
  };

  const reductionPercent = results ? results.reductionPercent : pdfResult ? ((pdfResult.originalSize - pdfResult.compressedSize) / pdfResult.originalSize) * 100 : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">File Compressor</h1>
          <p className="text-slate-600">Reduce file sizes with adjustable quality. All processing happens locally.</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => { setMode('image'); setResults(null); setFile(null); }}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                mode === 'image' ? 'bg-white shadow-md text-primary-600' : 'text-slate-600'
              }`}
            >
              <FileImage className="w-4 h-4" />
              Image
            </button>
            <button
              onClick={() => { setMode('pdf'); setPdfResult(null); setFile(null); }}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                mode === 'pdf' ? 'bg-white shadow-md text-primary-600' : 'text-slate-600'
              }`}
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>

        {/* Compression Controls (Image only) */}
        {mode === 'image' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  Quality: {quality}%
                </h3>
                <span className={`text-sm font-semibold ${quality > 70 ? 'text-green-600' : quality > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {quality > 70 ? 'High Quality' : quality > 40 ? 'Balanced' : 'Max Compression'}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Minimize2 className="w-4 h-4" />
                Max Dimensions (optional)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500 mb-1 block">Max Width (px)</label>
                  <input
                    type="number"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(e.target.value)}
                    placeholder="e.g. 1920"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-500 mb-1 block">Max Height (px)</label>
                  <input
                    type="number"
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(e.target.value)}
                    placeholder="e.g. 1080"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Output Format</h3>
              <div className="flex gap-3">
                {(['jpeg', 'png', 'webp'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setOutputFormat(fmt)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      outputFormat === fmt
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                JPEG is best for photos. PNG for graphics with transparency. WEBP for best compression.
              </p>
            </div>
          </div>
        )}

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
            dragOver ? 'border-primary-400 bg-primary-50' : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
          onClick={() => document.getElementById('compress-file-input')?.click()}
        >
          <input
            id="compress-file-input"
            type="file"
            accept={mode === 'image' ? 'image/*' : '.pdf'}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700 mb-1">
            {file ? file.name : 'Drop your file here or click to browse'}
          </p>
          <p className="text-sm text-slate-500">
            {file ? formatFileSize(file.size) : mode === 'image' ? 'PNG, JPG, WEBP, BMP, GIF' : 'PDF files'}
          </p>
        </div>

        {/* Compress Button */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={handleCompress}
            disabled={!file || compressing}
            className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-green-500/40 hover:scale-105 transition-all flex items-center gap-2"
          >
            {compressing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Compressing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Compress File
              </>
            )}
          </button>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              <X className="w-4 h-4" />
              {error}
            </div>
          )}

          {mode === 'image' && results && !error && (
            <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-2 text-green-700">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Compression Complete!</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Original</div>
                  <div className="font-semibold text-slate-800">{formatFileSize(results.originalSize)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Compressed</div>
                  <div className="font-semibold text-green-600">{formatFileSize(results.compressedSize)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Reduced</div>
                  <div className="font-bold text-primary-600 text-lg">{results.reductionPercent.toFixed(1)}%</div>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, reductionPercent)}%` }}
                />
              </div>
            </div>
          )}

          {mode === 'pdf' && pdfResult && !error && (
            <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-2 text-green-700">
                <Check className="w-5 h-5" />
                <span className="font-semibold">PDF Compressed!</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Original</div>
                  <div className="font-semibold text-slate-800">{formatFileSize(pdfResult.originalSize)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Compressed</div>
                  <div className="font-semibold text-green-600">{formatFileSize(pdfResult.compressedSize)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Reduced</div>
                  <div className="font-bold text-primary-600 text-lg">{reductionPercent.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
