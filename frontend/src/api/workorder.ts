import client from './client';
import type { WorkOrderResponse, UpdateWorkOrderRequest } from '@/types';

/** 获取工单列表 */
export async function getWorkOrders(
  status?: string,
  limit?: number,
  offset?: number,
): Promise<WorkOrderResponse[]> {
  const params: Record<string, unknown> = {};
  if (status !== undefined) params.status = status;
  if (limit !== undefined) params.limit = limit;
  if (offset !== undefined) params.offset = offset;

  const res = await client.get<WorkOrderResponse[]>(
    '/workorders',
    { params },
  );
  return res.data;
}

/** 获取工单详情 */
export async function getWorkOrder(
  orderId: string,
): Promise<WorkOrderResponse> {
  const res = await client.get<WorkOrderResponse>(
    `/workorders/${orderId}`,
  );
  return res.data;
}

/** 更新工单 */
export async function updateWorkOrder(
  orderId: string,
  data: UpdateWorkOrderRequest,
): Promise<WorkOrderResponse> {
  const res = await client.put<WorkOrderResponse>(
    `/workorders/${orderId}`,
    data,
  );
  return res.data;
}
