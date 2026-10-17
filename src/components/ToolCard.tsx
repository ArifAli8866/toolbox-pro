'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Minimize2,
  Download,
  Eraser,
  ScanText,
  Braces,
  GitCompare,
  ArrowLeftRight,
  Type,
  FileType,
  LockKeyhole,
  QrCode,
  Code2,
  Link as LinkIcon,
  Palette,
  Eye,
  Image as ImageIcon,
  Hash,
  KeyRound,
  Fingerprint,
  Camera,
  Coins,
  FileEdit,
  Sparkles,
  ArrowRight,
  Star,
} from 'lucide-react';
import { ToolItem } from '@/lib/toolsCatalog';

const iconComponents: Record<string, React.ElementType> = {
  FileText,
  Minimize2,
  Download,
  Eraser,
  ScanText,
  Braces,
  GitCompare,
  ArrowLeftRight,
  Type,
  FileType,
  LockKeyhole,
  QrCode,
  Code2,
  Link: LinkIcon,
  Palette,
  Eye,
  Image: ImageIcon,
  Hash,
  KeyRound,
  Fingerprint,
  Camera,
  Coins,
  FileEdit,
  Sparkles,
};

interface ToolCardProps {
  tool: ToolItem;
  isFavorite?: boolean;
  onToggleFavorite?: (toolId: string) => void;
  featured?: boolean;
}

export default function ToolCard({
  tool,
  isFavorite = false,
  onToggleFavorite,
  featured = false,
}: ToolCardProps) {
  const Icon = iconComponents[tool.iconName] || FileText;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(tool.id);
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-saas-card hover:shadow-saas-hover hover:border-slate-200 dark:hover:border-slate-700 hover:-translate-y-1 transition-all duration-300 ${
        featured ? 'ring-1 ring-brand-500/20 bg-gradient-to-b from-white to-brand-50/20 dark:from-[#0f172a] dark:to-brand-950/20' : ''
      }`}
    >
      <div>
        {/* Card Header: Icon, Badges, and Star */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${tool.gradient} flex items-center justify-center text-white shadow-md shadow-brand-500/15 group-hover:scale-105 transition-transform flex-shrink-0`}
          >
            <Icon className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {tool.badge && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                  tool.badge === 'Popular'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : tool.badge === 'AI'
                    ? 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-800'
                    : tool.badge === 'New'
                    ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800'
                    : 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                }`}
              >
                {tool.badge}
              </span>
            )}

            {onToggleFavorite && (
              <button
                type="button"
                onClick={handleFavoriteClick}
                aria-label={isFavorite ? `Remove ${tool.title} from favorites` : `Add ${tool.title} to favorites`}
                className={`p-1.5 rounded-lg transition-colors ${
                  isFavorite
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Title and Category */}
        <div className="mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            {tool.categoryLabel}
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {tool.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
          {tool.description}
        </p>

        {/* Features Chips */}
        {tool.features && tool.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {tool.features.map((feat, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-medium"
              >
                {feat}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Action Link */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
        <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Client-Side
        </span>
        <Link
          href={tool.href}
          className="inline-flex items-center gap-1 group-hover:gap-1.5 transition-all text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
        >
          <span>Open Tool</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
