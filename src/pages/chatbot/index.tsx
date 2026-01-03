import { useState } from 'react';
import { Send } from 'lucide-react';
import { weatherService } from '@/lib/weather';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { Message } from './components/Message';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '你好！我是天气查询助手，请问有什么可以帮助您的？',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  
  const [inputText, setInputText] = useState('');

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: '正在查询...',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      // Generate bot response using the dedicated function
      const botResponse = await generateBotResponse(inputText);
      
      // Remove typing indicator
      setMessages((prev) => prev.filter(msg => msg.id !== typingMessage.id));
      
      // Add bot response
      const botMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: botResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      // Remove typing indicator
      setMessages((prev) => prev.filter(msg => msg.id !== typingMessage.id));
      
      // Add error message
      const botMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: '查询天气时出现错误，请稍后重试。',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <h1 className="text-2xl font-bold mb-6">天气助手</h1>
      
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 bg-primary text-primary-foreground">
          <h2 className="text-lg font-semibold">天气查询机器人</h2>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <Message
              key={message.id}
              text={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}
        </div>
        
        <div className="p-4 border-t flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入您的问题，例如：北京的天气如何？"
            className="flex-1"
          />
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4 mr-2" />
            发送
          </Button>
        </div>
      </Card>
    </div>
  );
}

function extractCityFromInput(input: string): string | null {
  const cityPattern = /(北京|上海|广州|深圳|杭州|成都|武汉|西安|重庆|南京|天津|苏州|郑州|长沙|东莞|宁波|佛山|合肥|青岛|昆明|沈阳|厦门|济南|福州|哈尔滨|大连|温州|南宁|贵阳|太原|石家庄|南昌)/;
  const match = input.match(cityPattern);
  return match ? match[1] : null;
}

async function generateBotResponse(userInput: string): Promise<string> {
  const lowerInput = userInput.toLowerCase();
  
  // Weather query detection
  if (lowerInput.includes('天气') || lowerInput.includes('温度')) {
    const city = extractCityFromInput(userInput);
    
    if (city) {
      const result = await weatherService.getWeather(city);
      
      if (result.success && result.data) {
        const { data } = result;
        return `${data.icon} ${data.city}天气情况：
温度：${data.temperature}
天气：${data.description}
湿度：${data.humidity}
风速：${data.windSpeed}`;
      } else {
        return result.message || '查询失败，请稍后重试';
      }
    } else {
      return '请告诉我您想查询哪个城市的天气，例如：北京的天气如何？';
    }
  }
  
  // Greeting response
  if (lowerInput.includes('你好') || lowerInput.includes('嗨') || lowerInput.includes('hi')) {
    return '你好！我是天气查询助手，请问有什么可以帮助您的？';
  }
  
  // Help response
  if (lowerInput.includes('帮助') || lowerInput.includes('怎么用') || lowerInput.includes('功能')) {
    return '我可以帮您查询天气信息。您可以这样问我：\n- 北京的天气如何？\n- 上海今天的温度是多少？\n- 广州明天有雨吗？';
  }
  
  // Default response
  return '抱歉，我不太明白您的意思。请问您想查询哪个城市的天气？';
}
