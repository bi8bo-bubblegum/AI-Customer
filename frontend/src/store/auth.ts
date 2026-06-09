import { create } from 'zustand';
import * as authApi from '@/api/auth';
import type { UserResponse } from '@/types';

interface AuthState {
  /** 当前用户信息 */
  user: UserResponse | null;
  /** access token */
  token: string | null;
  /** refresh token */
  refreshToken: string | null;
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 是否为管理员 */
  isAdmin: boolean;
}

interface AuthActions {
  /** 用户登录 */
  login: (username: string, password: string) => Promise<void>;
  /** 用户注册 */
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  /** 退出登录 */
  logout: () => void;
  /** 从 localStorage 恢复登录状态 */
  loadFromStorage: () => void;
}

/** 从 localStorage 读取初始认证状态（同步，在 store 创建时执行） */
function getInitialState() {
  const token = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const userStr = localStorage.getItem('user');

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr) as UserResponse;
      return { user, token, refreshToken, isAuthenticated: true, isAdmin: user.role === 'admin' };
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }
  return { user: null, token: null, refreshToken: null, isAuthenticated: false, isAdmin: false };
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...getInitialState(),

  login: async (username: string, password: string) => {
    const { access_token, refresh_token } = await authApi.login({ username, password });

    // 存储到 localStorage
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);

    // 获取用户信息
    const user = await authApi.getMe();
    localStorage.setItem('user', JSON.stringify(user));

    set({
      user,
      token: access_token,
      refreshToken: refresh_token,
      isAuthenticated: true,
      isAdmin: user.role === 'admin',
    });
  },

  register: async (username: string, email: string, password: string) => {
    const { access_token, refresh_token } = await authApi.register({ username, email, password });

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);

    // 注册后自动获取用户信息
    const user = await authApi.getMe();
    localStorage.setItem('user', JSON.stringify(user));

    set({
      user,
      token: access_token,
      refreshToken: refresh_token,
      isAuthenticated: true,
      isAdmin: user.role === 'admin',
    });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as UserResponse;
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
        });
      } catch {
        // 解析失败，清除无效数据
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    }
  },
}));
