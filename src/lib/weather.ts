// 定义天气数据类型
export interface WeatherData {
  province: string;
  city: string;
  adcode: string;
  temperature: string;
  temperature_float: string;
  description: string;
  humidity: string;
  humidity_float: string;
  windDirection: string;
  windPower: string;
  reporttime: string;
  icon: string;
}

// 查询结果类型
interface WeatherResult {
  success: boolean;
  data?: WeatherData;
  message?: string;
}

// 定义API基础URL
const API_BASE_URL = 'http://localhost:3000';

// 天气查询服务
export const weatherService = {
  // 查询天气
  getWeather: async (city: string): Promise<WeatherResult> => {
    try {
      // 调用本地mcp服务的query-weather工具
      const response = await fetch(`${API_BASE_URL}/api/query-weather`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: city }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // 解析返回的天气数据
      if (data.status === "1" && data.lives && data.lives.length > 0) {
        const weatherInfo = data.lives[0];
        
        // 根据天气状况选择合适的图标
        let icon = '☀️';
        if (weatherInfo.weather.includes('雨')) {
          icon = '🌧️';
        } else if (weatherInfo.weather.includes('雪')) {
          icon = '❄️';
        } else if (weatherInfo.weather.includes('云')) {
          icon = '☁️';
        } else if (weatherInfo.weather.includes('雾')) {
          icon = '🌫️';
        } else if (weatherInfo.weather.includes('阴')) {
          icon = '🌥️';
        }

        return {
          success: true,
          data: {
            province: weatherInfo.province,
            city: weatherInfo.city || city,
            adcode: weatherInfo.adcode,
            temperature: `${weatherInfo.temperature}°C`,
            temperature_float: weatherInfo.temperature_float || `${parseFloat(weatherInfo.temperature)}.0`,
            description: weatherInfo.weather,
            humidity: `${weatherInfo.humidity}%`,
            humidity_float: weatherInfo.humidity_float || `${parseFloat(weatherInfo.humidity)}.0`,
            windDirection: weatherInfo.winddirection,
            windPower: weatherInfo.windpower,
            reporttime: weatherInfo.reporttime,
            icon: icon
          }
        };
      } else {
        return {
          success: false,
          message: data.info || `未找到"${city}"的天气信息，请尝试其他城市`
        };
      }
    } catch (error) {
      console.error('查询天气失败:', error);
      return {
        success: false,
        message: `查询天气失败，请稍后重试: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  },

  // 获取支持的城市列表
  getSupportedCities: (): string[] => {
    // 由于现在使用真实API，可以支持所有城市，这里返回常用城市列表
    return ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '重庆', '南京'];
  }
}