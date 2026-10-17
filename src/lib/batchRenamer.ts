import JSZip from 'jszip';

export interface BatchRenameRule {
  mode: 'prefix-suffix' | 'replace' | 'numbering' | 'case';
  prefix?: string;
  suffix?: string;
  findText?: string;
  replaceText?: string;
  caseType?: 'lower' | 'upper' | 'kebab' | 'snake';
  startNumber?: number;
  paddingDigits?: number;
  basePattern?: string; // e.g. "asset_{n}"
}

export interface RenamedFilePreview {
  id: string;
  file: File;
  originalName: string;
  newName: string;
  extension: string;
  size: number;
}

export function computeRenamedFiles(files: File[], rule: BatchRenameRule): RenamedFilePreview[] {
  return files.map((file, index) => {
    const lastDot = file.name.lastIndexOf('.');
    const baseName = lastDot !== -1 ? file.name.slice(0, lastDot) : file.name;
    const extension = lastDot !== -1 ? file.name.slice(lastDot) : '';

    let newBase = baseName;

    switch (rule.mode) {
      case 'prefix-suffix': {
        const pre = rule.prefix || '';
        const suf = rule.suffix || '';
        newBase = `${pre}${baseName}${suf}`;
        break;
      }
      case 'replace': {
        if (rule.findText) {
          newBase = baseName.split(rule.findText).join(rule.replaceText || '');
        }
        break;
      }
      case 'case': {
        if (rule.caseType === 'lower') {
          newBase = baseName.toLowerCase();
        } else if (rule.caseType === 'upper') {
          newBase = baseName.toUpperCase();
        } else if (rule.caseType === 'kebab') {
          newBase = baseName.replace(/[\s_]+/g, '-').toLowerCase();
        } else if (rule.caseType === 'snake') {
          newBase = baseName.replace(/[\s-]+/g, '_').toLowerCase();
        }
        break;
      }
      case 'numbering': {
        const num = (rule.startNumber || 1) + index;
        const padded = String(num).padStart(rule.paddingDigits || 3, '0');
        const pattern = rule.basePattern || '{name}_{n}';
        newBase = pattern.replace('{name}', baseName).replace('{n}', padded);
        break;
      }
    }

    const finalName = `${newBase}${extension}`;

    return {
      id: `${file.name}-${index}-${file.size}`,
      file,
      originalName: file.name,
      newName: finalName,
      extension,
      size: file.size,
    };
  });
}

export async function createBatchRenamedZip(
  previews: RenamedFilePreview[],
  zipName = 'renamed_files.zip'
): Promise<Blob> {
  const zip = new JSZip();

  for (const item of previews) {
    zip.file(item.newName, item.file);
  }

  return await zip.generateAsync({ type: 'blob' });
}
