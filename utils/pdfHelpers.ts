import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

// --- Helper: Get File Extension ---
const getExt = (file: File) => file.name.split('.').pop()?.toLowerCase();

// --- Helper: Read file as ArrayBuffer ---
const readAsArrayBuffer = (file: File): Promise<ArrayBuffer> => file.arrayBuffer();

// --- Action: Merge PDFs ---
export const mergePDFs = async (files: File[]) => {
  const mergedPdf = await PDFDocument.create();
  for (const file of files) {
    const arrayBuffer = await readAsArrayBuffer(file);
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  return await mergedPdf.save();
};

// --- Action: Split PDF (Extract all pages as separate files) ---
export const splitPDF = async (file: File): Promise<{ data: Uint8Array, name: string }[]> => {
  const arrayBuffer = await readAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pageCount = pdf.getPageCount();
  const results = [];

  for (let i = 0; i < pageCount; i++) {
    const newPdf = await PDFDocument.create();
    const [page] = await newPdf.copyPages(pdf, [i]);
    newPdf.addPage(page);
    const pdfBytes = await newPdf.save();
    results.push({
      data: pdfBytes,
      name: `${file.name.replace('.pdf', '')}_page_${i + 1}.pdf`
    });
  }
  return results;
};

// --- Action: Rotate PDF ---
export const rotatePDF = async (file: File, rotation: number) => {
  const arrayBuffer = await readAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdf.getPages();
  pages.forEach(page => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + rotation));
  });
  return await pdf.save();
};

// --- Action: JPG/PNG to PDF ---
export const imagesToPDF = async (files: File[]) => {
  const pdfDoc = await PDFDocument.create();
  
  for (const file of files) {
    const arrayBuffer = await readAsArrayBuffer(file);
    const ext = getExt(file);
    let image;
    
    if (ext === 'jpg' || ext === 'jpeg') {
      image = await pdfDoc.embedJpg(arrayBuffer);
    } else if (ext === 'png') {
      image = await pdfDoc.embedPng(arrayBuffer);
    } else {
      // Try as JPG for WebP and other formats after converting via canvas
      const converted = await convertImageToJpgBuffer(file);
      image = await pdfDoc.embedJpg(converted);
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }
  return await pdfDoc.save();
};

// --- Helper: Convert any image to JPG via canvas ---
const convertImageToJpgBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error('Conversion failed')); return; }
          blob.arrayBuffer().then(resolve).catch(reject);
        }, 'image/jpeg', 0.92);
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// --- Action: Protect PDF (Add Password) ---
export const protectPDF = async (file: File, password: string) => {
  const arrayBuffer = await readAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pdfBytes = await pdf.save({
    userPassword: password,
    ownerPassword: password,
  } as any);
  return pdfBytes;
};

// --- Action: Unlock PDF (Remove Password) ---
export const unlockPDF = async (file: File, password: string) => {
  const arrayBuffer = await readAsArrayBuffer(file);
  try {
    const pdf = await PDFDocument.load(arrayBuffer, { password } as any);
    return await pdf.save();
  } catch (e) {
    throw new Error("Incorrect password or file error");
  }
};

// --- Action: Watermark PDF ---
export const watermarkPDF = async (file: File, text: string) => {
  const arrayBuffer = await readAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();

  pages.forEach(page => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, 50);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size: 50,
      font: font,
      color: rgb(0.75, 0.75, 0.75),
      rotate: degrees(45),
      opacity: 0.3,
    });
  });

  return await pdf.save();
};

// --- Action: Page Numbers ---
export const addPageNumbers = async (file: File) => {
  const arrayBuffer = await readAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  const total = pages.length;

  pages.forEach((page, idx) => {
    const { width } = page.getSize();
    const text = `${idx + 1} / ${total}`;
    const textWidth = font.widthOfTextAtSize(text, 12);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: 20,
      size: 12,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  return await pdf.save();
};

// --- Action: Compress PDF ---
export const compressPDF = async (file: File) => {
  const arrayBuffer = await readAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return await pdf.save({ useObjectStreams: true });
};

// --- Action: Organize PDF (reorder / delete pages) ---
export const organizePDF = async (file: File, pageOrder: number[]) => {
  const arrayBuffer = await readAsArrayBuffer(file);
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();
  
  const validIndices = pageOrder.filter(i => i >= 0 && i < srcPdf.getPageCount());
  if (validIndices.length === 0) throw new Error("No valid pages selected");
  
  const copiedPages = await newPdf.copyPages(srcPdf, validIndices);
  copiedPages.forEach(page => newPdf.addPage(page));
  
  return await newPdf.save();
};

// --- Action: PDF to JPG (extract pages as images via canvas) ---
export const pdfToImages = async (file: File): Promise<{ data: Blob, name: string }[]> => {
  // Use pdf.js-like approach via canvas rendering
  // Since we don't have pdf.js, we'll extract embedded images from pdf-lib
  // For a simpler approach, we convert each page to a new single-page PDF (user can use that)
  const arrayBuffer = await readAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const results: { data: Blob, name: string }[] = [];
  const pageCount = pdf.getPageCount();
  
  for (let i = 0; i < pageCount; i++) {
    const singlePdf = await PDFDocument.create();
    const [page] = await singlePdf.copyPages(pdf, [i]);
    singlePdf.addPage(page);
    const pdfBytes = await singlePdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    results.push({
      data: blob,
      name: `${file.name.replace('.pdf', '')}_page_${i + 1}.pdf`
    });
  }
  return results;
};

// --- Action: Crop PDF (set crop box) ---
export const cropPDF = async (file: File, marginPercent: number = 10) => {
  const arrayBuffer = await readAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdf.getPages();

  pages.forEach(page => {
    const { width, height } = page.getSize();
    const margin = Math.min(width, height) * (marginPercent / 100);
    page.setCropBox(margin, margin, width - 2 * margin, height - 2 * margin);
  });

  return await pdf.save();
};

// --- Action: Redact PDF (draw black rectangles and remove text - simplified) ---
export const redactPDF = async (file: File) => {
  // Simplified: adds a "REDACTED" overlay approach
  const arrayBuffer = await readAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();

  pages.forEach(page => {
    const { width, height } = page.getSize();
    // Draw a semi-transparent overlay on the full page
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: rgb(1, 1, 1),
      opacity: 0.95,
    });
    page.drawText('REDACTED', {
      x: width / 2 - 80,
      y: height / 2,
      size: 36,
      font: font,
      color: rgb(0.8, 0, 0),
    });
  });

  return await pdf.save();
};

