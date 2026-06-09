import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkOrderStore } from '@/store/workorder';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import Skeleton from '@/components/Skeleton';
import type { UpdateWorkOrderRequest } from '@/types';

// 状态筛选标签配置
const statusTabs = [
  { key: '', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'processing', label: '处理中' },
  { key: 'resolved', label: '已解决' },
  { key: 'closed', label: '已关闭' },
];

export default function WorkOrders() {
  const {
    orders,
    currentOrder,
    isLoading,
    statusFilter,
    fetchOrders,
    fetchOrder,
    updateOrder,
    setStatusFilter,
  } = useWorkOrderStore();

  // 详情面板展开状态
  const [detailOpen, setDetailOpen] = useState(false);
  // 编辑表单
  const [form, setForm] = useState<UpdateWorkOrderRequest>({});
  const [saving, setSaving] = useState(false);

  // 初始化加载
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 切换筛选
  const handleFilterChange = useCallback(
    (status: string) => {
      setStatusFilter(status || null);
      fetchOrders(status || undefined);
    },
    [setStatusFilter, fetchOrders]
  );

  // 打开详情面板
  const handleOpenDetail = useCallback(
    async (id: string) => {
      await fetchOrder(id);
      setDetailOpen(true);
      // 重置表单
      setForm({});
    },
    [fetchOrder]
  );

  // 关闭详情面板
  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setForm({});
  }, []);

  // 保存更新
  const handleSave = useCallback(async () => {
    if (!currentOrder) return;
    // 只提交有变更的字段
    const hasChange = Object.keys(form).length > 0;
    if (!hasChange) return;
    setSaving(true);
    try {
      await updateOrder(currentOrder.id, form);
      // 刷新列表
      await fetchOrders(statusFilter ?? undefined);
      setDetailOpen(false);
      setForm({});
    } catch {
      // 错误已在 store 中处理
    } finally {
      setSaving(false);
    }
  }, [currentOrder, form, updateOrder, fetchOrders, statusFilter]);

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
        <h1 className="text-2xl font-bold text-slate-900">工单管理</h1>
      </div>

      {/* 状态筛选标签栏 */}
      <div className="mb-6 flex gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleFilterChange(tab.key)}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
              (statusFilter === tab.key || (!statusFilter && tab.key === ''))
                ? 'bg-sky-500 text-white'
                : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 加载骨架屏 */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!isLoading && orders.length === 0 && (
        <EmptyState
          icon={<ClipboardList />}
          title="暂无工单"
        />
      )}

      {/* 工单列表 */}
      {!isLoading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => handleOpenDetail(order.id)}
              className={cn(
                'cursor-pointer rounded-xl bg-white p-5 shadow-sm',
                'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg'
              )}
            >
              {/* 第一行：标题 + 类别标签 */}
              <div className="mb-2 flex items-center gap-3">
                <h3 className="text-sm font-semibold text-slate-900">{order.title}</h3>
                <StatusBadge status={order.category} type="category" />
              </div>

              {/* 第二行：状态 + 优先级 + 时间 */}
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={order.status} type="workorder" />
                <StatusBadge status={order.priority} type="priority" />
                <span className="text-xs text-slate-400">
                  {formatDate(order.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 详情侧滑面板 */}
      {detailOpen && currentOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* 遮罩 */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={handleCloseDetail}
          />
          {/* 面板 */}
          <div className="relative w-full max-w-lg overflow-y-auto bg-white shadow-2xl">
            {/* 面板头部 */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">工单详情</h2>
              <button
                onClick={handleCloseDetail}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 面板内容 */}
            <div className="p-6">
              {/* 基本信息 */}
              <div className="mb-6 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">标题</label>
                  <p className="text-sm text-slate-900">{currentOrder.title}</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">描述</label>
                  <p className="whitespace-pre-wrap text-sm text-slate-700">
                    {currentOrder.description}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">类别</label>
                    <StatusBadge status={currentOrder.category} type="category" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">创建时间</label>
                    <p className="text-sm text-slate-700">{formatDate(currentOrder.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* 分隔线 */}
              <hr className="my-6 border-slate-100" />

              {/* 编辑区域 */}
              <div className="space-y-4">
                {/* 状态更新 */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">状态</label>
                  <select
                    value={form.status ?? currentOrder.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                    className={cn(
                      'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm',
                      'focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400'
                    )}
                  >
                    <option value="pending">待处理</option>
                    <option value="processing">处理中</option>
                    <option value="resolved">已解决</option>
                    <option value="closed">已关闭</option>
                  </select>
                </div>

                {/* 优先级更新 */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">优先级</label>
                  <select
                    value={form.priority ?? currentOrder.priority}
                    onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                    className={cn(
                      'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm',
                      'focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400'
                    )}
                  >
                    <option value="low">低</option>
                    <option value="normal">普通</option>
                    <option value="high">高</option>
                    <option value="urgent">紧急</option>
                  </select>
                </div>

                {/* 处理人 */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">处理人</label>
                  <input
                    type="text"
                    value={form.assigned_to ?? currentOrder.assigned_to ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, assigned_to: e.target.value }))}
                    placeholder="请输入处理人"
                    className={cn(
                      'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm',
                      'focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400'
                    )}
                  />
                </div>

                {/* 处理结果 */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">处理结果</label>
                  <textarea
                    value={form.resolution ?? currentOrder.resolution ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, resolution: e.target.value }))}
                    placeholder="请输入处理结果"
                    rows={4}
                    className={cn(
                      'w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm',
                      'focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400'
                    )}
                  />
                </div>

                {/* 保存按钮 */}
                <button
                  onClick={handleSave}
                  disabled={saving || Object.keys(form).length === 0}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white',
                    'bg-sky-500 hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50',
                    'transition-colors'
                  )}
                >
                  <Save className="h-4 w-4" />
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
