import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null;

  return (
    // 背景遮罩
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* 弹窗主体 */}
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        {/* 图标 + 标题 */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>

        {/* 描述文字 */}
        <p className="mb-6 text-sm text-slate-500">{message}</p>

        {/* 按钮组 */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium text-slate-600',
              'bg-gray-100 hover:bg-gray-200 transition-colors'
            )}
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium text-white',
              'bg-rose-500 hover:bg-rose-600 transition-colors'
            )}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
