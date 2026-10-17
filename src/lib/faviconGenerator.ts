import JSZip from 'jszip';

export interface FaviconItem {
  name: string;
  size: number;
  blob: Blob;
  dataUrl: string;
  description: string;
}

export const FAVICON_SPECS = [
  { size: 16, name: 'favicon-16x16.png', description: 'Standard browser tab icon' },
  { size: 32, name: 'favicon-32x32.png', description: 'High-DPI / Retina browser tab' },
  { size: 48, name: 'favicon-48x48.png', description: 'Windows shortcut & bookmark' },
  { size: 180, name: 'apple-touch-icon.png', description: 'Apple iOS home screen touch icon' },
  { size: 192, name: 'android-chrome-192x192.png', description: 'Android & PWA medium icon' },
  { size: 512, name: 'android-chrome-512x512.png', description: 'Android & PWA splash icon' },
];

export async function generateFaviconPack(sourceFile: File | Blob): Promise<FaviconItem[]> {
  const img = await loadImageFromFile(sourceFile);
  const results: FaviconItem[] = [];

  for (const spec of FAVICON_SPECS) {
    const canvas = document.createElement('canvas');
    canvas.width = spec.size;
    canvas.height = spec.size;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Center crop or fit while preserving aspect ratio
    const srcRatio = img.width / img.height;
    let sx = 0;
    let sy = 0;
    let sw = img.width;
    let sh = img.height;

    if (srcRatio > 1) {
      // Wider than square: crop sides
      sw = img.height;
      sx = (img.width - img.height) / 2;
    } else if (srcRatio < 1) {
      // Taller than square: crop top/bottom
      sh = img.width;
      sy = (img.height - img.width) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, spec.size, spec.size);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png')
    );

    if (blob) {
      const dataUrl = canvas.toDataURL('image/png');
      results.push({
        name: spec.name,
        size: spec.size,
        blob,
        dataUrl,
        description: spec.description,
      });
    }
  }

  return results;
}

export async function createFaviconZip(icons: FaviconItem[]): Promise<Blob> {
  const zip = new JSZip();

  // Add each favicon image to the zip
  for (const icon of icons) {
    zip.file(icon.name, icon.blob);
  }

  // Generate HTML snippet snippet.html
  const htmlSnippet = `<!-- Toolbox Pro Favicon Package -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">
`;

  zip.file('html_head_tags.html', htmlSnippet);
  zip.file('README.txt', `Toolbox Pro - Generated Favicon Package
---------------------------------------
Contents:
- favicon-16x16.png (Standard browser tab)
- favicon-32x32.png (Retina browser tab)
- favicon-48x48.png (Shortcut / Desktop bookmark)
- apple-touch-icon.png (Apple iOS home screen)
- android-chrome-192x192.png (Android home screen)
- android-chrome-512x512.png (PWA splash screen)
- html_head_tags.html (Copy-paste <head> tags)

Drop these files into your website public/ directory.
Generated 100% locally in your browser with Toolbox Pro.
`);

  return await zip.generateAsync({ type: 'blob' });
}

function loadImageFromFile(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
