import { describe, it, expect } from 'vitest';
import { computeLineDiff, csvToJson, jsonToCsv } from '../lib/diffUtils';
import { formatFileSize } from '../lib/imageCompressor';

describe('Diff Utils', () => {
  it('detects line additions, deletions, and unchanged lines correctly', () => {
    const original = 'alpha\nbeta\ngamma';
    const modified = 'alpha\nbeta updated\ngamma\ndelta';

    const diff = computeLineDiff(original, modified);
    expect(diff.length).toBeGreaterThan(0);

    const hasAlpha = diff.some((d) => d.value === 'alpha' && d.type === 'unchanged');
    expect(hasAlpha).toBe(true);

    const hasDelta = diff.some((d) => d.value === 'delta' && d.type === 'added');
    expect(hasDelta).toBe(true);
  });

  it('converts CSV to JSON and handles types properly', () => {
    const csv = 'name,age,active\nAlice,25,true\nBob,30,false';
    const { data, error } = csvToJson(csv);

    expect(error).toBeUndefined();
    expect(data.length).toBe(2);
    expect(data[0]).toEqual({ name: 'Alice', age: 25, active: true });
    expect(data[1]).toEqual({ name: 'Bob', age: 30, active: false });
  });

  it('converts JSON array of objects to CSV with quote escaping', () => {
    const json = JSON.stringify([
      { name: 'Alice, Dr.', role: 'Admin' },
      { name: 'Bob', role: 'User' },
    ]);

    const { csv, error } = jsonToCsv(json);
    expect(error).toBeUndefined();
    expect(csv).toContain('"Alice, Dr."');
    expect(csv).toContain('Bob,User');
  });
});

describe('File Size Formatter', () => {
  it('formats bytes into appropriate human-readable units', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });
});
