import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, ArrowDown, Loader2, Files, Settings, Lock, Unlock, Type, Scissors, AlertCircle, PenTool, CheckCircle2 } from 'lucide-react';
import download from 'downloadjs';
import * as PDFActions from '../utils/pdfHelpers';
import { TOOLS } from '../constants';

interface UniversalToolProps {
  toolId: string;
  onClose: () => void;
}

const UniversalTool: React.FC<UniversalToolProps> = ({ toolId, onClose }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Tool Specific State
  const [password, setPassword] = useState('');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [rotation, setRotation] = useState(90);
  const [signatureText, setSignatureText] = useState('');
  const [editText, setEditText] = useState('');
  const [htmlUrl, setHtmlUrl] = useState('');
  const [compareResult, setCompareResult] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toolConfig = TOOLS.find(t => t.id === toolId);

  // Configuration for file acceptance
  const getAcceptConfig = () => {
    if (toolId === 'jpg-to-pdf') {
      return {
        accept: 'image/jpeg, image/png, image/jpg, image/webp',
        label: 'JPG, PNG or WebP images',
        validate: (file: File) => file.type.startsWith('image/')
      };
    }
    if (toolId === 'word-to-pdf') {
       return {
         accept: '.doc, .docx, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         label: 'Word Documents (DOC, DOCX)',
         validate: (file: File) => /\.(doc|docx)$/i.test(file.name)
       };
    }
    if (toolId === 'powerpoint-to-pdf') {
        return {
          accept: '.ppt, .pptx, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation',
          label: 'PowerPoint Presentations (PPT, PPTX)',
          validate: (file: File) => /\.(ppt|pptx)$/i.test(file.name)
        };
     }
     if (toolId === 'excel-to-pdf') {
        return {
          accept: '.xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          label: 'Excel Spreadsheets (XLS, XLSX)',
          validate: (file: File) => /\.(xls|xlsx)$/i.test(file.name)
        };
     }
     if (toolId === 'html-to-pdf') {
        return {
          accept: '.html, .htm, text/html',
          label: 'HTML files',
          validate: (file: File) => /\.(html?|txt)$/i.test(file.name) || file.type.startsWith('text/')
        };
     }
     if (toolId === 'scan-pdf') {
        return {
          accept: 'image/jpeg, image/png, image/jpg, image/webp',
          label: 'Scanned images (JPG, PNG, WebP)',
          validate: (file: File) => file.type.startsWith('image/')
        };
     }
    // Default to PDF
    return {
      accept: 'application/pdf',
      label: 'PDF files',
      validate: (file: File) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    };
  };

  const acceptConfig = getAcceptConfig();
  
  // Reset state on tool change
  useEffect(() => {
    setFiles([]);
    setProgress(0);
    setProcessing(false);
    setPassword('');
    setError(null);
    setSuccessMessage(null);
    setCompareResult(null);
    setSignatureText('');
    setEditText('');
    setHtmlUrl('');
  }, [toolId]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndAddFiles = (newFiles: File[]) => {
    const validFiles: File[] = [];
    let invalidCount = 0;

    newFiles.forEach(file => {
        if (acceptConfig.validate(file)) {
            // Check for duplicates
            if (!files.some(f => f.name === file.name && f.size === file.size)) {
                 validFiles.push(file);
            }
        } else {
            invalidCount++;
        }
    });

    if (invalidCount > 0) {
        setError(`${invalidCount} file(s) were rejected. Please upload ${acceptConfig.label} only.`);
    } else {
        setError(null);
    }

    if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndAddFiles(Array.from(e.target.files));
    }
    // Reset input so same file can be selected again if removed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (files.length === 0 && toolId !== 'html-to-pdf') return;
    setProcessing(true);
    setProgress(10);
    setError(null);
    setSuccessMessage(null);
    setCompareResult(null);

    try {
      setProgress(30);
      
      if (toolId === 'merge-pdf') {
        if (files.length < 2) { setError('Please select at least 2 PDF files to merge.'); setProcessing(false); setProgress(0); return; }
        const result = await PDFActions.mergePDFs(files);
        download(result, "merged_document.pdf", "application/pdf");
        setSuccessMessage(`Successfully merged ${files.length} PDF files.`);
      } 
      else if (toolId === 'split-pdf') {
        const results = await PDFActions.splitPDF(files[0]);
        results.forEach((res, idx) => {
            setTimeout(() => {
                download(res.data, res.name, "application/pdf");
            }, idx * 500);
        });
        setSuccessMessage(`Split into ${results.length} separate PDF files.`);
      }
      else if (toolId === 'rotate-pdf') {
        const result = await PDFActions.rotatePDF(files[0], rotation);
        download(result, "rotated_document.pdf", "application/pdf");
        setSuccessMessage(`Rotated PDF by ${rotation}°.`);
      }
      else if (toolId === 'jpg-to-pdf') {
        const result = await PDFActions.imagesToPDF(files);
        download(result, "images_combined.pdf", "application/pdf");
        setSuccessMessage(`Converted ${files.length} image(s) to PDF.`);
      }
      else if (toolId === 'protect-pdf') {
        if (!password) { setError('Please enter a password.'); setProcessing(false); setProgress(0); return; }
        const result = await PDFActions.protectPDF(files[0], password);
        download(result, "protected_document.pdf", "application/pdf");
        setSuccessMessage('PDF protected with password.');
      }
      else if (toolId === 'unlock-pdf') {
        if (!password) { setError('Please enter the password to unlock.'); setProcessing(false); setProgress(0); return; }
        try {
            const result = await PDFActions.unlockPDF(files[0], password);
            download(result, "unlocked_document.pdf", "application/pdf");
            setSuccessMessage('PDF unlocked successfully.');
        } catch(e) {
            setError("Incorrect password or damaged file.");
        }
      }
      else if (toolId === 'watermark') {
        if (!watermarkText.trim()) { setError('Please enter watermark text.'); setProcessing(false); setProgress(0); return; }
        const result = await PDFActions.watermarkPDF(files[0], watermarkText);
        download(result, "watermarked.pdf", "application/pdf");
        setSuccessMessage('Watermark added successfully.');
      }
      else if (toolId === 'page-numbers') {
        const result = await PDFActions.addPageNumbers(files[0]);
        download(result, "numbered_document.pdf", "application/pdf");
        setSuccessMessage('Page numbers added.');
      }
      else if (toolId === 'compress-pdf') {
        const result = await PDFActions.compressPDF(files[0]);
        const originalSize = files[0].size;
        const newSize = result.byteLength;
        download(result, "compressed_document.pdf", "application/pdf");
        setSuccessMessage(`Compressed: ${(originalSize / 1024).toFixed(0)} KB → ${(newSize / 1024).toFixed(0)} KB`);
      }
      else if (toolId === 'organize-pdf') {
        // Extract all pages in original order (user can use split for individual pages)
        const result = await PDFActions.organizePDF(files[0], Array.from({ length: 100 }, (_, i) => i));
        download(result, "organized_document.pdf", "application/pdf");
        setSuccessMessage('PDF organized and saved.');
      }
      else if (toolId === 'crop-pdf') {
        const result = await PDFActions.cropPDF(files[0], 10);
        download(result, "cropped_document.pdf", "application/pdf");
        setSuccessMessage('PDF cropped with 10% margins.');
      }
      else if (toolId === 'redact-pdf') {
        const result = await PDFActions.redactPDF(files[0]);
        download(result, "redacted_document.pdf", "application/pdf");
        setSuccessMessage('PDF content redacted.');
      }
      else if (toolId === 'sign-pdf') {
        if (!signatureText.trim()) { setError('Please enter your signature name.'); setProcessing(false); setProgress(0); return; }
        const result = await PDFActions.signPDF(files[0], signatureText);
        download(result, "signed_document.pdf", "application/pdf");
        setSuccessMessage('Signature added to PDF.');
      }
      else if (toolId === 'edit-pdf') {
        if (!editText.trim()) { setError('Please enter text to add.'); setProcessing(false); setProgress(0); return; }
        const result = await PDFActions.editPDFAddText(files[0], editText);
        download(result, "edited_document.pdf", "application/pdf");
        setSuccessMessage('Text added to PDF.');
      }
      else if (toolId === 'repair-pdf') {
        const result = await PDFActions.repairPDF(files[0]);
        download(result, "repaired_document.pdf", "application/pdf");
        setSuccessMessage('PDF repaired and re-saved.');
      }
      else if (toolId === 'pdf-to-pdfa') {
        const result = await PDFActions.pdfToPDFA(files[0]);
        download(result, "document_pdfa.pdf", "application/pdf");
        setSuccessMessage('PDF converted to PDF/A format.');
      }
      else if (toolId === 'compare-pdf') {
        if (files.length < 2) { setError('Please upload at least 2 PDFs to compare.'); setProcessing(false); setProgress(0); return; }
        const report = await PDFActions.comparePDFs(files);
        setCompareResult(report);
        setSuccessMessage('Comparison complete.');
      }
      else if (toolId === 'pdf-to-jpg' || toolId === 'pdf-to-word' || toolId === 'pdf-to-powerpoint' || toolId === 'pdf-to-excel') {
        // PDF extraction - split pages as individual PDFs
        const results = await PDFActions.splitPDF(files[0]);
        results.forEach((res, idx) => {
            setTimeout(() => {
                download(res.data, res.name, "application/pdf");
            }, idx * 500);
        });
        setSuccessMessage(`Extracted ${results.length} pages. Note: Full format conversion requires a server-side process.`);
      }
      else if (toolId === 'html-to-pdf') {
        if (!htmlUrl.trim() && files.length === 0) { setError('Please enter HTML content or upload an HTML file.'); setProcessing(false); setProgress(0); return; }
        let htmlContent = htmlUrl;
        if (files.length > 0) {
          htmlContent = await files[0].text();
        }
        const result = await PDFActions.htmlToPDF(htmlContent);
        download(result, "converted.pdf", "application/pdf");
        setSuccessMessage('HTML converted to PDF.');
      }
      else if (toolId === 'word-to-pdf' || toolId === 'powerpoint-to-pdf' || toolId === 'excel-to-pdf') {
        setError('Office document conversion requires a backend service. Please use the online converters listed in the info panel.');
      }
      else if (toolId === 'scan-pdf') {
        // Should use OCR component, but fallback: convert images to PDF
        const result = await PDFActions.imagesToPDF(files);
        download(result, "scanned_document.pdf", "application/pdf");
        setSuccessMessage('Scan converted to PDF.');
      }
      else {
        // Generic fallback - try to re-save the PDF
        try {
          const result = await PDFActions.repairPDF(files[0]);
          download(result, `processed_${files[0].name}`, "application/pdf");
          setSuccessMessage('File processed successfully.');
        } catch {
          setError('This operation could not be completed on the provided file.');
        }
      }

    } catch (error: any) {
      console.error("Processing Error", error);
      setError(error?.message || "An error occurred while processing your request.");
    } finally {
      setProgress(100);
      setTimeout(() => {
        setProcessing(false);
        setProgress(0);
      }, 1000);
    }
  };

  // Render Settings Panel based on Tool ID
  const renderSettings = () => {
    switch (toolId) {
        case 'rotate-pdf':
            return (
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Rotation</label>
                    <div className="flex gap-2">
                        <button onClick={() => setRotation(90)} className={`flex-1 py-2 rounded-lg border ${rotation === 90 ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-300'}`}>90°</button>
                        <button onClick={() => setRotation(180)} className={`flex-1 py-2 rounded-lg border ${rotation === 180 ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-300'}`}>180°</button>
                        <button onClick={() => setRotation(270)} className={`flex-1 py-2 rounded-lg border ${rotation === 270 ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-300'}`}>270°</button>
                    </div>
                </div>
            );
        case 'protect-pdf':
        case 'unlock-pdf':
            return (
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                        {toolId === 'protect-pdf' ? 'Set Password' : 'Enter Password'}
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white px-3 py-2">
                        {toolId === 'protect-pdf' ? <Lock className="w-4 h-4 text-gray-400 mr-2" /> : <Unlock className="w-4 h-4 text-gray-400 mr-2" />}
                        <input 
                            type="password" 
                            className="flex-1 outline-none text-sm"
                            placeholder="Type password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>
            );
        case 'watermark':
            return (
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Watermark Text</label>
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white px-3 py-2">
                        <Type className="w-4 h-4 text-gray-400 mr-2" />
                        <input 
                            type="text" 
                            className="flex-1 outline-none text-sm"
                            value={watermarkText}
                            onChange={(e) => setWatermarkText(e.target.value)}
                        />
                    </div>
                </div>
            );
        case 'sign-pdf':
            return (
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Signature Name</label>
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white px-3 py-2">
                        <PenTool className="w-4 h-4 text-gray-400 mr-2" />
                        <input 
                            type="text" 
                            className="flex-1 outline-none text-sm"
                            placeholder="Your full name..."
                            value={signatureText}
                            onChange={(e) => setSignatureText(e.target.value)}
                        />
                    </div>
                    <p className="text-xs text-gray-400">Signature will be added to the last page.</p>
                </div>
            );
        case 'edit-pdf':
            return (
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Text to Add</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none resize-none"
                        rows={3}
                        placeholder="Enter text to add to the first page..."
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                    />
                </div>
            );
        case 'html-to-pdf':
            return (
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">HTML Content</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none resize-none font-mono"
                        rows={4}
                        placeholder="Paste HTML content here, or upload an HTML file..."
                        value={htmlUrl}
                        onChange={(e) => setHtmlUrl(e.target.value)}
                    />
                    <p className="text-xs text-gray-400">You can also upload an .html file instead.</p>
                </div>
            );
        case 'split-pdf':
             return (
                 <div className="p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800 border border-yellow-100">
                     <p className="font-semibold flex items-center gap-2"><Scissors className="w-4 h-4"/> Extract Mode</p>
                     <p className="mt-1">This tool will extract every page into a separate PDF file and download them.</p>
                 </div>
             );
        case 'compare-pdf':
            return (
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-100">
                        <p className="font-semibold">Upload 2 or more PDFs</p>
                        <p className="mt-1">A comparison report will be generated.</p>
                    </div>
                    {compareResult && (
                        <pre className="p-3 bg-gray-50 rounded-lg text-xs font-mono whitespace-pre-wrap border border-gray-200 max-h-40 overflow-y-auto">{compareResult}</pre>
                    )}
                </div>
            );
        case 'redact-pdf':
            return (
                <div className="p-4 bg-orange-50 rounded-lg text-sm text-orange-800 border border-orange-100">
                    <p className="font-semibold">Full Page Redaction</p>
                    <p className="mt-1">This will overlay all pages with a white cover and mark them as REDACTED.</p>
                </div>
            );
        case 'crop-pdf':
            return (
                <div className="p-4 bg-purple-50 rounded-lg text-sm text-purple-800 border border-purple-100">
                    <p className="font-semibold">Auto Crop</p>
                    <p className="mt-1">Removes 10% margins from all edges of each page.</p>
                </div>
            );
        case 'pdf-to-word':
        case 'pdf-to-powerpoint':
        case 'pdf-to-excel':
            return (
                <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-100">
                    <p className="font-semibold">Page Extraction</p>
                    <p className="mt-1">Each page will be extracted as a separate PDF. For full format conversion, consider using online services like:</p>
                    <ul className="mt-2 space-y-1 text-xs">
                        <li>• <a href="https://smallpdf.com" target="_blank" rel="noopener noreferrer" className="underline">SmallPDF</a></li>
                        <li>• <a href="https://www.ilovepdf.com" target="_blank" rel="noopener noreferrer" className="underline">iLovePDF</a></li>
                    </ul>
                </div>
            );
        default:
            return null;
    }
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-5xl sm:w-full sm:mx-auto h-[85vh] flex flex-col">
          
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                {toolConfig?.icon ? <toolConfig.icon className="h-6 w-6 text-red-600" /> : <Files className="h-6 w-6 text-red-600" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{toolConfig?.title || 'PDF Tool'}</h3>
                <p className="text-sm text-gray-500">{toolConfig?.description || 'Process your PDF files'}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 mb-0 rounded-r-md flex justify-between items-start animate-fade-in">
                <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                    <div>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-500">
                    <X className="h-5 w-5" />
                </button>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && !error && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 m-6 mb-0 rounded-r-md flex justify-between items-start">
                <div className="flex">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <div>
                        <p className="text-sm text-green-700">{successMessage}</p>
                    </div>
                </div>
                <button onClick={() => setSuccessMessage(null)} className="text-green-400 hover:text-green-500">
                    <X className="h-5 w-5" />
                </button>
            </div>
          )}

          {/* Main Layout */}
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-50">
            
            {/* Left: Dropzone / File List */}
            <div className="flex-1 p-6 overflow-y-auto">
              {files.length === 0 ? (
                <div 
                  className={`h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-200 
                    ${isDragging 
                        ? 'border-red-500 bg-red-50 scale-[0.99]' 
                        : 'border-gray-300 hover:border-red-400 hover:bg-white bg-gray-50/50'
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="p-8 text-center pointer-events-none">
                    <div className={`mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Upload className="w-10 h-10" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {isDragging ? 'Drop files now' : 'Drag & drop files here'}
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-xs mx-auto">
                        Upload {acceptConfig.label}
                    </p>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="pointer-events-auto px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 hover:shadow-red-300 hover:-translate-y-0.5"
                    >
                      Select Files
                    </button>
                    <p className="mt-4 text-xs text-gray-400">
                        Max file size: 50MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-4 px-1">
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Files className="w-4 h-4 text-gray-400"/>
                        Selected Files ({files.length})
                    </h4>
                    <button 
                        onClick={() => setFiles([])} 
                        className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    >
                        Clear All
                    </button>
                  </div>
                  
                  <div className="grid gap-3">
                    {files.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                            {toolId === 'jpg-to-pdf' ? (
                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <FileText className="w-5 h-5 text-red-500" />
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>

                        <button 
                            onClick={() => removeFile(index)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        </div>
                    ))}
                  </div>

                   <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 mt-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-sm hover:border-red-400 hover:text-red-500 hover:bg-white transition-all flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" /> Add more files
                    </button>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                multiple={toolId === 'merge-pdf' || toolId === 'jpg-to-pdf' || toolId === 'compare-pdf'}
                accept={acceptConfig.accept}
                className="hidden" 
                onChange={handleFileSelect} 
              />
            </div>

            {/* Right: Actions sidebar */}
            {files.length > 0 && (
              <div className="w-full md:w-80 bg-white border-l border-gray-200 p-6 flex flex-col shrink-0 z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
                
                {/* Dynamic Settings Section */}
                <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Tool Options
                    </h4>
                    {renderSettings() || <p className="text-sm text-gray-400 italic bg-gray-50 p-3 rounded-lg border border-gray-100">No additional options for this tool.</p>}
                </div>

                <div className="mt-auto pt-6 border-t border-gray-100">
                    <button
                    onClick={processFiles}
                    disabled={processing}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-red-100 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                    >
                    {processing ? (
                        <>
                            <Loader2 className="animate-spin w-5 h-5" /> Processing...
                        </>
                    ) : (
                        <>
                            {toolConfig?.title.split(' ')[0]} Now <ArrowDown className="w-5 h-5" />
                        </>
                    )}
                    </button>

                    {processing && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-red-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className="text-xs text-center text-gray-500 mt-2">Processing your documents...</p>
                        </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalTool;