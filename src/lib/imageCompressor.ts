// High-performance image compression using the HTML5 Canvas API

export interface CompressionOptions {
  quality: number; // 0.01 - 1
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
  originalWidth: number;
  originalHeight: number;
  outputWidth: number;
  outputHeight: number;
  previewUrl: string;
}

export async function compressImage(
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const origWidth = img.naturalWidth;
        const origHeight = img.naturalHeight;

        let targetWidth = origWidth;
        let targetHeight = origHeight;

        const maintainAspect = options.maintainAspectRatio !== false;

        if (options.maxWidth && options.maxWidth > 0 && options.maxHeight && options.maxHeight > 0) {
          if (maintainAspect) {
            const widthRatio = options.maxWidth / origWidth;
            const heightRatio = options.maxHeight / origHeight;
            const bestRatio = Math.min(widthRatio, heightRatio, 1);
            targetWidth = Math.round(origWidth * bestRatio);
            targetHeight = Math.round(origHeight * bestRatio);
          } else {
            targetWidth = Math.min(origWidth, options.maxWidth);
            targetHeight = Math.min(origHeight, options.maxHeight);
          }
        } else if (options.maxWidth && options.maxWidth > 0) {
          if (origWidth > options.maxWidth) {
            targetWidth = options.maxWidth;
            targetHeight = maintainAspect
              ? Math.round((options.maxWidth / origWidth) * origHeight)
              : origHeight;
          }
        } else if (options.maxHeight && options.maxHeight > 0) {
          if (origHeight > options.maxHeight) {
            targetHeight = options.maxHeight;
            targetWidth = maintainAspect
              ? Math.round((options.maxHeight / origHeight) * origWidth)
              : origWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, targetWidth);
        canvas.height = Math.max(1, targetHeight);

        const ctx = canvas.getContext('2d', { alpha: options.format !== 'jpeg' });
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Could not initialize 2D canvas context'));
          return;
        }

        // High quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fill white background for JPEG since JPEG does not support alpha transparency
        if (options.format === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const mimeType = options.format
          ? `image/${options.format}`
          : file.type || 'image/jpeg';

        const safeQuality = Math.min(Math.max(options.quality, 0.05), 1.0);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);

            if (blob) {
              const diff = file.size - blob.size;
              const reductionPercent = file.size > 0 ? (diff / file.size) * 100 : 0;
              const previewUrl = URL.createObjectURL(blob);

              resolve({
                blob,
                originalSize: file.size,
                compressedSize: blob.size,
                reductionPercent: Math.max(0, parseFloat(reductionPercent.toFixed(1))),
                originalWidth: origWidth,
                originalHeight: origHeight,
                outputWidth: canvas.width,
                outputHeight: canvas.height,
                previewUrl,
              });
            } else {
              reject(new Error('Image canvas failed to generate blob.'));
            }
          },
          mimeType,
          safeQuality
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err instanceof Error ? err : new Error('Compression failed'));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image file for processing.'));
    };

    img.src = objectUrl;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / Math.pow(k, i);
  return `${parseFloat(val.toFixed(2))} ${sizes[i]}`;
}
