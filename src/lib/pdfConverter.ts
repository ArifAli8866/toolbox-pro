import { PDFDocument } from 'pdf-lib';

// Convert image to PDF
export async function imageToPdf(file: File): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  
  const imageBytes = await file.arrayBuffer();
  let image;
  
  if (file.type === 'image/png') {
    image = await pdfDoc.embedPng(imageBytes);
  } else {
    // Try JPEG for other formats
    image = await pdfDoc.embedJpg(imageBytes);
  }
  
  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });
  
  return pdfDoc.save();
}

// Convert PDF pages to images (render via canvas on client)
export async function pdfToImages(
  file: File,
  format: 'png' | 'jpeg' = 'png'
): Promise<Blob[]> {
  // We'll use the PDF.js approach - but since we can't easily import it,
  // we'll return a note that this requires the file reader
  // For now, we'll use a workaround with canvas
  throw new Error('PDF to image conversion requires PDF.js library. Please use a PDF viewer approach.');
}
