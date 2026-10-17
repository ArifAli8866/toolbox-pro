'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { useToast } from '@/components/Toast';
import { recordRecentTool } from '@/lib/personalization';
import {
  Download,
  Link as LinkIcon,
  ExternalLink,
  AlertCircle,
  Check,
  Video,
  Image,
  Loader2,
  Copy,
  ShieldCheck,
} from 'lucide-react';

interface DownloadResult {
  success?: boolean;
  type: 'direct' | 'external';
  url: string;
  title: string;
  platform?: string;
  message?: string;
  suggestions?: { name: string; url: string; desc: string }[];
  error?: string;
}

export default function DownloaderPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    recordRecentTool('downloader');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setError('Please enter a valid media link or video URL.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        toast.error(data.error);
      } else {
        setResult(data);
        if (data.type === 'direct') {
          toast.success('Direct media file detected!');
        }
      }
    } catch {
      const msg = 'Failed to inspect media URL. Please verify connectivity.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectDownload = (downloadUrl: string) => {
    try {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = downloadUrl.split('/').pop() || 'media';
      a.click();
      toast.success('Initiated file download!');
    } catch {
      setError('Download failed to trigger automatically. Please right-click the link to Save.');
    }
  };

  const sampleLinks = [
    { label: 'Direct MP4 Video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    { label: 'Direct Image File', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
    { label: 'YouTube Video Link', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { label: 'Twitter / X Post', url: 'https://x.com/OpenAI/status/1768673752528089408' },
  ];

  return (
    <AppShell
      breadcrumbs={[
        { label: 'File & PDF', href: '/#category-file' },
        { label: 'Media Downloader' },
      ]}
      title="Media Downloader"
      subtitle="Inspect, validate, and download direct videos and images from any URL without third-party trackers."
      badge="Direct & Proxy"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Form Card */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-[#1e1e21] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste direct media URL (.mp4, .png, .jpg, etc.) or social video link..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Inspect &amp; Download</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Sample Links */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                Sample inputs:
              </span>
              {sampleLinks.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => setUrl(sample.url)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Direct Link Found */}
        {result && result.type === 'direct' && (
          <div className="bg-white dark:bg-[#1e1e21] rounded-3xl border border-emerald-200 dark:border-emerald-900/60 p-6 sm:p-8 animate-slide-up shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Check className="w-5 h-5" />
              <h3 className="font-bold text-base">Direct Media File Detected</h3>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Target Filename</span>
              <p className="font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 break-all">
                {result.title}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleDirectDownload(result.url)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Save to Device</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.url);
                  toast.success('Copied URL to clipboard!');
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs sm:text-sm transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Direct Link</span>
              </button>
            </div>
          </div>
        )}

        {/* Social Media Guide Result */}
        {result && result.type === 'external' && (
          <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-3xl border border-purple-200/80 dark:border-purple-900/60 p-6 sm:p-8 animate-slide-up space-y-4">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Video className="w-5 h-5" />
              <h3 className="font-bold text-base">{result.platform} Video Stream Detected</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {result.message}
            </p>

            <div className="space-y-3">
              {result.suggestions?.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 hover:shadow-md transition-shadow group"
                >
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      <span>{item.name}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold group-hover:bg-purple-500 transition-colors">
                    Open Tool
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
            <div>
              <span className="font-bold block mb-0.5">Invalid Media Target</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Disclosure Info */}
        <div className="p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              Platform Policy &amp; Direct Downloads
            </span>
            <p>
              Direct audio, video, and image URLs are resolved directly by your browser. For proprietary platform streams (YouTube, Instagram, TikTok), we redirect to open-source scrapers (Cobalt Tools) to avoid maintaining unauthorized stream decoders.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
