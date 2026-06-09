import { useState } from 'react';
import { Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/** 工具名称中文映射 */
const toolNameMap: Record<string, string> = {
  search_bus_info: '班次查询',
  knowledge_search: '知识检索',
  create_work_order: '创建工单',
};

interface ToolCallCardProps {
  name: string;
  args: Record<string, unknown>;
  result?: string;
  defaultExpanded?: boolean;
}

/** 工具调用卡片组件 */
export default function ToolCallCard({ name, args, result, defaultExpanded = false }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const displayName = toolNameMap[name] || name;

  return (
    <div className="animate-slide-up rounded-lg border-l-4 border-sky-400 bg-sky-50">
      {/* 标题行 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-sky-100/60 transition-colors"
      >
        <Wrench className="h-4 w-4 shrink-0 text-sky-500" />
        <span className="font-medium text-slate-700">{displayName}</span>
        {expanded ? (
          <ChevronUp className="ml-auto h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="ml-auto h-4 w-4 text-slate-400" />
        )}
      </button>

      {/* 展开内容 */}
      {expanded && (
        <div className="space-y-2 border-t border-sky-200/60 px-3 py-2">
          {/* 调用参数 */}
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">调用参数</p>
            <pre className="overflow-x-auto rounded-md bg-white/80 p-2 text-xs text-slate-700 font-mono">
              {JSON.stringify(args, null, 2)}
            </pre>
          </div>

          {/* 执行结果 */}
          {result && (
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">执行结果</p>
              <pre className={cn(
                'overflow-x-auto rounded-md p-2 text-xs font-mono',
                'bg-emerald-50 text-emerald-800',
              )}>
                {result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
