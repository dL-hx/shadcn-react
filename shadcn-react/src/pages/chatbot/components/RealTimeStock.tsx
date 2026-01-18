import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RealTimeStockData {
  name: string;
  currentPrice: number;
  openPrice: number;
  closePrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  change: number;
  changePercent: string;
  updateTime: string;
}

interface RealTimeStockProps {
  data: RealTimeStockData;
}

export function RealTimeStock({ data }: RealTimeStockProps) {
  if (!data) {
    return null;
  }

  const isUp = data.change > 0;
  const isDown = data.change < 0;
  const isFlat = data.change === 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">{data.name}</h3>
        <div className={`flex items-center gap-2 ${isUp ? 'text-red-500' : isDown ? 'text-green-500' : 'text-gray-500'}`}>
          {isUp && <TrendingUp className="w-5 h-5" />}
          {isDown && <TrendingDown className="w-5 h-5" />}
          {isFlat && <Minus className="w-5 h-5" />}
          <span className="text-2xl font-bold">{data.currentPrice.toFixed(2)}</span>
          <span className="text-lg font-medium">
            {isUp ? '+' : ''}{data.change} ({isUp ? '+' : ''}{data.changePercent}%)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <p className="text-sm text-gray-500 mb-1">今开</p>
          <p className="text-lg font-semibold">{data.openPrice.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <p className="text-sm text-gray-500 mb-1">昨收</p>
          <p className="text-lg font-semibold">{data.closePrice.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <p className="text-sm text-gray-500 mb-1">最高</p>
          <p className="text-lg font-semibold">{data.highPrice.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <p className="text-sm text-gray-500 mb-1">最低</p>
          <p className="text-lg font-semibold">{data.lowPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>成交量: {(data.volume / 10000).toFixed(2)}万手</span>
        <span>更新时间: {new Date(data.updateTime).toLocaleString('zh-CN')}</span>
      </div>
    </div>
  );
}