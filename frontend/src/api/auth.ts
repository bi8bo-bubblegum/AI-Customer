import client from './client';
import type { AuthResponse, UserResponse } from '@/types';

/** 注册新用户 */
export async function register(data: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>('/auth/register', data);
  return res.data;
}

/** 用户登录 */
export async function login(data: {
  username: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>('/auth/login', data);
  return res.data;
}

/** 刷新 access token */
export async function refreshToken(
  refresh_token: string,
): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>('/auth/refresh', {
    refresh_token,
  });
  return res.data;
}

/** 获取当前用户信息 */
export async function getMe(): Promise<UserResponse> {
  const res = await client.get<UserResponse>('/auth/me');
  return res.data;
}
