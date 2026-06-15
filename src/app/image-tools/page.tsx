'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ToastProvider, useToast } from '@/components/Toast';
import {
  Eraser, ScanText, Upload, Download, Loader2, Copy, Check,
  Image as ImageIcon, Sparkles
} from 'lucide-react';

type ImageTool = 'bg-remover' | 'ocr';

export default function ImageToolsPage() {
  return (
    <ToastProvider>
      <ImageToolsContent />
    </ToastProvider>
  );
}

function ImageToolsContent() {
  const [activeTool, setActiveTool] = useState<ImageTool>('bg-remover');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Image Tools (AI)</h1>
          <p className="text-slate-600">Remove backgrounds and extract text from images — all in your browser.</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-100 rounded-xl p-1">
            {[
              { id: 'bg-remover' as const, icon: Eraser, label: 'Background Remover' },
              { id: 'ocr' as const, icon: ScanText, label: 'Image to Text (OCR)' },
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

        {activeTool === 'bg-remover' && <BackgroundRemover />}
        {activeTool === 'ocr' && <ImageToText />}
      </div>
      <Footer />
    </div>
  );
}

function BackgroundRemover() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const toast = useToast();

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setFile(f);
    setResultUrl(null);
    setProgress(0);
    const url = URL.createObjectURL(f);
    setOriginalUrl(url);
  }, [toast]);

  const processImage = async () => {
    if (!file) { toast.warning('Select an image first'); return; }
    setProcessing(true);
    setProgress(0);
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      toast.info('Downloading AI model (~80MB, first time only)...');
      const blob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          const pct = total > 0 ? (current / total) * 100 : 0;
          setProgress(Math.round(pct));
        },
      });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      toast.success('Background removed successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to process image');
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = (file?.name.replace(/\.[^.]+$/, '') || 'image') + '_nobg.png';
      a.click();
      toast.success('Image downloaded!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => document.getElementById('bg-input')?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer mb-6 ${
          dragOver ? 'border-brand-400 bg-brand-50' : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <input id="bg-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
        {originalUrl ? (
          <img src={originalUrl} alt="Original" className="max-h-40 mx-auto rounded-lg" />
        ) : (
          <>
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-700 mb-1">Drop an image here or click to browse</p>
            <p className="text-sm text-slate-500">PNG, JPG, WEBP — AI removes the background automatically</p>
          </>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={processImage}
        disabled={!file || processing}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-semibold shadow-lg shadow-brand-500/25 disabled:opacity-50 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {progress < 100 ? `Loading AI model... ${progress}%` : 'Removing background...'}
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Remove Background
          </>
        )}
      </button>

      {/* Progress bar */}
      {processing && progress < 100 && (
        <div className="mt-4 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Result */}
      {resultUrl && (
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 animate-slide-up">
          <h3 className="font-semibold text-slate-800 mb-4 text-center">Result (Transparent Background)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-2">Original</p>
              <div className="bg-slate-100 rounded-xl p-2 flex items-center justify-center">
                {originalUrl && <img src={originalUrl} alt="Original" className="max-h-48 rounded-lg" />}
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-2">Removed</p>
              <div className="rounded-xl p-2 flex items-center justify-center" style={{ backgroundImage: 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
                <img src={resultUrl} alt="No background" className="max-h-48 rounded-lg" />
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={downloadResult}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-xs text-blue-600">
          💡 <strong>First run only:</strong> The AI model (~80MB) downloads once and is cached in your browser. After that, processing is instant and works offline.
        </p>
      </div>
    </div>
  );
}

function ImageToText() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setFile(f);
    setText('');
    setProgress('');
    setImageUrl(URL.createObjectURL(f));
  }, [toast]);

  const processImage = async () => {
    if (!file) { toast.warning('Select an image first'); return; }
    setProcessing(true);
    setProgress('Initializing OCR engine...');
    try {
      const { createWorker } = await import('tesseract.js');
      setProgress('Loading language data...');
      const worker = await createWorker('eng', 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setProgress(`Extracting text... ${Math.round(m.progress * 100)}%`);
          }
        },
      });
      const { data: { text: extractedText } } = await worker.recognize(file);
      setText(extractedText);
      await worker.terminate();
      if (extractedText.trim()) {
        toast.success('Text extracted successfully!');
      } else {
        toast.warning('No text found in the image');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to extract text');
    } finally {
      setProcessing(false);
      setProgress('');
    }
  };

  const copyText = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Text copied!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => document.getElementById('ocr-input')?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer mb-6 ${
          dragOver ? 'border-brand-400 bg-brand-50' : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <input id="ocr-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
        {imageUrl ? (
          <img src={imageUrl} alt="Selected" className="max-h-40 mx-auto rounded-lg" />
        ) : (
          <>
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-700 mb-1">Drop an image with text here</p>
            <p className="text-sm text-slate-500">Screenshots, scanned documents, photos of text</p>
          </>
        )}
      </div>

      <button
        onClick={processImage}
        disabled={!file || processing}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-semibold shadow-lg shadow-brand-500/25 disabled:opacity-50 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {progress || 'Processing...'}
          </>
        ) : (
          <>
            <ScanText className="w-5 h-5" />
            Extract Text
          </>
        )}
      </button>

      {text && (
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 overflow-hidden animate-slide-up">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
            <span className="font-semibold text-sm text-slate-700 flex items-center gap-2">
              <ScanText className="w-4 h-4" /> Extracted Text ({text.trim().length} chars)
            </span>
            <button onClick={copyText} className={`p-1.5 rounded-lg transition-colors ${copied ? 'bg-green-100 text-green-600' : 'hover:bg-slate-200 text-slate-500'}`}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-64 p-4 text-sm bg-white resize-none focus:outline-none"
            placeholder="Extracted text will appear here..."
          />
        </div>
      )}
    </div>
  );
}
