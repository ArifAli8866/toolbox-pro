import { PDFDocument } from 'pdf-lib';

// Helper to ensure any image file (WEBP, BMP, GIF, PNG, JPG) is converted to embeddable image bytes
async function getEmbeddableImageData(file: File): Promise<{ bytes: Uint8Array; format: 'png' | 'jpg'; width: number; height: number }> {
  // If already PNG or JPEG, we can check or convert through canvas to guarantee compatibility
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
        reject(new Error('Canvas context initialization failed'));
        return;
      }

      // Check if original has alpha or is PNG
      const isPng = file.type === 'image/png';
      if (!isPng) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(objectUrl);

      const mime = isPng ? 'image/png' : 'image/jpeg';
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error('Failed to create image blob'));
            return;
          }
          const buffer = await blob.arrayBuffer();
          resolve({
            bytes: new Uint8Array(buffer),
            format: isPng ? 'png' : 'jpg',
            width: canvas.width,
            height: canvas.height,
          });
        },
        mime,
        0.95
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = objectUrl;
  });
}

export interface ImagesToPdfOptions {
  pageSize?: 'fit' | 'a4';
  orientation?: 'auto' | 'portrait' | 'landscape';
  margin?: number;
  onProgress?: (current: number, total: number) => void;
}

// Convert one or more images into a single multi-page PDF in exact order
export async function imagesToPdf(
  files: File[],
  options: ImagesToPdfOptions = {}
): Promise<Uint8Array> {
  const { pageSize = 'fit', orientation = 'auto', margin = 0, onProgress } = options;
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i + 1, files.length);

    const { bytes, format, width, height } = await getEmbeddableImageData(file);
    const embeddedImage = format === 'png' ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);

    if (pageSize === 'a4') {
      // Standard A4 dimensions in PDF points (72 DPI): 595.28 x 841.89
      const isLandscape =
        orientation === 'landscape' || (orientation === 'auto' && width > height);
      const pageWidth = isLandscape ? 841.89 : 595.28;
      const pageHeight = isLandscape ? 595.28 : 841.89;

      const availWidth = Math.max(10, pageWidth - margin * 2);
      const availHeight = Math.max(10, pageHeight - margin * 2);

      // Fit inside available area while preserving aspect ratio
      const scale = Math.min(availWidth / width, availHeight / height);
      const drawWidth = width * scale;
      const drawHeight = height * scale;

      // Center on page
      const drawX = (pageWidth - drawWidth) / 2;
      const drawY = (pageHeight - drawHeight) / 2;

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(embeddedImage, {
        x: drawX,
        y: drawY,
        width: drawWidth,
        height: drawHeight,
      });
    } else {
      // 'fit' mode: page size fits image dimensions plus margins
      const pageWidth = width + margin * 2;
      const pageHeight = height + margin * 2;
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(embeddedImage, {
        x: margin,
        y: margin,
        width,
        height,
      });
    }
  }

  return pdfDoc.save();
}

// Backwards-compatible single-image wrapper
export async function imageToPdf(file: File, options?: ImagesToPdfOptions): Promise<Uint8Array> {
  return imagesToPdf([file], options);
}

// Convert PDF pages to images using pdfjs-dist
export async function pdfToImages(
  file: File,
  format: 'png' | 'jpeg' = 'png',
  maxPages: number = 20
): Promise<Blob[]> {
  try {
    const pdfjs = await import('pdfjs-dist');

    if (typeof window !== 'undefined') {
      // Use local or CDN worker matching the installed version
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const pageCount = Math.min(pdf.numPages, maxPages);
    const blobs: Blob[] = [];

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);

      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      if (format === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      await page.render({
        canvas,
        canvasContext: ctx,
        viewport,
      }).promise;

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(
          (b) => resolve(b),
          format === 'jpeg' ? 'image/jpeg' : 'image/png',
          0.92
        )
      );

      if (blob) {
        blobs.push(blob);
      }
    }

    if (blobs.length === 0) {
      throw new Error('No pages could be rendered from the document.');
    }

    return blobs;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'PDF to Image conversion failed';
    throw new Error(`Failed to render PDF to images: ${msg}`);
  }
}
