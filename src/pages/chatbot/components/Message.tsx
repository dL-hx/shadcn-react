import { useState, useEffect } from 'react';

interface MessageProps {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function Message({ text, isUser, timestamp }: MessageProps) {
  const [displayText, setDisplayText] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentLength, setCurrentLength] = useState(0);
  const typingSpeed = 20; // 打字速度，毫秒/字符

  useEffect(() => {
    // 只有机器人消息才应用打字机效果
    if (isUser) {
      setDisplayText(text);
      return;
    }

    // 重置状态
    setCurrentLength(0);
    setDisplayText('');

    // 创建定时器，逐字显示文本
    const timer = setInterval(() => {
      setCurrentLength(prev => {
        const newLength = prev + 1;
        if (newLength > text.length) {
          clearInterval(timer);
          return text.length;
        }
        setDisplayText(text.substring(0, newLength));
        return newLength;
      });
    }, typingSpeed);

    // 清理定时器
    return () => clearInterval(timer);
  }, [text, isUser, typingSpeed]);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${isUser
          ? 'bg-primary text-primary-foreground'
          : 'bg-gray-100 text-gray-800'}
        `}
      >
        <p className="whitespace-pre-wrap">{displayText}</p>
        <p className={`text-xs mt-1 opacity-70 text-right`}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
