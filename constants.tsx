import {
  Scissors, Minimize2, FileType, MonitorPlay, Table,
  Type, Image, PenTool, Stamp, RotateCw, Globe, LockOpen, Lock,
  Layout, Archive, Wrench, Hash, Smartphone, Search, GitCompare,
  EyeOff, Crop, Files, FileText,
  FileSpreadsheet, FileImage
} from 'lucide-react';
import { Tool } from './types';

export const TOOLS: Tool[] = [
  // Organize
  {
    id: 'merge-pdf',
    title: 'Merge PDF',
    description: 'Combine PDFs in the order you want with the easiest PDF merger available.',
    icon: Files,
    category: 'organize'
  },
  {
    id: 'split-pdf',
    title: 'Split PDF',
    description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
    icon: Scissors,
    category: 'organize'
  },
  {
    id: 'organize-pdf',
    title: 'Organize PDF',
    description: 'Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages.',
    icon: Layout,
    category: 'organize'
  },
  {
    id: 'scan-pdf',
    title: 'Scan to PDF',
    description: 'Capture document scans from your mobile device and send them instantly to your browser.',
    icon: Smartphone,
    category: 'organize'
  },

  // Optimize & Repair
  {
    id: 'compress-pdf',
    title: 'Compress PDF',
    description: 'Reduce file size while optimizing for maximal PDF quality.',
    icon: Minimize2,
    category: 'optimize'
  },
  {
    id: 'repair-pdf',
    title: 'Repair PDF',
    description: 'Repair a damaged PDF and recover data from corrupt PDF. Fix PDF files with our Repair tool.',
    icon: Wrench,
    category: 'optimize'
  },
  {
    id: 'ocr-pdf',
    title: 'OCR PDF',
    description: 'Easily convert scanned PDF into searchable and selectable documents.',
    icon: Search,
    category: 'optimize'
  },

  // Convert TO PDF
  {
    id: 'jpg-to-pdf',
    title: 'JPG to PDF',
    description: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.',
    icon: FileImage,
    category: 'convert-to-pdf'
  },
  {
    id: 'word-to-pdf',
    title: 'Word to PDF',
    description: 'Make DOC and DOCX files easy to read by converting them to PDF.',
    icon: FileText,
    category: 'convert-to-pdf'
  },
  {
    id: 'powerpoint-to-pdf',
    title: 'PowerPoint to PDF',
    description: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.',
    icon: MonitorPlay,
    category: 'convert-to-pdf'
  },
  {
    id: 'excel-to-pdf',
    title: 'Excel to PDF',
    description: 'Make EXCEL spreadsheets easy to read by converting them to PDF.',
    icon: FileSpreadsheet,
    category: 'convert-to-pdf'
  },
  {
    id: 'html-to-pdf',
    title: 'HTML to PDF',
    description: 'Convert webpages in HTML to PDF. Copy and paste the URL of the page.',
    icon: Globe,
    category: 'convert-to-pdf'
  },

  // Convert FROM PDF
  {
    id: 'pdf-to-jpg',
    title: 'PDF to JPG',
    description: 'Convert each PDF page into a JPG or extract all images contained in a PDF.',
    icon: Image,
    category: 'convert-from-pdf'
  },
  {
    id: 'pdf-to-word',
    title: 'PDF to Word',
    description: 'Easily convert your PDF files into easy to edit DOC and DOCX documents.',
    icon: FileType,
    category: 'convert-from-pdf'
  },
  {
    id: 'pdf-to-powerpoint',
    title: 'PDF to PowerPoint',
    description: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.',
    icon: MonitorPlay,
    category: 'convert-from-pdf'
  },
  {
    id: 'pdf-to-excel',
    title: 'PDF to Excel',
    description: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.',
    icon: Table,
    category: 'convert-from-pdf'
  },
  {
    id: 'pdf-to-pdfa',
    title: 'PDF to PDF/A',
    description: 'Transform your PDF to PDF/A, the ISO-standardized version of PDF for long-term archiving.',
    icon: Archive,
    category: 'convert-from-pdf'
  },

  // Edit & Security
  {
    id: 'edit-pdf',
    title: 'Edit PDF',
    description: 'Add text, images, shapes or freehand annotations to a PDF document.',
    icon: PenTool,
    category: 'edit-security',
    isNew: true
  },
  {
    id: 'rotate-pdf',
    title: 'Rotate PDF',
    description: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!',
    icon: RotateCw,
    category: 'edit-security'
  },
  {
    id: 'page-numbers',
    title: 'Page numbers',
    description: 'Add page numbers into PDFs with ease. Choose your positions, dimensions, typography.',
    icon: Hash,
    category: 'edit-security'
  },
  {
    id: 'watermark',
    title: 'Watermark',
    description: 'Stamp an image or text over your PDF in seconds. Typography, transparency and position.',
    icon: Stamp,
    category: 'edit-security'
  },
  {
    id: 'crop-pdf',
    title: 'Crop PDF',
    description: 'Crop margins of PDF documents or select specific areas.',
    icon: Crop,
    category: 'edit-security',
    isNew: true
  },
  {
    id: 'unlock-pdf',
    title: 'Unlock PDF',
    description: 'Remove PDF password security, giving you the freedom to use your PDFs as you want.',
    icon: LockOpen,
    category: 'edit-security'
  },
  {
    id: 'protect-pdf',
    title: 'Protect PDF',
    description: 'Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.',
    icon: Lock,
    category: 'edit-security'
  },
  {
    id: 'sign-pdf',
    title: 'Sign PDF',
    description: 'Sign yourself or request electronic signatures from others.',
    icon: PenTool,
    category: 'edit-security'
  },
  {
    id: 'redact-pdf',
    title: 'Redact PDF',
    description: 'Redact text and graphics to permanently remove sensitive information from a PDF.',
    icon: EyeOff,
    category: 'edit-security',
    isNew: true
  },
  {
    id: 'compare-pdf',
    title: 'Compare PDF',
    description: 'Show a side-by-side document comparison and easily spot changes between file versions.',
    icon: GitCompare,
    category: 'edit-security',
    isNew: true
  }
];

export const NAV_STRUCTURE = [
  {
    label: 'Organize PDF',
    items: ['merge-pdf', 'split-pdf', 'organize-pdf', 'scan-pdf']
  },
  {
    label: 'Optimize PDF',
    items: ['compress-pdf', 'repair-pdf', 'ocr-pdf']
  },
  {
    label: 'Convert to PDF',
    items: ['jpg-to-pdf', 'word-to-pdf', 'powerpoint-to-pdf', 'excel-to-pdf', 'html-to-pdf']
  },
  {
    label: 'Convert from PDF',
    items: ['pdf-to-jpg', 'pdf-to-word', 'pdf-to-powerpoint', 'pdf-to-excel', 'pdf-to-pdfa']
  },
  {
    label: 'Edit & Security',
    items: ['edit-pdf', 'rotate-pdf', 'page-numbers', 'watermark', 'crop-pdf', 'unlock-pdf', 'protect-pdf', 'sign-pdf', 'redact-pdf', 'compare-pdf']
  }
];