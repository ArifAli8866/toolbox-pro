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
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
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
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Conversion failed'));
          }
        },
        mimeTypeMap[targetFormat],
        quality
      );
      
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function getExtensionFromFormat(format: ImageFormat): string {
  return format === 'jpeg' ? 'jpg' : format;
}
