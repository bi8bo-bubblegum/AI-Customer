import client from './client';
import type { MessageResponse } from '@/types';

/** 获取聊天历史消息 */
export async function getMessages(
  limit?: number,
  offset?: number,
): Promise<MessageResponse[]> {
  const params: Record<string, unknown> = {};
  if (limit !== undefined) params.limit = limit;
  if (offset !== undefined) params.offset = offset;

  const res = await client.get<MessageResponse[]>(
    '/chat/messages',
    { params },
  );
  return res.data;
}

/** 清空聊天历史 */
export async function clearHistory(): Promise<void> {
  await client.delete('/chat/messages');
}

/**
 * 发送聊天消息（SSE 流式响应）
 * 注意：SSE 请求不能使用 axios，需要用原生 fetch + ReadableStream
 * 返回原始 Response 对象，由调用方读取流
 */
export async function sendMessage(content: string): Promise<Response> {
  const token = localStorage.getItem('access_token');

  const response = await fetch('/api/chat/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || `请求失败: ${response.status}`,
    );
  }

  return response;
}
