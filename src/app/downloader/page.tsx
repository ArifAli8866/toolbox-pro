'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';
import { Download, Link, ExternalLink, AlertCircle, Check, Video, Image, Loader2, Copy } from 'lucide-react';

interface DownloadResult {
  type: 'direct' | 'external';
  url: string;
  title: string;
  platform?: string;
  message?: string;
  suggestions?: { name: string; url: string; desc: string }[];
}

export default function DownloaderPage() {
  return (
    <ToastProvider>
      <DownloaderContent />
    </ToastProvider>
  );
}

function DownloaderContent() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError('Failed to process URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectDownload = async (downloadUrl: string) => {
    try {
      // Open in new tab for direct download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
    } catch {
      setError('Direct download failed. Try right-clicking and "Save As".');
    }
  };

  const sampleLinks = [
    { label: 'Direct Image URL', url: 'https://example.com/photo.jpg' },
    { label: 'Direct Video URL', url: 'https://example.com/video.mp4' },
    { label: 'YouTube Video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { label: 'Twitter/X Post', url: 'https://twitter.com/user/status/12345' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Media Downloader</h1>
          <p className="text-slate-600">Download videos and images from any link. Fast and free.</p>
        </div>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste any video or image URL here..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-800 placeholder-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 disabled:opacity-50 hover:shadow-purple-500/40 hover:scale-105 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download
                  </>
                )}
              </button>
            </div>

            {/* Sample Links */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-slate-500 py-1">Try:</span>
              {sampleLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => setUrl(link.url)}
                  className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Results */}
        {result && result.type === 'direct' && (
          <div className="bg-white rounded-xl border border-green-200 p-6 mb-6 animate-slide-up">
            <div className="flex items-center gap-2 text-green-700 mb-4">
              <Check className="w-5 h-5" />
              <span className="font-semibold">Direct Media Link Found!</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-slate-500 mb-1">Title</div>
              <div className="font-medium text-slate-800 break-all">{result.title}</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleDirectDownload(result.url)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Now
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(result.url)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy URL
              </button>
            </div>
          </div>
        )}

        {result && result.type === 'external' && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6 mb-6 animate-slide-up">
            <div className="flex items-center gap-2 text-purple-700 mb-4">
              <Video className="w-5 h-5" />
              <span className="font-semibold">{result.platform} Detected</span>
            </div>
            <p className="text-sm text-purple-600 mb-4">{result.message}</p>
            <div className="space-y-3">
              {result.suggestions?.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-white rounded-lg border border-purple-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      {s.name}
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-sm text-slate-500">{s.desc}</div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors">
                    Open
                  </button>
                </a>
              ))}
            </div>
            <div className="mt-4 p-4 bg-white/60 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-600">
                <strong>Pro Tip:</strong> Open the link below, paste your URL ({url.substring(0, 50)}...), and the service will extract and let you download the video directly.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-6 flex items-start gap-3 animate-slide-up">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-red-700 mb-1">Error</div>
              <div className="text-sm text-red-600">{error}</div>
            </div>
          </div>
        )}

        {/* Supported Platforms */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mt-8">
          <h3 className="font-semibold text-slate-800 mb-4">Supported URL Types</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-700">Direct Media Links</div>
                <div className="text-sm text-slate-500">Links ending in .mp4, .jpg, .png, .webp, etc. Download instantly.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-700">YouTube / Social Media</div>
                <div className="text-sm text-slate-500">Redirects to free download services for easy extraction.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-700 mb-1">About Media Downloading</h4>
              <p className="text-sm text-blue-600 leading-relaxed">
                For direct media links (ending in .mp4, .jpg, etc.), you can download right here. For platforms like YouTube, 
                Instagram, TikTok, and Twitter/X, we redirect you to specialized free services that handle the extraction. 
                This keeps our app lightweight and free for everyone — no servers, no costs, no limits.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
