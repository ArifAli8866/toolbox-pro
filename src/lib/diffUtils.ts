export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
  leftLineNumber?: number;
  rightLineNumber?: number;
}

export function computeLineDiff(originalText: string, modifiedText: string): DiffLine[] {
  const originalLines = originalText.split(/\r?\n/);
  const modifiedLines = modifiedText.split(/\r?\n/);

  const n = originalLines.length;
  const m = modifiedLines.length;

  // DP table for LCS
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (originalLines[i - 1] === modifiedLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  const diff: DiffLine[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && originalLines[i - 1] === modifiedLines[j - 1]) {
      diff.unshift({
        type: 'unchanged',
        value: originalLines[i - 1],
        leftLineNumber: i,
        rightLineNumber: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({
        type: 'added',
        value: modifiedLines[j - 1],
        rightLineNumber: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diff.unshift({
        type: 'removed',
        value: originalLines[i - 1],
        leftLineNumber: i,
      });
      i--;
    }
  }

  return diff;
}

export function csvToJson(csv: string): { data: unknown[]; error?: string } {
  const trimmed = csv.trim();
  if (!trimmed) return { data: [] };

  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { data: [] };

  // Simple CSV parser supporting quotes
  const parseLine = (line: string): string[] => {
    const entries: string[] = [];
    let entry = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          entry += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        entries.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    entries.push(entry.trim());
    return entries;
  };

  const headers = parseLine(lines[0]);
  const rows: Record<string, string | number | boolean>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row: Record<string, string | number | boolean> = {};

    headers.forEach((header, idx) => {
      const val = values[idx] ?? '';
      // Type coercion for numbers / booleans
      if (val.toLowerCase() === 'true') {
        row[header] = true;
      } else if (val.toLowerCase() === 'false') {
        row[header] = false;
      } else if (!isNaN(Number(val)) && val.trim() !== '') {
        row[header] = Number(val);
      } else {
        row[header] = val;
      }
    });

    rows.push(row);
  }

  return { data: rows };
}

export function jsonToCsv(jsonString: string): { csv: string; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { csv: '', error: 'Input must be a non-empty JSON array of objects.' };
    }

    const headers = Array.from(
      new Set(
        parsed.flatMap((item) => (typeof item === 'object' && item !== null ? Object.keys(item) : []))
      )
    );

    if (headers.length === 0) {
      return { csv: '', error: 'No object keys found in array items.' };
    }

    const escapeCsv = (val: unknown): string => {
      if (val === null || val === undefined) return '';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headerRow = headers.map(escapeCsv).join(',');
    const rows = parsed.map((item) => {
      return headers
        .map((h) => escapeCsv(typeof item === 'object' && item !== null ? (item as Record<string, unknown>)[h] : ''))
        .join(',');
    });

    return { csv: [headerRow, ...rows].join('\n') };
  } catch (err: unknown) {
    return { csv: '', error: err instanceof Error ? err.message : 'Invalid JSON format' };
  }
}
