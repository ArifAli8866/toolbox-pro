import JSZip from 'jszip';

// Image format conversion using Canvas API
export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'bmp' | 'ico' | 'gif';

const mimeTypeMap: Record<ImageFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  bmp: 'image/bmp',
  ico: 'image/png', // browsers don't support ico natively, use png
  gif: 'image/gif',
};

export async function convertImage(
  file: File,
  targetFormat: ImageFormat,
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Could not get canvas context'));
        return;
      }

      // For JPEG, fill background white (no transparency)
      if (targetFormat === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Conversion failed'));
          }
        },
        mimeTypeMap[targetFormat],
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = objectUrl;
  });
}

export function getExtensionFromFormat(format: ImageFormat): string {
  return format === 'jpeg' ? 'jpg' : format;
}

export interface ConvertedImageResult {
  originalFile: File;
  blob: Blob;
  outputName: string;
  size: number;
  previewUrl: string;
}

export async function convertImages(
  files: File[],
  targetFormat: ImageFormat,
  quality: number = 0.92,
  onProgress?: (current: number, total: number) => void
): Promise<ConvertedImageResult[]> {
  const results: ConvertedImageResult[] = [];
  const ext = getExtensionFromFormat(targetFormat);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i + 1, files.length);

    try {
      const blob = await convertImage(file, targetFormat, quality);
      const baseName = file.name.replace(/\.[^.]+$/, '');
      const outputName = `${baseName}.${ext}`;
      const previewUrl = URL.createObjectURL(blob);
      results.push({
        originalFile: file,
        blob,
        outputName,
        size: blob.size,
        previewUrl,
      });
    } catch (err) {
      console.error(`Failed to convert image ${file.name}:`, err);
    }
  }

  return results;
}

export async function createConvertedImagesZip(
  results: Array<ConvertedImageResult | { outputName?: string; name?: string; blob: Blob }>,
  _zipName = 'converted_images.zip'
): Promise<Blob> {
  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const item of results) {
    const rawName =
      'outputName' in item && item.outputName
        ? item.outputName
        : 'name' in item && item.name
        ? item.name
        : 'image';
    let finalName = rawName;
    let counter = 1;
    while (usedNames.has(finalName)) {
      const dotIndex = rawName.lastIndexOf('.');
      const base = dotIndex !== -1 ? rawName.slice(0, dotIndex) : rawName;
      const ext = dotIndex !== -1 ? rawName.slice(dotIndex) : '';
      finalName = `${base}_(${counter})${ext}`;
      counter++;
    }
    usedNames.add(finalName);
    zip.file(finalName, item.blob);
  }

  return await zip.generateAsync({ type: 'blob' });
}
