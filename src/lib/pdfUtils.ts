import { PDFDocument, degrees } from 'pdf-lib';

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const fileBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBuffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  return mergedPdf.save();
}

export async function extractPDFPages(
  file: File,
  startPage: number,
  endPage: number
): Promise<Uint8Array> {
  const fileBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(fileBuffer);
  const newPdf = await PDFDocument.create();

  const totalPages = srcPdf.getPageCount();
  const safeStart = Math.max(1, startPage);
  const actualEnd = Math.min(endPage, totalPages);

  for (let i = safeStart - 1; i < actualEnd; i++) {
    const [copiedPage] = await newPdf.copyPages(srcPdf, [i]);
    newPdf.addPage(copiedPage);
  }

  return newPdf.save();
}

export async function splitPDF(file: File): Promise<Uint8Array[]> {
  const fileBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(fileBuffer);
  const pages: Uint8Array[] = [];

  for (let i = 0; i < srcPdf.getPageCount(); i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(srcPdf, [i]);
    newPdf.addPage(copiedPage);
    pages.push(await newPdf.save());
  }

  return pages;
}

export async function rotatePDFPages(
  file: File,
  rotation: number
): Promise<Uint8Array> {
  const fileBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(fileBuffer);
  const pages = pdf.getPages();

  pages.forEach((page) => {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + rotation) % 360));
  });

  return pdf.save();
}

export async function reorderPDFPages(
  file: File,
  pageOrder: number[] // 1-indexed page numbers
): Promise<Uint8Array> {
  const fileBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(fileBuffer);
  const newPdf = await PDFDocument.create();
  const total = srcPdf.getPageCount();

  const validIndices = pageOrder
    .filter((num) => num >= 1 && num <= total)
    .map((num) => num - 1);

  const copiedPages = await newPdf.copyPages(srcPdf, validIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return newPdf.save();
}

export async function deletePDFPages(
  file: File,
  pagesToDelete: number[] // 1-indexed page numbers
): Promise<Uint8Array> {
  const fileBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(fileBuffer);
  const newPdf = await PDFDocument.create();
  const total = srcPdf.getPageCount();

  const keepIndices: number[] = [];
  for (let i = 1; i <= total; i++) {
    if (!pagesToDelete.includes(i)) {
      keepIndices.push(i - 1);
    }
  }

  const copiedPages = await newPdf.copyPages(srcPdf, keepIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return newPdf.save();
}

export async function compressPDF(file: File): Promise<Uint8Array> {
  const fileBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(fileBuffer);
  return pdf.save({ useObjectStreams: true });
}

export async function getPDFPageCount(file: File): Promise<number> {
  const fileBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(fileBuffer);
  return pdf.getPageCount();
}
