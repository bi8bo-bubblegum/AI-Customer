import { useCallback, useRef, useState } from 'react';
import { Upload, FileText, Trash2, BookOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useKnowledgeStore } from '@/store/knowledge';
import ConfirmModal from '@/components/ConfirmModal';
import EmptyState from '@/components/EmptyState';
import Skeleton from '@/components/Skeleton';

export default function Knowledge() {
  const { documents, isLoading, uploading, fetchDocuments, uploadDocument, deleteDocument } =
    useKnowledgeStore();

  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  // 上传标题弹窗
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [titleInput, setTitleInput] = useState('');
  // 删除确认弹窗
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  // 上传进度（模拟）
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化加载
  useState(() => {
    fetchDocuments();
  });

  // 处理文件选择
  const handleFileSelect = useCallback((file: File) => {
    if (file.type !== 'application/pdf') {
      alert('仅支持 PDF 文件');
      return;
    }
    setPendingFile(file);
    setTitleInput(file.name.replace(/\.pdf$/i, ''));
    setTitleModalOpen(true);
  }, []);

  // 拖拽事件
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  // 点击上传
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
      // 重置 input 以便重复选择同一文件
      e.target.value = '';
    },
    [handleFileSelect]
  );

  // 确认上传
  const handleUploadConfirm = useCallback(async () => {
    if (!pendingFile || !titleInput.trim()) return;
    try {
      // 模拟进度
      setUploadProgress(30);
      await uploadDocument(pendingFile, titleInput.trim());
      setUploadProgress(100);
      // 上传成功后刷新列表
      await fetchDocuments();
    } catch {
      // 错误已在 store 中处理
    } finally {
      setTitleModalOpen(false);
      setPendingFile(null);
      setTitleInput('');
      setUploadProgress(0);
    }
  }, [pendingFile, titleInput, uploadDocument, fetchDocuments]);

  // 确认删除
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteDocument(deleteTarget);
    } catch {
      // 错误已在 store 中处理
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteDocument]);

  // 格式化时间
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* 顶部标题栏 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">知识库管理</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white',
            'bg-sky-500 hover:bg-sky-600 transition-colors'
          )}
        >
          <Upload className="h-4 w-4" />
          上传文档
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {/* 拖拽上传区域 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'mb-8 flex cursor-pointer flex-col items-center justify-center rounded-xl p-8 transition-all',
          isDragging
            ? 'border-2 border-sky-400 bg-sky-50'
            : 'border-2 border-dashed border-sky-300 bg-white hover:border-sky-400'
        )}
      >
        <Upload
          className={cn(
            'mb-3 h-10 w-10',
            isDragging ? 'text-sky-500' : 'text-slate-400'
          )}
        />
        <p className="text-sm text-slate-500">
          拖拽 PDF 文件到此处，或点击上传
        </p>
        {/* 上传进度条 */}
        {uploading && (
          <div className="mt-4 w-full max-w-xs">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-sky-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="mt-1 text-center text-xs text-slate-400">上传中...</p>
          </div>
        )}
      </div>

      {/* 加载骨架屏 */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!isLoading && documents.length === 0 && (
        <EmptyState
          icon={<BookOpen />}
          title="暂无文档"
          description="上传 PDF 开始使用"
        />
      )}

      {/* 文档列表 */}
      {!isLoading && documents.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={cn(
                'group relative rounded-xl bg-white p-5 shadow-sm',
                'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg'
              )}
            >
              {/* 删除按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(doc.id);
                }}
                className={cn(
                  'absolute right-3 top-3 rounded-lg p-1.5 opacity-0 transition-all',
                  'group-hover:opacity-100 hover:bg-rose-50',
                  '[&>svg]:text-slate-400 [&>svg]:hover:text-rose-500'
                )}
              >
                <Trash2 className="h-4 w-4" />
              </button>

              {/* 文件图标 + 标题 */}
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50">
                  <FileText className="h-5 w-5 text-sky-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-slate-900">
                    {doc.title}
                  </h3>
                  <p className="truncate text-xs text-slate-400">{doc.file_name}</p>
                </div>
              </div>

              {/* 底部信息 */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {doc.chunk_count} 切片
                </span>
                <span className="text-xs text-slate-400">
                  {formatDate(doc.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 上传标题弹窗 */}
      {titleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">输入文档标题</h3>
              <button
                onClick={() => {
                  setTitleModalOpen(false);
                  setPendingFile(null);
                  setTitleInput('');
                }}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="请输入文档标题"
              className={cn(
                'mb-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm',
                'focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400'
              )}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUploadConfirm();
              }}
            />
            {pendingFile && (
              <p className="mb-4 text-xs text-slate-400">
                文件：{pendingFile.name} ({(pendingFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setTitleModalOpen(false);
                  setPendingFile(null);
                  setTitleInput('');
                }}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleUploadConfirm}
                disabled={!titleInput.trim() || uploading}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium text-white',
                  'bg-sky-500 hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                {uploading ? '上传中...' : '确认上传'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      <ConfirmModal
        open={!!deleteTarget}
        title="确认删除"
        message="删除后文档及其切片数据将无法恢复，确定要删除吗？"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