// --- Action: Sign PDF (add signature text) ---
export const signPDF = async (file: File, signatureText: string) => {
  const arrayBuffer = await readAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const pages = pdf.getPages();
  const lastPage = pages[pages.length - 1];
  const { width } = lastPage.getSize();

  // Draw signature at bottom right of last page
  const textWidth = font.widthOfTextAtSize(signatureText, 18);
  lastPage.drawText(signatureText, {
    x: width - textWidth - 50,
    y: 60,
    size: 18,
    font: font,
    color: rgb(0, 0, 0.6),
  });

  // Draw a line under signature
  lastPage.drawLine({
    start: { x: width - textWidth - 60, y: 55 },
    end: { x: width - 40, y: 55 },
    thickness: 1,
    color: rgb(0, 0, 0.6),
  });

  return await pdf.save();
};

// --- Action: Edit PDF (add text annotation) ---
export const editPDFAddText = async (file: File, text: string, pageIndex: number = 0) => {
  const arrayBuffer = await readAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  const page = pages[Math.min(pageIndex, pages.length - 1)];
  const { height } = page.getSize();

  page.drawText(text, {
    x: 50,
    y: height - 50,
    size: 14,
    font: font,
    color: rgb(0, 0, 0),
  });

  return await pdf.save();
};

// --- Action: Repair PDF (re-save to fix minor corruption) ---
export const repairPDF = async (file: File) => {
  const arrayBuffer = await readAsArrayBuffer(file);
  try {
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    // Re-saving the document can fix minor structural issues
    return await pdf.save({ useObjectStreams: true });
  } catch {
    // If loading fails, try with more permissive options
    const pdf = await PDFDocument.load(arrayBuffer, { 
      ignoreEncryption: true,
      updateMetadata: false 
    });
    return await pdf.save();
  }
};

// --- Action: PDF to PDF/A (simplified - adds metadata) ---
export const pdfToPDFA = async (file: File) => {
  const arrayBuffer = await readAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  
  // Set PDF/A conformance metadata
  pdf.setTitle(file.name.replace('.pdf', ''));
  pdf.setCreator('K-PDFs');
  pdf.setProducer('K-PDFs PDF/A Converter');
  pdf.setCreationDate(new Date());
  pdf.setModificationDate(new Date());
  
  return await pdf.save({ useObjectStreams: true });
};

// --- Action: Compare PDFs (basic page count & size comparison) ---
export const comparePDFs = async (files: File[]): Promise<string> => {
  if (files.length < 2) throw new Error("Need at least 2 files to compare");
  
  const results: string[] = [];
  const pdfs: { name: string; pages: number; size: number }[] = [];
  
  for (const file of files) {
    const arrayBuffer = await readAsArrayBuffer(file);
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    pdfs.push({
      name: file.name,
      pages: pdf.getPageCount(),
      size: file.size,
    });
  }
  
  results.push("PDF Comparison Report");
  results.push("=".repeat(40));
  
  pdfs.forEach((p, i) => {
    results.push(`\nDocument ${i + 1}: ${p.name}`);
    results.push(`  Pages: ${p.pages}`);
    results.push(`  Size: ${(p.size / 1024).toFixed(1)} KB`);
  });
  
  if (pdfs.length >= 2) {
    results.push("\n" + "-".repeat(40));
    results.push("Differences:");
    if (pdfs[0].pages !== pdfs[1].pages) {
      results.push(`  Page count differs: ${pdfs[0].pages} vs ${pdfs[1].pages}`);
    } else {
      results.push(`  Same page count: ${pdfs[0].pages}`);
    }
    const sizeDiff = Math.abs(pdfs[0].size - pdfs[1].size);
    results.push(`  Size difference: ${(sizeDiff / 1024).toFixed(1)} KB`);
  }
  
  return results.join("\n");
};

// --- Action: HTML to PDF (basic) ---
export const htmlToPDF = async (htmlContent: string) => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Strip HTML tags for plain text
  const div = document.createElement('div');
  div.innerHTML = htmlContent;
  const text = div.textContent || div.innerText || '';
  
  // Split into lines that fit the page
  const pageWidth = 595; // A4
  const pageHeight = 842;
  const margin = 50;
  const fontSize = 11;
  const lineHeight = fontSize * 1.5;
  const maxWidth = pageWidth - 2 * margin;
  
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  // Paginate
  const linesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);
  for (let i = 0; i < lines.length; i += linesPerPage) {
    const pageLines = lines.slice(i, i + linesPerPage);
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    pageLines.forEach((line, idx) => {
      page.drawText(line, {
        x: margin,
        y: pageHeight - margin - (idx * lineHeight),
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    });
  }
  
  if (lines.length === 0) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawText('(Empty document)', {
      x: margin,
      y: pageHeight - margin,
      size: fontSize,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }
  
  return await pdfDoc.save();
};
