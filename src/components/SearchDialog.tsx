'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_TOOLS, CATEGORIES, ToolItem } from '@/lib/toolsCatalog';
import { recordRecentTool, toggleFavoriteTool, getFavorites } from '@/lib/personalization';
import {
  Search,
  X,
  ArrowRight,
  Star,
  FileText,
  Sparkles,
  Braces,
  Wrench,
  Layers,
  CornerDownLeft,
} from 'lucide-react';

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  file: FileText,
  ai: Sparkles,
  developer: Braces,
  utility: Wrench,
  productivity: Layers,
};

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setFavorites(getFavorites());
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Global keyboard shortcuts (Cmd+K, Ctrl+K, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) onClose();
      } else if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const results = useMemo(() => {
    let list = ALL_TOOLS;

    if (selectedCat !== 'all') {
      list = list.filter((t) => t.category === selectedCat);
    }

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.categoryLabel.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }

    return list;
  }, [query, selectedCat]);

  useEffect(() => {
    setActiveIndex(0);
  }, [results.length]);

  const handleSelectTool = (tool: ToolItem) => {
    recordRecentTool(tool.id);
    onClose();
    router.push(tool.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[activeIndex]) {
        handleSelectTool(results[activeIndex]);
      }
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent, toolId: string) => {
    e.stopPropagation();
    toggleFavoriteTool(toolId);
    setFavorites(getFavorites());
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global Tool Search"
        className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[80vh]"
      >
        {/* Search Input Box */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tools, formats, keywords (e.g. compress, pdf, ocr, json)..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close search"
          >
            <span className="text-xs font-mono px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              ESC
            </span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/50 overflow-x-auto">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCat === 'all'
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCat === c.id
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 divide-y divide-slate-100/50 dark:divide-slate-800/50"
        >
          {results.length > 0 ? (
            results.map((tool, index) => {
              const isSelected = index === activeIndex;
              const isFav = favorites.includes(tool.id);
              const CatIcon = categoryIcons[tool.category] || FileText;

              return (
                <div
                  key={tool.id}
                  onClick={() => handleSelectTool(tool)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-50/80 dark:bg-brand-950/40 text-brand-900 dark:text-brand-100 shadow-xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${tool.gradient} flex items-center justify-center text-white flex-shrink-0 shadow-xs`}
                    >
                      <CatIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm truncate">
                          {tool.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium uppercase">
                          {tool.categoryLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-md">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, tool.id)}
                      className="p-1 rounded text-slate-400 hover:text-amber-500"
                      aria-label="Toggle favorite"
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'text-amber-500 fill-amber-500' : ''}`} />
                    </button>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-100/60 dark:bg-brand-900/40 px-2 py-0.5 rounded-md">
                        Open
                        <CornerDownLeft className="w-3 h-3" />
                      </span>
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 px-4">
              <Search className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No tools found matching &quot;{query}&quot;
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Try searching for general keywords like pdf, image, json, or password.
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts legend */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                ↵
              </kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                Esc
              </kbd>
              Close
            </span>
          </div>
          <span>{results.length} available</span>
        </div>
      </div>
    </div>
  );
}
