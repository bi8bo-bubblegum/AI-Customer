import { useEffect, useRef } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { useChatStore } from '@/store/chat';
import MessageBubble from '@/components/MessageBubble';
import ToolCallCard from '@/components/ToolCallCard';
import ChatInput from '@/components/ChatInput';
import ClearHistoryButton from '@/components/ClearHistoryButton';
import EmptyState from '@/components/EmptyState';
import type { MessageBubbleData } from '@/components/MessageBubble';

/** agent 类型对应的中文标签 */
const agentLabelMap: Record<string, string> = {
  ticket: '票务查询',
  service: '客服咨询',
  complaint: '投诉理赔',
  general: '通用助手',
  router: '路由分发',
};

/** 对话主页面 */
export default function Chat() {
  const {
    messages,
    isLoading,
    streamingMessage,
    toolCalls,
    isStreaming,
    fetchMessages,
    sendMessage,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取最后一条 assistant 消息的 agent_type，用于标题栏显示
  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
  const currentAgentType = lastAssistantMsg?.agent_type;

  /** 自动滚动到底部 */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage, toolCalls]);

  /** 初始化加载历史消息 */
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  /** 发送消息处理 */
  const handleSend = async (content: string) => {
    try {
      await sendMessage(content);
    } catch {
      // 发送失败静默处理，store 已处理状态重置
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* 顶部标题栏 */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-500">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-800">AI 智能客服</h1>
            {currentAgentType && (
              <p className="text-xs text-slate-400">
                当前：{agentLabelMap[currentAgentType] || currentAgentType}
              </p>
            )}
          </div>
        </div>
        <ClearHistoryButton />
      </header>

      {/* 消息列表区域 */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
          </div>
        ) : messages.length === 0 && !isStreaming ? (
          <EmptyState
            icon={<Bot />}
            title="开始对话"
            description="向 AI 智能客服发送消息，获取帮助"
          />
        ) : (
          <div className="space-y-4">
            {/* 渲染历史消息 */}
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg as MessageBubbleData}
              />
            ))}

            {/* 渲染工具调用卡片（流式过程中穿插显示） */}
            {isStreaming &&
              toolCalls.map((tc, idx) => (
                <ToolCallCard
                  key={`${tc.toolName}-${idx}`}
                  name={tc.toolName}
                  args={tc.toolArgs}
                  result={tc.result}
                />
              ))}

            {/* 渲染当前流式消息 */}
            {isStreaming && streamingMessage && (
              <MessageBubble
                message={{
                  role: 'streaming',
                  content: streamingMessage,
                  agent_type: null,
                }}
              />
            )}

            {/* 流式加载中但还没有内容时显示加载指示器 */}
            {isStreaming && !streamingMessage && toolCalls.length === 0 && (
              <div className="flex animate-slide-up items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>思考中...</span>
              </div>
            )}

            {/* 滚动锚点 */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 底部输入区域 */}
      <div className="border-t border-slate-200 bg-white px-6 py-3">
        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  );
}
