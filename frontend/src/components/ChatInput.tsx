import { useState, useRef, useCallback, useEffect } from 'react';
import { SendHorizontal, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
}

/** 聊天输入框组件 */
export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /** 自适应高度：1~4 行 */
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 24;
    const maxH = lineHeight * 4;
    el.style.height = `${Math.min(el.scrollHeight, maxH)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  /** 发送消息 */
  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    // 重置高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  /** 键盘事件：Enter 发送，Shift+Enter 换行 */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="flex items-end gap-2 rounded-2xl bg-gray-100 px-3 py-2">
      {/* 附件按钮（暂不实现功能） */}
      <button
        className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-gray-200 hover:text-slate-600 transition-colors"
        title="附件（暂未开放）"
      >
        <Paperclip className="h-4 w-4" />
      </button>

      {/* 输入框 */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入消息..."
        rows={1}
        disabled={disabled}
        className={cn(
          'flex-1 resize-none bg-transparent text-sm text-slate-800 placeholder-slate-400',
          'outline-none disabled:opacity-50',
          'scrollbar-thin',
        )}
      />

      {/* 发送按钮 */}
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className={cn(
          'mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all',
          value.trim() && !disabled
            ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md hover:shadow-lg'
            : 'bg-gray-200 text-gray-400',
        )}
      >
        <SendHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}
