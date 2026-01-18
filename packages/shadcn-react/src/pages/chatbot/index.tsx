import { useState, useRef,useEffect}from 'react';
import { Send } from 'lucide-react';
import { weatherService } from '@/lib/weather';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';

import { Message } from './components/Message';
import { DeepThinking } from './components/DeepThinking';
import { ActionButtons } from './components/ActionButtons';
import { MarkdownContent } from './components/MarkdownContent';
import { ToolCall } from './components/ToolCall';
import { McpServerSelector } from './components/McpServerSelector';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
  deepThinking?: string;
  hasActionButtons?: boolean;
  toolCall?: {
    name: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    result?: string;
  };
  toolCallCount?: number;
  userInput?: string;
}

interface StreamUpdate {
  text?: string;
  deepThinking?: string;
  toolCall?: {
    name: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    result?: string;
  };
  toolCallCount?: number;
  hasActionButtons?: boolean;
  isStreaming?: boolean;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '你好！我是智能助手，可以查询天气和回答问题，请问有什么可以帮助您的？',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  
  const [inputText, setInputText] = useState('');
  const [deepSearch, setDeepSearch] = useState(false);
  const streamingMessageId = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [currentMcpServer, setCurrentMcpServer] = useState<string>('');




  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userInput = inputText;
    setInputText('');

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: userInput,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const botMessageId = (Date.now() + 1).toString();
    streamingMessageId.current = botMessageId;

    const botMessage: ChatMessage = {
      id: botMessageId,
      text: '',
      isUser: false,
      timestamp: new Date(),
      isStreaming: true,
      userInput: userInput,
    };
    setMessages((prev) => [...prev, botMessage]);

    const onStreamUpdate = (update: StreamUpdate) => {
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, ...update }
            : msg
        )
      );
    };

    try {
      await streamBotResponse(userInput, onStreamUpdate, deepSearch);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: '抱歉，出现错误，请稍后重试。', isStreaming: false }
            : msg
        )
      );
    } finally {
      streamingMessageId.current = null;
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSearch = (text: string) => {
    window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(text)}`, '_blank');
  };

  const handleRegenerate = (text: string) => {
    setInputText(text);
    handleSendMessage();
  };

  return (
    <div className="flex flex-col h-full p-6">
      <h1 className="text-2xl font-bold mb-6">智能助手</h1>
      
 
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 bg-primary text-primary-foreground">
          <h2 className="text-lg font-semibold">智能聊天机器人</h2>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {!message.isUser && message.deepThinking && (
                <DeepThinking content={message.deepThinking} />
              )}
              {!message.isUser && message.toolCall && (
                <ToolCall
                  toolName={message.toolCall.name}
                  status={message.toolCall.status}
                  result={message.toolCall.result}
                  toolCallCount={message.toolCallCount}
                />
              )}
              <div className={message.isUser ? '' : 'bg-gray-50 dark:bg-gray-900 rounded-lg p-4'}>
                {message.isUser ? (
                  <Message
                    text={message.text}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                    isStreaming={message.isStreaming}
                  />
                ) : (
                  <MarkdownContent content={message.text} />
                )}
              </div>
              {!message.isUser && message.hasActionButtons && !message.isStreaming && (
                <ActionButtons
                  onSearch={() => handleSearch(message.userInput || message.text)}
                  onRegenerate={() => handleRegenerate(message.userInput || message.text)}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入您的问题，可以查询天气或询问其他问题..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4 mr-2" />
              发送
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Toggle
              pressed={deepSearch}
              onPressedChange={setDeepSearch}
              variant="outline"
              size="sm"
            >
              深度搜索
            </Toggle>
            <span className="text-xs text-muted-foreground">
              {deepSearch ? '深度搜索已开启' : '深度搜索已关闭'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

async function streamBotResponse(userInput: string, onStreamUpdate: (update: StreamUpdate) => void, deepSearch: boolean) {
  await callMcpChat(userInput, onStreamUpdate, deepSearch);
}

async function callMcpChat(userInput: string, onStreamUpdate: (update: StreamUpdate) => void, deepSearch: boolean) {
  const abortController = new AbortController();

  try {
    console.log('Calling mcp-chat with input:', userInput, 'deepSearch:', deepSearch);
    const response = await fetch('http://localhost:3500/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userContent: userInput, deepSearch }),
      signal: abortController.signal,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';
    let deepThinkingStarted = false;
    let deepThinkingContent = '';
    let toolCallStatus: 'pending' | 'running' | 'completed' | 'error' | null = null;
    let toolCallName = '';
    let toolCallResult = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        console.log('Received chunk:', chunk);
        const parts = chunk.split('###ABC###');

        for (const part of parts) {
          if (!part.trim()) continue;

          try {
            const data = JSON.parse(part);
            console.log('Parsed data:', data);
            
            if (data.type === 'modelSummary' && data.content) {
              if (deepThinkingStarted && deepThinkingContent) {
                accumulatedText += data.content;
                onStreamUpdate({
                  text: accumulatedText,
                  deepThinking: deepThinkingContent,
                  hasActionButtons: true
                });
              } else {
                accumulatedText += data.content;
                onStreamUpdate({
                  text: accumulatedText,
                  hasActionButtons: true
                });
              }
            } else if (data.type === 'deepThinking' && data.content) {
              deepThinkingStarted = true;
              deepThinkingContent += data.content;
              onStreamUpdate({
                text: accumulatedText,
                deepThinking: deepThinkingContent
              });
            } else if (data.type === 'toolCallStart' && data.content) {
              toolCallStatus = 'running';
              toolCallName = data.content;
              console.log('前端收到工具调用开始事件:', data.content);
              onStreamUpdate({
                text: accumulatedText,
                deepThinking: deepThinkingContent,
                toolCall: { name: toolCallName, status: toolCallStatus }
              });
            } else if (data.type === 'mcpContent' && data.content) {
              toolCallStatus = 'completed';
              toolCallResult = data.content;
              const toolCallCount = data.toolCallCount || 1;
              console.log('前端收到MCP内容事件:', data.content);
              if (deepThinkingStarted && deepThinkingContent) {
                accumulatedText += data.content;
                onStreamUpdate({
                  text: accumulatedText,
                  deepThinking: deepThinkingContent,
                  hasActionButtons: true,
                  toolCall: { name: toolCallName, status: toolCallStatus, result: toolCallResult },
                  toolCallCount: toolCallCount
                });
              } else {
                accumulatedText += `\n${data.content}\n`;
                onStreamUpdate({
                  text: accumulatedText,
                  hasActionButtons: true,
                  toolCall: { name: toolCallName, status: toolCallStatus, result: toolCallResult },
                  toolCallCount: toolCallCount
                });
              }
            } else if (data.type === 'stockData' && data.content) {
              try {
                const stockData = JSON.parse(data.content);
                console.log('前端收到股票数据事件:', stockData);
                onStreamUpdate({
                  stockData: stockData
                });
              } catch (parseError) {
                console.error('Parse stock data error:', parseError);
              }
            } else if (data.type === 'error' && data.content) {
              accumulatedText += data.content;
              onStreamUpdate({
                text: accumulatedText,
                isStreaming: false
              });
              return;
            }
          } catch (parseError) {
            console.error('Parse error:', parseError, 'Part:', part);
          }
        }
      }
    }

    onStreamUpdate({
      isStreaming: false,
      hasActionButtons: true
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Request was aborted');
    } else {
      console.error('Error calling mcp-chat:', error);
      throw error;
    }
  }
}
