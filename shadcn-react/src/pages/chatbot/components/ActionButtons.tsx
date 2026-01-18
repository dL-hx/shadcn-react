import { Search, RefreshCw } from 'lucide-react';

interface ActionButtonsProps {
  onSearch?: () => void;
  onRegenerate?: () => void;
}

export function ActionButtons({ onSearch, onRegenerate }: ActionButtonsProps) {
  return (
    <div className="flex gap-2 mt-3">
      {onSearch && (
        <button
          onClick={onSearch}
          className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
        >
          <Search className="w-4 h-4" />
          搜索
        </button>
      )}
      {onRegenerate && (
        <button
          onClick={onRegenerate}
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          重新生成
        </button>
      )}
    </div>
  );
}