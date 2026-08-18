import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, FileText } from 'lucide-react';
import { NAV_STRUCTURE } from '../constants';

interface NavbarProps {
  onNavigate: () => void;
  onToolClick?: (toolId: string) => void;
}

const prettify = (item: string) =>
  item
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
    .replace('Pdf', 'PDF')
    .replace('Jpg', 'JPG')
    .replace('Html', 'HTML')
    .replace('Ocr', 'OCR')
    .replace('Pdfa', 'PDF/A');

const Navbar: React.FC<NavbarProps> = ({ onNavigate, onToolClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 glass-nav transition-all duration-300 ${
        scrolled
          ? 'border-b border-gray-200/80 shadow-[0_1px_24px_-8px_rgba(16,16,20,.16)]'
          : 'border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[68px]">
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={onNavigate}>
            <div className="shrink-0 flex items-center gap-2.5">
              <div className="bg-red-600 p-2 rounded-xl shadow-[0_8px_20px_-8px_rgba(220,38,38,.85)] transition-transform group-hover:scale-105">
                <FileText className="h-[22px] w-[22px] text-white" strokeWidth={2} />
              </div>
              <span className="font-display text-[1.4rem] font-semibold text-gray-950 tracking-[-0.05em]">
                K-PDF's
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_STRUCTURE.map((group) => (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(group.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={`flex items-center px-3.5 py-2 text-[0.875rem] font-medium tracking-[-0.01em] rounded-xl transition-colors ${
                    activeDropdown === group.label
                      ? 'text-gray-950 bg-gray-100/80'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100/70'
                  }`}
                >
                  {group.label}
                  <ChevronDown
                    className={`ml-1.5 h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${
                      activeDropdown === group.label ? 'rotate-180 text-gray-600' : ''
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {activeDropdown === group.label && (
                  <div className="absolute left-0 top-full pt-2 z-50 animate-scale-in">
                    <div className="w-[17rem] rounded-2xl bg-white/95 backdrop-blur-xl shadow-[0_24px_60px_-18px_rgba(16,16,20,.28)] ring-1 ring-gray-900/[0.07] p-2">
                      <div className="px-3 pt-2 pb-2.5 mb-1 text-eyebrow text-gray-400 border-b border-gray-100">
                        {group.label}
                      </div>
                      {group.items.map((item) => (
                        <button
                          key={item}
                          onClick={() => {
                            setActiveDropdown(null);
                            onToolClick?.(item);
                          }}
                          className="block w-full text-left px-3 py-2.5 rounded-xl text-[0.875rem] font-medium tracking-[-0.01em] text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          {prettify(item)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-gray-700 hover:text-gray-950 hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/97 backdrop-blur-xl border-t border-gray-100 animate-fade-in">
          <div className="px-3 pt-3 pb-4 space-y-1 max-h-[72vh] overflow-y-auto">
            {NAV_STRUCTURE.map((group) => (
              <div key={group.label} className="border-b border-gray-100 pb-3 mb-3 last:border-0 last:mb-0">
                <div className="px-3 py-2 text-eyebrow text-gray-400">{group.label}</div>
                {group.items.map((item) => (
                  <button
                    key={item}
                    className="block w-full text-left px-3 py-2.5 text-[0.9375rem] font-medium tracking-[-0.01em] text-gray-700 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onToolClick?.(item);
                    }}
                  >
                    {prettify(item)}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
