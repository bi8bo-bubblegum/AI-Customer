import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useChatStore } from '@/store/chat';
import ConfirmModal from '@/components/ConfirmModal';

/** 清空历史按钮组件 */
export default function ClearHistoryButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const clearHistory = useChatStore((s) => s.clearHistory);

  const handleConfirm = async () => {
    try {
      await clearHistory();
    } catch {
      // 清空失败静默处理
    }
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>清空对话</span>
      </button>

      <ConfirmModal
        open={showConfirm}
        title="清空对话记录"
        message="确定要清空所有对话记录吗？此操作不可恢复。"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
