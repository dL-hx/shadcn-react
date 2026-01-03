// 定义天气数据类型
export interface WeatherData {
  city: string;
  temperature: string;
  description: string;
  humidity: string;
  windSpeed: string;
  icon: string;
}

// 查询结果类型
interface WeatherResult {
  success: boolean;
  data?: WeatherData;
  message?: string;
}

// 模拟天气数据
const mockWeatherData: Record<string, WeatherData> = {
  '北京': {
    city: '北京',
    temperature: '5°C',
    description: '晴',
    humidity: '45%',
    windSpeed: '3级',
    icon: '☀️'
  },
  '上海': {
    city: '上海',
    temperature: '12°C',
    description: '多云',
    humidity: '60%',
    windSpeed: '2级',
    icon: '⛅'
  },
  '广州': {
    city: '广州',
    temperature: '20°C',
    description: '阴',
    humidity: '75%',
    windSpeed: '1级',
    icon: '☁️'
  },
  '深圳': {
    city: '深圳',
    temperature: '19°C',
    description: '小雨',
    humidity: '80%',
    windSpeed: '4级',
    icon: '🌧️'
  },
  '杭州': {
    city: '杭州',
    temperature: '8°C',
    description: '晴',
    humidity: '50%',
    windSpeed: '2级',
    icon: '☀️'
  }
}

// 天气查询服务
export const weatherService = {
  // 查询天气
  getWeather: async (city: string): Promise<WeatherResult> => {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 检查城市是否存在于模拟数据中
    const weather = mockWeatherData[city]
    if (weather) {
      return {
        success: true,
        data: weather
      }
    }

    // 如果没有找到城市，返回默认数据或错误
    return {
      success: false,
      message: `未找到"${city}"的天气信息，请尝试其他城市`
    }
  },

  // 获取支持的城市列表
  getSupportedCities: (): string[] => {
    return Object.keys(mockWeatherData)
  }
}