'use client';

const FAVORITES_KEY = 'toolbox-favorites';
const RECENT_KEY = 'toolbox-recent';
const MAX_RECENT = 8;

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    window.dispatchEvent(new Event('toolbox-favorites-updated'));
  } catch {
    // Ignore storage errors
  }
}

export function toggleFavoriteTool(toolId: string): boolean {
  const current = getFavorites();
  const exists = current.includes(toolId);
  const next = exists ? current.filter((id) => id !== toolId) : [...current, toolId];
  saveFavorites(next);
  return !exists;
}

export function getRecentTools(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordRecentTool(toolId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getRecentTools().filter((id) => id !== toolId);
    const next = [toolId, ...current].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('toolbox-recent-updated'));
  } catch {
    // Ignore storage errors
  }
}

export function clearRecentTools(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_KEY);
    window.dispatchEvent(new Event('toolbox-recent-updated'));
  } catch {
    // Ignore storage errors
  }
}
