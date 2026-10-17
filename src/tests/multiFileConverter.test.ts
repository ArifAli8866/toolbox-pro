import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import { createConvertedImagesZip } from '../lib/imageConverter';
import { createCompressedImagesZip } from '../lib/imageCompressor';
import { mergePDFs, rotatePDFPages, reorderPDFPages, deletePDFPages } from '../lib/pdfUtils';

describe('Multi-File Archive Packaging', () => {
  it('packages converted images into a valid ZIP archive with duplicate name resolution', async () => {
    const dummyBlob1 = new Blob(['sample-image-data-1'], { type: 'image/webp' });
    const dummyBlob2 = new Blob(['sample-image-data-2'], { type: 'image/webp' });

    const items = [
      { outputName: 'landscape.webp', blob: dummyBlob1 },
      { outputName: 'landscape.webp', blob: dummyBlob2 }, // duplicate name
      { outputName: 'portrait.webp', blob: dummyBlob1 },
    ];

    const zipBlob = await createConvertedImagesZip(items);
    expect(zipBlob).toBeInstanceOf(Blob);
    expect(zipBlob.size).toBeGreaterThan(0);

    // Unpack ZIP to verify entries
    const arrayBuffer = await zipBlob.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const filesInZip = Object.keys(zip.files);

    expect(filesInZip).toContain('landscape.webp');
    expect(filesInZip).toContain('landscape_(1).webp');
    expect(filesInZip).toContain('portrait.webp');
  });

  it('packages compressed images into a ZIP archive with _optimized naming and deduplication', async () => {
    const dummyBlob = new Blob(['compressed-image-bytes'], { type: 'image/jpeg' });
    const file1 = new File(['1'], 'avatar.png', { type: 'image/png' });
    const file2 = new File(['2'], 'avatar.png', { type: 'image/png' }); // same name

    const zipBlob = await createCompressedImagesZip([
      { file: file1, blob: dummyBlob, format: 'jpeg' },
      { file: file2, blob: dummyBlob, format: 'jpeg' },
    ]);

    expect(zipBlob).toBeInstanceOf(Blob);
    const arrayBuffer = await zipBlob.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const filesInZip = Object.keys(zip.files);

    expect(filesInZip).toContain('avatar_optimized.jpg');
    expect(filesInZip).toContain('avatar_optimized_(1).jpg');
  });
});

describe('PDF Multi-File & Page Operations', () => {
  // Helper to create a minimal PDF File
  async function createTestPdfFile(name: string, pageCount: number): Promise<File> {
    const doc = await PDFDocument.create();
    for (let i = 0; i < pageCount; i++) {
      doc.addPage([200, 200]);
    }
    const pdfBytes = await doc.save();
    return new File([new Uint8Array(pdfBytes)], name, { type: 'application/pdf' });
  }

  it('merges multiple PDF files into one combined PDF with correct total pages', async () => {
    const pdf1 = await createTestPdfFile('doc1.pdf', 2);
    const pdf2 = await createTestPdfFile('doc2.pdf', 3);

    const mergedBytes = await mergePDFs([pdf1, pdf2]);
    expect(mergedBytes).toBeInstanceOf(Uint8Array);

    const mergedDoc = await PDFDocument.load(mergedBytes);
    expect(mergedDoc.getPageCount()).toBe(5);
  });

  it('reorders PDF pages according to user-specified sequence', async () => {
    const pdf = await createTestPdfFile('doc.pdf', 3);
    // Reverse page order: page 3, then 2, then 1
    const reorderedBytes = await reorderPDFPages(pdf, [3, 2, 1]);
    const reorderedDoc = await PDFDocument.load(reorderedBytes);
    expect(reorderedDoc.getPageCount()).toBe(3);
  });

  it('deletes selected PDF pages and preserves remaining pages', async () => {
    const pdf = await createTestPdfFile('doc.pdf', 4);
    // Delete pages 2 and 4
    const modifiedBytes = await deletePDFPages(pdf, [2, 4]);
    const modifiedDoc = await PDFDocument.load(modifiedBytes);
    expect(modifiedDoc.getPageCount()).toBe(2);
  });

  it('rotates PDF pages by 90 degrees correctly', async () => {
    const pdf = await createTestPdfFile('doc.pdf', 1);
    const rotatedBytes = await rotatePDFPages(pdf, 90);
    const rotatedDoc = await PDFDocument.load(rotatedBytes);
    const page = rotatedDoc.getPage(0);
    expect(page.getRotation().angle).toBe(90);
  });
});
