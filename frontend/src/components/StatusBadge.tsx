import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  type: 'workorder' | 'priority' | 'category';
}

// 工单状态颜色映射
const workorderStatusMap: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  processing: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-gray-200 text-gray-600',
};

// 优先级颜色映射
const priorityMap: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-sky-100 text-sky-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-rose-100 text-rose-700',
};

// 类别颜色映射
const categoryMap: Record<string, string> = {
  complaint: 'bg-rose-100 text-rose-700',
  claim: 'bg-amber-100 text-amber-700',
  suggestion: 'bg-sky-100 text-sky-700',
};

// 中文标签映射
const labelMap: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  closed: '已关闭',
  low: '低',
  normal: '普通',
  high: '高',
  urgent: '紧急',
  complaint: '投诉',
  claim: '理赔',
  suggestion: '建议',
};

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const colorMap =
    type === 'workorder'
      ? workorderStatusMap
      : type === 'priority'
        ? priorityMap
        : categoryMap;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorMap[status] ?? 'bg-gray-100 text-gray-600'
      )}
    >
      {labelMap[status] ?? status}
    </span>
  );
}
