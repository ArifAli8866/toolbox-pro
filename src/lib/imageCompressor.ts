// Image compression using Canvas API
export interface CompressionOptions {
  quality: number; // 0-1
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
}

export async function compressImage(
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      // Calculate new dimensions if max size is set
      if (options.maxWidth && width > options.maxWidth) {
        height = (options.maxWidth / width) * height;
        width = options.maxWidth;
      }
      if (options.maxHeight && height > options.maxHeight) {
        width = (options.maxHeight / height) * width;
        height = options.maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // For JPEG, fill background white
      if (options.format === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const mimeType = options.format
        ? `image/${options.format}`
        : file.type || 'image/jpeg';

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reductionPercent = ((file.size - blob.size) / file.size) * 100;
            resolve({
              blob,
              originalSize: file.size,
              compressedSize: blob.size,
              reductionPercent: Math.max(0, reductionPercent),
            });
          } else {
            reject(new Error('Compression failed'));
          }
        },
        mimeType,
        options.quality
      );

      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
