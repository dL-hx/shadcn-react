import { ChevronDown, ChevronRight, Globe, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ToolCallProps {
  toolName: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: string;
  toolCallCount?: number;
}

export function ToolCall({ toolName, status, result, toolCallCount }: ToolCallProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <CheckCircle2 className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return '准备调用工具...';
      case 'running':
        return '正在调用工具...';
      case 'completed':
        return '工具调用完成';
      case 'error':
        return '工具调用失败';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-gray-50 border-gray-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return '';
    }
  };

  const parseToolResult = (resultStr: string | undefined) => {
    if (!resultStr) return null;
    try {
      const parsed = JSON.parse(resultStr);
      return parsed;
    } catch {
      return null;
    }
  };

  const toolResult = parseToolResult(result);

  return (
    <div className={`border rounded-lg overflow-hidden ${getStatusColor()} my-3`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:opacity-80 transition-opacity text-left"
      >
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-blue-600" />
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">已调用工具</span>
            <span className="text-sm text-gray-500">{toolName}</span>
            {toolCallCount !== undefined && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                第 {toolCallCount} 次调用
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{getStatusText()}</span>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 py-3 border-t bg-white">
          <div className="flex items-start gap-2 mb-2">
            {getStatusIcon()}
            <div className="flex-1">
              <p className="text-sm text-gray-600">{getStatusText()}</p>
            </div>
          </div>
          {result && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2 font-medium">工具返回结果：</p>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                {toolResult ? JSON.stringify(toolResult, null, 2) : result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}