import { PDFDocument } from 'pdf-lib';

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
  const actualEnd = Math.min(endPage, totalPages);
  
  for (let i = startPage - 1; i < actualEnd; i++) {
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
    page.setRotation({ type: 'degrees', angle: rotation } as any);
  });
  
  return pdf.save();
}

export async function compressPDF(file: File): Promise<Uint8Array> {
  // Load and re-save to apply basic compression
  const fileBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(fileBuffer);
  // Saving without objects compression as pdf-lib does basic optimization
  return pdf.save({ useObjectStreams: true });
}

export async function getPDFPageCount(file: File): Promise<number> {
  const fileBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(fileBuffer);
  return pdf.getPageCount();
}
