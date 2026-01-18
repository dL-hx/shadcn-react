import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface DeepThinkingProps {
  content: string;
}

export function DeepThinking({ content }: DeepThinkingProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="my-4 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="font-medium text-gray-700">深度思考</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 py-3 border-t border-gray-200 bg-white">
          <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  );
}