import React from 'react';
import { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  const Icon = tool.icon;

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left w-full h-full"
    >
      {tool.isNew && (
        <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          New!
        </span>
      )}
      
      <div className="mb-4 p-3 bg-red-50 rounded-lg w-fit group-hover:bg-red-100 transition-colors">
        <Icon className="w-8 h-8 text-red-500" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
        {tool.title}
      </h3>
      
      <p className="text-sm text-gray-500 leading-relaxed">
        {tool.description}
      </p>
    </button>
  );
};

export default ToolCard;