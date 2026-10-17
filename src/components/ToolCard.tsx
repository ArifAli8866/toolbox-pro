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
      className={`group relative flex flex-col justify-between bg-white dark:bg-[#1e1e21] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] p-5 shadow-saas-card hover:shadow-saas-hover hover:border-black/[0.12] dark:hover:border-white/[0.16] hover:-translate-y-0.5 transition-all duration-200 ${
        featured ? 'ring-1 ring-blue-500/20 bg-gradient-to-b from-white to-blue-50/15 dark:from-[#1e1e21] dark:to-blue-950/20' : ''
      }`}
    >
      <div>
        {/* Card Header: Icon, Badges, and Star */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${tool.gradient} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform flex-shrink-0`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {tool.badge && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs ${
                  tool.badge === 'Popular'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                    : tool.badge === 'AI'
                    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
                    : tool.badge === 'New'
                    ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900'
                    : 'bg-blue-100 dark:bg-blue-950/60 text-[#2563eb] dark:text-blue-300 border border-blue-200 dark:border-blue-900'
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
                className={`p-1.5 rounded-[8px] transition-colors ${
                  isFavorite
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                    : 'text-[#94a3b8] hover:text-[#0f172a] dark:text-[#5c5c66] dark:hover:text-[#f1f1f4] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-500' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Title and Category */}
        <div className="mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b] dark:text-[#7b7b85]">
            {tool.categoryLabel}
          </span>
          <h3 className="text-[15px] font-bold text-[#0f172a] dark:text-[#f1f1f4] group-hover:text-[#2563eb] dark:group-hover:text-[#0a84ff] transition-colors">
            {tool.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs text-[#475569] dark:text-[#a1a1ab] leading-relaxed mb-3.5 line-clamp-2">
          {tool.description}
        </p>

        {/* Features Chips */}
        {tool.features && tool.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tool.features.map((feat, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[#f0f2f7] dark:bg-[#131316] text-[#475569] dark:text-[#a1a1ab] font-medium"
              >
                {feat}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Action Link */}
      <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-xs font-semibold text-[#2563eb] dark:text-[#0a84ff]">
        <span className="inline-flex items-center gap-1.5 text-[#64748b] dark:text-[#7b7b85]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Client-Side
        </span>
        <Link
          href={tool.href}
          className="inline-flex items-center gap-1 group-hover:gap-1.5 transition-all text-[#2563eb] dark:text-[#0a84ff] hover:text-[#1d4ed8] dark:hover:text-[#2f97ff]"
        >
          <span>Open Tool</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
