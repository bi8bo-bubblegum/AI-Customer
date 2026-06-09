import axios from 'axios';
import type { AuthResponse } from '@/types';

// 创建 Axios 实例，baseURL 通过 vite proxy 代理到后端
const client = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 是否正在刷新 token 的标志，防止并发刷新
let isRefreshing = false;
// 等待 token 刷新的请求队列
let pendingRequests: Array<(token: string) => void> = [];

/** 处理 token 刷新，成功后重放所有排队请求 */
async function handleTokenRefresh(): Promise<string> {
  if (isRefreshing) {
    // 已有刷新请求在进行中，排队等待
    return new Promise<string>((resolve) => {
      pendingRequests.push(resolve);
    });
  }

  isRefreshing = true;
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('无 refresh token');
    }

    // 使用独立 axios 实例刷新，避免触发拦截器循环
    const { data: raw } = await axios.post<{ code: number; message: string; data: AuthResponse }>('/api/auth/refresh', {
      refresh_token: refreshToken,
    });

    // 手动解包 ApiResponse
    const tokenData = raw.data;
    const newAccessToken = tokenData.access_token;
    localStorage.setItem('access_token', newAccessToken);
    localStorage.setItem('refresh_token', tokenData.refresh_token);

    // 通知所有排队请求
    pendingRequests.forEach((cb) => cb(newAccessToken));
    pendingRequests = [];

    return newAccessToken;
  } catch (error) {
    // 刷新失败，清除凭证并跳转登录页
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    pendingRequests = [];
    window.location.href = '/login';
    throw error;
  } finally {
    isRefreshing = false;
  }
}

// 请求拦截器：自动添加 Authorization 头
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：统一解包 ApiResponse（后端返回 { code: 0, message, data }）
client.interceptors.response.use(
  (response) => {
    const res = response.data;

    // 如果后端返回的是标准 ApiResponse 格式，解包 data 字段
    if (res && typeof res.code === 'number') {
      if (res.code !== 0) {
        return Promise.reject(new Error(res.message || '请求失败'));
      }
      // 将 response.data 替换为解包后的 data，方便调用方直接使用
      response.data = res.data;
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 且未重试过 → 尝试刷新 token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await handleTokenRefresh();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // 其他错误直接抛出
    const message =
      error.response?.data?.message || error.message || '网络错误';
    return Promise.reject(new Error(message));
  },
);

export default client;
