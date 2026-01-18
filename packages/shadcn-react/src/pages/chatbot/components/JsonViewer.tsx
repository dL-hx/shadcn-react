import { Card } from '@/components/ui/card';
import { Code } from 'lucide-react';

interface JsonViewerProps {
  data: string;
  title?: string;
}

export function JsonViewer({ data, title = '原始数据' }: JsonViewerProps) {
  let parsedData;
  try {
    parsedData = JSON.parse(data);
  } catch (error) {
    return (
      <Card className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-2">
        <div className="flex items-center gap-2 mb-2">
          <Code className="h-4 w-4" />
          <h4 className="font-semibold text-sm">{title}</h4>
        </div>
        <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto">
          <code>{data}</code>
        </pre>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-2">
      <div className="flex items-center gap-2 mb-2">
        <Code className="h-4 w-4" />
        <h4 className="font-semibold text-sm">{title}</h4>
      </div>
      <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto">
        <code>{JSON.stringify(parsedData, null, 2)}</code>
      </pre>
    </Card>
  );
}
