import { create } from 'zustand';
import * as workorderApi from '@/api/workorder';
import type { WorkOrderResponse, UpdateWorkOrderRequest } from '@/types';

interface WorkOrderState {
  orders: WorkOrderResponse[];
  currentOrder: WorkOrderResponse | null;
  isLoading: boolean;
  statusFilter: string | null;
  fetchOrders: (status?: string) => Promise<void>;
  fetchOrder: (id: string) => Promise<void>;
  updateOrder: (id: string, data: UpdateWorkOrderRequest) => Promise<void>;
  setStatusFilter: (status: string | null) => void;
}

export const useWorkOrderStore = create<WorkOrderState>((set) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  statusFilter: null,

  fetchOrders: async (status?: string) => {
    set({ isLoading: true });
    try {
      const orders = await workorderApi.getWorkOrders(status);
      set({ orders });
    } catch (error) {
      console.error('获取工单列表失败:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOrder: async (id: string) => {
    set({ isLoading: true });
    try {
      const order = await workorderApi.getWorkOrder(id);
      set({ currentOrder: order });
    } catch (error) {
      console.error('获取工单详情失败:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateOrder: async (id: string, data: UpdateWorkOrderRequest) => {
    try {
      const updated = await workorderApi.updateWorkOrder(id, data);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? updated : o)),
        currentOrder: state.currentOrder?.id === id ? updated : state.currentOrder,
      }));
    } catch (error) {
      console.error('更新工单失败:', error);
      throw error;
    }
  },

  setStatusFilter: (status: string | null) => {
    set({ statusFilter: status });
  },
}));
