import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ToolCard from './components/ToolCard';
import OCRDemo from './components/OCRDemo';
import UniversalTool from './components/UniversalTool';
import { TOOLS } from './constants';
import { ArrowRight, Star, ShieldCheck, Zap } from 'lucide-react';

interface AppProps {
  onReady?: () => void;
}

function App({ onReady }: AppProps) {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  useEffect(() => {
    // Remove loading screen once the app has fully rendered
    onReady?.();
  }, [onReady]);

  // Filter specific categories for display sections
  const popularTools = TOOLS.filter(t => ['merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-word', 'pdf-to-jpg'].includes(t.id));

  const handleToolClick = (id: string) => {
    setActiveToolId(id);
  };

  const closeTool = () => {
    setActiveToolId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar 
        onNavigate={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
        onToolClick={handleToolClick}
      />

      {/* Hero Section */}
      <section className="bg-[#1a1a1a] text-white pt-20 pb-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4a4a4a_1px,transparent_1px)] bg-size-[16px_16px]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Every tool you need to work with PDFs in one place
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light">
            Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <button 
                onClick={() => handleToolClick('merge-pdf')}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
             >
                Merge PDFs Now <ArrowRight className="w-5 h-5" />
             </button>
             <button 
                onClick={() => handleToolClick('ocr-pdf')}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm font-semibold py-4 px-8 rounded-xl text-lg transition-colors flex items-center justify-center gap-2 border border-white/10"
             >
                Try Smart OCR <Zap className="w-5 h-5 text-yellow-400 fill-current" />
             </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-20">
        
        {/* Popular Tools Section (Highlighted) */}
        <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Star className="text-yellow-400 fill-current" /> Most Popular Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onClick={() => handleToolClick(tool.id)} />
            ))}
            </div>
        </div>

        {/* All Tools Grid */}
        <div id="all-tools">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                All PDF Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {TOOLS.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onClick={() => handleToolClick(tool.id)} />
            ))}
            </div>
        </div>
      </main>

      {/* Trust Section */}
      <section className="bg-white border-t border-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-12">The PDF software trusted by millions of users</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-6">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">100% Secure</h3>
                      <p className="text-gray-500">We do not store your files. Documents are processed and deleted from our servers automatically.</p>
                  </div>
                  <div className="p-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
                      <p className="text-gray-500">Processing happens in seconds. No installation required, works in your browser.</p>
                  </div>
                  <div className="p-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
                      <p className="text-gray-500">High-fidelity conversion ensures your documents look exactly as intended.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-red-600 p-1.5 rounded-lg">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">K-PDF's</span>
            </div>
            <p className="text-sm text-gray-500 mb-2">
                Your all-in-one PDF toolkit. Fast, secure, and free.
            </p>
            <p className="text-xs text-gray-600">
                © 2024 K-PDF's. All rights reserved. Your files are processed locally and never stored.
            </p>
        </div>
      </footer>

      {/* Tool Modals */}
      {activeToolId && (
        ['ocr-pdf', 'scan-pdf'].includes(activeToolId) 
            ? <OCRDemo onClose={closeTool} />
            : <UniversalTool toolId={activeToolId} onClose={closeTool} />
      )}
    </div>
  );
}

export default App;