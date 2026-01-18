interface MessageProps {
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

export function Message({ text, isUser, timestamp, isStreaming }: MessageProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${isUser
          ? 'bg-primary text-primary-foreground'
          : 'bg-gray-100 text-gray-800'}
        `}
      >
        <p className="whitespace-pre-wrap">
          {text}
          {isStreaming && <span className="inline-block ml-1 animate-pulse">▊</span>}
        </p>
        <p className={`text-xs mt-1 opacity-70 text-right`}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
