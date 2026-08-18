import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  onClick: () => void;
  featured?: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick, featured = false }) => {
  const Icon = tool.icon;

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col p-6 rounded-3xl text-left w-full h-full overflow-hidden
        border transition-all duration-300 ease-out
        hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
        ${featured
          ? 'bg-white border-gray-200/80 shadow-[0_2px_8px_-4px_rgba(16,16,20,.08)] hover:border-red-200 hover:shadow-[0_28px_60px_-26px_rgba(220,38,38,.42)]'
          : 'bg-white border-gray-200/70 hover:border-gray-300 hover:shadow-[0_24px_54px_-26px_rgba(16,16,20,.28)]'
        }`}
    >
      {/* Hover wash */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-50/0 via-red-50/0 to-red-50/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {tool.isNew && (
        <span className="absolute top-5 right-5 z-10 bg-red-600 text-white text-[9px] font-semibold px-2 py-[3px] rounded-full uppercase tracking-[0.14em] font-mono">
          New
        </span>
      )}

      <div className="relative z-10 mb-5 flex items-center justify-between">
        <div className="p-3 bg-red-50 rounded-2xl w-fit ring-1 ring-red-100/70 group-hover:bg-red-100 group-hover:ring-red-200 transition-colors">
          <Icon className="w-7 h-7 text-red-600" strokeWidth={1.5} />
        </div>
        <ArrowUpRight className="w-[18px] h-[18px] text-gray-300 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-red-500 transition-all duration-300" />
      </div>

      <h3 className="relative z-10 font-display text-[1.0625rem] font-semibold tracking-[-0.022em] text-gray-950 mb-2 group-hover:text-red-700 transition-colors">
        {tool.title}
      </h3>

      <p className="relative z-10 text-[0.8125rem] leading-[1.65] text-gray-500 group-hover:text-gray-600 transition-colors">
        {tool.description}
      </p>
    </button>
  );
};

export default ToolCard;
