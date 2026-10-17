import React from "react";
import Link from "next/link";
import { Wrench, ShieldCheck, Heart } from "lucide-react";

const toolLinks = [
  { href: '/converter', label: 'File Converter' },
  { href: '/compressor', label: 'File Compressor' },
  { href: '/downloader', label: 'Media Downloader' },
  { href: '/image-tools', label: 'AI Image Studio' },
  { href: '/text-tools', label: 'Dev & Text Utilities' },
  { href: '/utilities', label: 'Everyday Utilities' },
  { href: '/more-tools', label: 'Productivity Suite' },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0c1322]/80 mt-auto backdrop-blur-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                ToolBox<span className="text-brand-500 text-xs ml-0.5 font-bold">PRO</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              High-performance, private file conversion, compression, developer tools, and productivity utilities running client-side.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% In-Browser Privacy</span>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
              Tools Suite
            </h4>
            <ul className="space-y-2">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform & Trust */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
              Security & Specs
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>WebAssembly & Canvas Engines</li>
              <li>Web Crypto API 256-bit AES</li>
              <li>Zero Cloud Data Retention</li>
              <li>Open Web Standards</li>
              <li>Works Offline via Service Workers</li>
            </ul>
          </div>

          {/* Creator & Links */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
              Connect
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://github.com/ArifAli8866/toolbox-pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/arif-ali-23a38032a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  LinkedIn Profile
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/arifali8866"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Twitter / X
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200/60 dark:border-slate-800/60 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
          <p>© 2026 ToolBox Pro. All processing executed in your browser.</p>
          <p className="flex items-center gap-1.5">
            Designed & Developed by{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">Arif Ali</span>{" "}
            with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
