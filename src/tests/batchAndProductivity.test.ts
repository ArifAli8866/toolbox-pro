import { describe, it, expect } from 'vitest';
import { computeRenamedFiles, BatchRenameRule } from '../lib/batchRenamer';

describe('Batch Renamer', () => {
  const dummyFile1 = new File(['content1'], 'Vacation Photo 01.JPG', { type: 'image/jpeg' });
  const dummyFile2 = new File(['content2'], 'Vacation Photo 02.JPG', { type: 'image/jpeg' });
  const files = [dummyFile1, dummyFile2];

  it('adds prefix and suffix correctly', () => {
    const rule: BatchRenameRule = {
      mode: 'prefix-suffix',
      prefix: '2026_',
      suffix: '_optimized',
    };
    const result = computeRenamedFiles(files, rule);
    expect(result[0].newName).toBe('2026_Vacation Photo 01_optimized.JPG');
    expect(result[1].newName).toBe('2026_Vacation Photo 02_optimized.JPG');
  });

  it('replaces text in filenames', () => {
    const rule: BatchRenameRule = {
      mode: 'replace',
      findText: 'Vacation Photo',
      replaceText: 'Summer_Trip',
    };
    const result = computeRenamedFiles(files, rule);
    expect(result[0].newName).toBe('Summer_Trip 01.JPG');
    expect(result[1].newName).toBe('Summer_Trip 02.JPG');
  });

  it('formats filenames with sequential numbering', () => {
    const rule: BatchRenameRule = {
      mode: 'numbering',
      basePattern: 'asset_{n}',
      startNumber: 1,
      paddingDigits: 3,
    };
    const result = computeRenamedFiles(files, rule);
    expect(result[0].newName).toBe('asset_001.JPG');
    expect(result[1].newName).toBe('asset_002.JPG');
  });

  it('formats filenames with kebab-case', () => {
    const rule: BatchRenameRule = {
      mode: 'case',
      caseType: 'kebab',
    };
    const result = computeRenamedFiles(files, rule);
    expect(result[0].newName).toBe('vacation-photo-01.JPG');
  });
});
