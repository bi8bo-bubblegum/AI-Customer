import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

/** agent 类型对应的颜色和标签 */
const agentConfig: Record<string, { label: string; color: string }> = {
  ticket: { label: '票务查询', color: 'bg-blue-100 text-blue-700' },
  service: { label: '客服咨询', color: 'bg-emerald-100 text-emerald-700' },
  complaint: { label: '投诉理赔', color: 'bg-orange-100 text-orange-700' },
  general: { label: '通用助手', color: 'bg-gray-100 text-gray-700' },
  router: { label: '路由分发', color: 'bg-purple-100 text-purple-700' },
};

/** 消息气泡支持的数据类型 */
export interface MessageBubbleData {
  role: 'user' | 'assistant' | 'streaming';
  content: string;
  agent_type?: string | null;
}

interface MessageBubbleProps {
  message: MessageBubbleData;
}

/** AI 消息的 Markdown 样式 */
const markdownClass = {
  // 基础
  base: 'text-sm leading-relaxed',
  // 段落
  p: 'mb-2 last:mb-0',
  // 标题
  h3: 'text-base font-semibold mb-2 mt-3 first:mt-0',
  h4: 'text-sm font-semibold mb-1.5 mt-2 first:mt-0',
  // 列表
  ul: 'list-disc pl-5 mb-2 space-y-0.5',
  ol: 'list-decimal pl-5 mb-2 space-y-0.5',
  li: 'text-sm',
  // 表格
  table: 'w-full border-collapse my-2 text-xs',
  thead: 'bg-slate-200/60',
  th: 'border border-slate-300 px-2 py-1 text-left font-semibold',
  td: 'border border-slate-300 px-2 py-1',
  // 代码
  code: 'bg-slate-200/80 rounded px-1 py-0.5 text-xs font-mono',
  pre: 'bg-slate-200/80 rounded-lg p-3 my-2 overflow-x-auto text-xs',
  // 引用
  blockquote: 'border-l-3 border-sky-400 pl-3 my-2 text-slate-600',
  // 分割线
  hr: 'border-slate-300 my-3',
  // 加粗/斜体
  strong: 'font-semibold',
  em: 'italic',
};

/** 消息气泡组件 */
export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isStreaming = message.role === 'streaming';

  // 获取 agent 标签配置
  const agentInfo = message.agent_type ? agentConfig[message.agent_type] : null;

  return (
    <div
      className={cn(
        'flex animate-slide-up',
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      <div className={cn('max-w-[75%] space-y-1', isUser ? 'items-end' : 'items-start')}>
        {/* AI 消息的 agent 类型标签 */}
        {!isUser && agentInfo && (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              agentInfo.color,
            )}
          >
            {agentInfo.label}
          </span>
        )}

        {/* 消息气泡 */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5',
            isUser
              ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white whitespace-pre-wrap text-sm leading-relaxed'
              : 'bg-slate-100 text-slate-800',
          )}
        >
          {isUser ? (
            message.content
          ) : (
            <div className={markdownClass.base}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className={markdownClass.p}>{children}</p>,
                  h3: ({ children }) => <h3 className={markdownClass.h3}>{children}</h3>,
                  h4: ({ children }) => <h4 className={markdownClass.h4}>{children}</h4>,
                  ul: ({ children }) => <ul className={markdownClass.ul}>{children}</ul>,
                  ol: ({ children }) => <ol className={markdownClass.ol}>{children}</ol>,
                  li: ({ children }) => <li className={markdownClass.li}>{children}</li>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2">
                      <table className={markdownClass.table}>{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className={markdownClass.thead}>{children}</thead>,
                  th: ({ children }) => <th className={markdownClass.th}>{children}</th>,
                  td: ({ children }) => <td className={markdownClass.td}>{children}</td>,
                  code: ({ className, children, ...props }) => {
                    const isBlock = className?.includes('language-');
                    if (isBlock) {
                      return (
                        <pre className={markdownClass.pre}>
                          <code className={className} {...props}>{children}</code>
                        </pre>
                      );
                    }
                    return <code className={markdownClass.code} {...props}>{children}</code>;
                  },
                  blockquote: ({ children }) => <blockquote className={markdownClass.blockquote}>{children}</blockquote>,
                  hr: () => <hr className={markdownClass.hr} />,
                  strong: ({ children }) => <strong className={markdownClass.strong}>{children}</strong>,
                  em: ({ children }) => <em className={markdownClass.em}>{children}</em>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          {/* 流式消息打字光标 */}
          {isStreaming && (
            <span className="typing-cursor ml-0.5 inline-block h-4 w-0.5 animate-blink bg-slate-500 align-text-bottom" />
          )}
        </div>
      </div>
    </div>
  );
}
