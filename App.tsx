import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ToolCard from './components/ToolCard';
import OCRDemo from './components/OCRDemo';
import UniversalTool from './components/UniversalTool';
import { TOOLS } from './constants';
import { ArrowRight, Star, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface AppProps {
  onReady?: () => void;
}

const STATS = [
  { value: '28+', label: 'PDF tools' },
  { value: '100%', label: 'Free forever' },
  { value: '0', label: 'Files stored' },
  { value: '<3s', label: 'Avg. process' },
];

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
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <Navbar
        onNavigate={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onToolClick={handleToolClick}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-ink text-white px-4 sm:px-6 pt-24 pb-32">
        {/* Ambient background */}
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[22px_22px]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[520px] bg-red-600/20 blur-[140px] rounded-full animate-float-slow" />
        <div className="absolute -bottom-52 -right-24 w-[520px] h-[420px] bg-orange-500/10 blur-[130px] rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-1.5 backdrop-blur-sm mb-8">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-eyebrow text-white/70">AI-powered document suite</span>
          </div>

          <h1 className="animate-fade-in-up text-[2.6rem] leading-[1.04] sm:text-6xl md:text-7xl font-display font-semibold tracking-[-0.045em] mb-7">
            Every tool you need to work
            <br className="hidden sm:block" />{' '}
            with <span className="font-editorial italic font-normal text-gradient-red pr-1">PDFs</span>
            <span className="text-white/90"> in one place</span>
          </h1>

          <p className="animate-fade-in-up text-lg sm:text-xl text-white/55 mb-11 max-w-2xl mx-auto font-light leading-relaxed">
            Merge, split, compress, convert, rotate, unlock and watermark documents
            in a few clicks. Every tool is 100% free — and your files never leave your browser.
          </p>

          <div className="animate-fade-in-up flex flex-col sm:flex-row justify-center gap-3.5">
            <button
              onClick={() => handleToolClick('merge-pdf')}
              className="group bg-red-600 hover:bg-red-500 text-white font-display font-semibold tracking-tight py-4 px-8 rounded-2xl text-[1.0625rem] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2.5 shadow-[0_10px_40px_-12px_rgba(220,38,38,.7)]"
            >
              Merge PDFs Now
              <ArrowRight className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => handleToolClick('ocr-pdf')}
              className="bg-white/[0.07] hover:bg-white/[0.13] text-white backdrop-blur-sm font-display font-medium tracking-tight py-4 px-8 rounded-2xl text-[1.0625rem] transition-colors flex items-center justify-center gap-2.5 border border-white/12"
            >
              Try Smart OCR
              <Zap className="w-[18px] h-[18px] text-amber-300 fill-current" />
            </button>
          </div>

          {/* Stat strip */}
          <div className="animate-fade-in mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            {STATS.map((s) => (
              <div key={s.label} className="px-5 py-6 bg-white/[0.015]">
                <div className="font-display text-3xl font-semibold tracking-tight text-numeric text-white">{s.value}</div>
                <div className="mt-1.5 text-eyebrow text-white/40">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-14 relative z-20">

        {/* Popular Tools Section (Highlighted) */}
        <div className="mb-20">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span className="text-eyebrow text-red-600">Hand-picked</span>
            </div>
            <h2 className="font-display text-3xl sm:text-[2.125rem] font-semibold tracking-[-0.035em] text-gray-950">
              Most popular tools
            </h2>
            <p className="mt-2.5 text-[0.9375rem] text-gray-500 max-w-xl leading-relaxed">
              The five workflows our users reach for every single day.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onClick={() => handleToolClick(tool.id)} featured />
            ))}
          </div>
        </div>

        {/* All Tools Grid */}
        <div id="all-tools">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8 pb-5 border-b border-gray-200/80">
            <div>
              <span className="text-eyebrow text-gray-400">Complete library</span>
              <h2 className="mt-2 font-display text-3xl sm:text-[2.125rem] font-semibold tracking-[-0.035em] text-gray-950">
                All PDF tools
              </h2>
            </div>
            <span className="font-mono text-xs text-gray-400 text-numeric pb-1.5">
              {TOOLS.length} tools available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {TOOLS.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onClick={() => handleToolClick(tool.id)} />
            ))}
          </div>
        </div>
      </main>

      {/* Trust Section */}
      <section className="bg-white border-t border-gray-200/70 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-eyebrow text-red-600">Why K-PDF's</span>
            <h2 className="mt-3 font-display text-[2rem] sm:text-[2.75rem] leading-[1.1] font-semibold tracking-[-0.04em] text-gray-950">
              The PDF software trusted by
              <span className="font-editorial italic font-normal"> millions</span> of users
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                Icon: ShieldCheck,
                tint: 'text-emerald-600 bg-emerald-50 ring-emerald-100',
                title: '100% Secure',
                body: 'Files are processed right inside your browser. Nothing is uploaded, nothing is stored, nothing is shared.',
              },
              {
                Icon: Zap,
                tint: 'text-blue-600 bg-blue-50 ring-blue-100',
                title: 'Lightning Fast',
                body: 'Processing finishes in seconds. No installs, no sign-ups, no queues — just open a tool and go.',
              },
              {
                Icon: Star,
                tint: 'text-violet-600 bg-violet-50 ring-violet-100',
                title: 'Premium Quality',
                body: 'High-fidelity conversion preserves fonts, layout and images so documents look exactly as intended.',
              },
            ].map(({ Icon, tint, title, body }) => (
              <div
                key={title}
                className="group rounded-3xl border border-gray-200/70 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-[0_24px_60px_-24px_rgba(16,16,20,.18)]"
              >
                <div className={`w-12 h-12 rounded-2xl ring-1 flex items-center justify-center mb-6 ${tint}`}>
                  <Icon className="w-[22px] h-[22px]" strokeWidth={1.8} />
                </div>
                <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-gray-950 mb-2.5">{title}</h3>
                <p className="text-[0.9375rem] leading-relaxed text-gray-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-gray-400 pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="bg-red-600 p-2 rounded-xl shadow-[0_8px_24px_-10px_rgba(220,38,38,.9)]">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-display text-2xl font-semibold tracking-[-0.04em] text-white">K-PDF's</span>
            </div>

            <p className="text-[0.9375rem] text-gray-400 max-w-md leading-relaxed">
              Your all-in-one PDF toolkit —
              <span className="font-editorial italic text-gray-300"> fast, secure and free.</span>
            </p>

            <div className="mt-10 pt-7 border-t border-white/8 w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="font-mono text-[11px] tracking-wide text-gray-600">
                © 2024 K-PDF's · All rights reserved
              </p>
              <p className="font-mono text-[11px] tracking-wide text-gray-600">
                Processed locally · Never stored
              </p>
            </div>
          </div>
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
