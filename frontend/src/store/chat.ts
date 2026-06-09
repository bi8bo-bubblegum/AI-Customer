import { create } from 'zustand';
import * as chatApi from '@/api/chat';
import type { MessageResponse, SSEEvent } from '@/types';

/** 工具调用记录 */
export interface ToolCallRecord {
  toolName: string;
  toolArgs: Record<string, unknown>;
  result?: string;
}

interface ChatState {
  /** 聊天消息列表 */
  messages: MessageResponse[];
  /** 是否正在加载历史消息 */
  isLoading: boolean;
  /** 当前流式响应中的消息内容 */
  streamingMessage: string;
  /** 工具调用记录 */
  toolCalls: ToolCallRecord[];
  /** 是否正在流式接收中 */
  isStreaming: boolean;
}

interface ChatActions {
  /** 获取历史消息 */
  fetchMessages: () => Promise<void>;
  /** 发送消息（SSE 流式） */
  sendMessage: (content: string) => Promise<void>;
  /** 清空聊天历史 */
  clearHistory: () => Promise<void>;
  /** 追加流式 token */
  addToken: (token: string) => void;
  /** 记录工具调用 */
  setToolCall: (toolName: string, toolArgs: Record<string, unknown>) => void;
  /** 记录工具调用结果 */
  setToolResult: (toolName: string, result: string) => void;
  /** 完成流式接收 */
  finishStreaming: (agentType: string) => void;
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  messages: [],
  isLoading: false,
  streamingMessage: '',
  toolCalls: [],
  isStreaming: false,

  fetchMessages: async () => {
    set({ isLoading: true });
    try {
      const messages = await chatApi.getMessages();
      set({ messages });
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (content: string) => {
    // 先将用户消息加入列表
    const userMessage: MessageResponse = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      agent_type: null,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      streamingMessage: '',
      toolCalls: [],
      isStreaming: true,
    }));

    try {
      const response = await chatApi.sendMessage(content);

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 按 SSE 格式解析：以 \n\n 分隔事件
        const parts = buffer.split('\n\n');
        // 最后一段可能不完整，保留在 buffer 中
        buffer = parts.pop() || '';

        for (const part of parts) {
          // 解析 data: 行
          const dataLines = part
            .split('\n')
            .filter((line) => line.startsWith('data: '))
            .map((line) => line.slice(6));

          for (const dataStr of dataLines) {
            if (dataStr.trim() === '[DONE]') continue;

            try {
              const event: SSEEvent = JSON.parse(dataStr);
              const { type } = event;

              if (type === 'token') {
                get().addToken((event as { type: 'token'; content: string }).content);
              } else if (type === 'tool_call') {
                const e = event as {
                  type: 'tool_call';
                  tool_name: string;
                  tool_args: Record<string, unknown>;
                };
                get().setToolCall(e.tool_name, e.tool_args);
              } else if (type === 'tool_result') {
                const e = event as {
                  type: 'tool_result';
                  tool_name: string;
                  result: string;
                };
                get().setToolResult(e.tool_name, e.result);
              } else if (type === 'done') {
                const e = event as { type: 'done'; agent_type: string };
                get().finishStreaming(e.agent_type);
              }
            } catch {
              // 解析失败的 SSE 数据忽略
            }
          }
        }
      }

      // 如果流结束但未收到 done 事件，也结束流式状态
      if (get().isStreaming) {
        get().finishStreaming('unknown');
      }
    } catch (error) {
      // 发送失败，结束流式状态
      set({ isStreaming: false });
      throw error;
    }
  },

  clearHistory: async () => {
    await chatApi.clearHistory();
    set({ messages: [], streamingMessage: '', toolCalls: [] });
  },

  addToken: (token: string) => {
    set((state) => ({
      streamingMessage: state.streamingMessage + token,
    }));
  },

  setToolCall: (toolName: string, toolArgs: Record<string, unknown>) => {
    set((state) => ({
      toolCalls: [...state.toolCalls, { toolName, toolArgs }],
    }));
  },

  setToolResult: (toolName: string, result: string) => {
    set((state) => ({
      toolCalls: state.toolCalls.map((tc) =>
        tc.toolName === toolName ? { ...tc, result } : tc,
      ),
    }));
  },

  finishStreaming: (agentType: string) => {
    const { streamingMessage, messages } = get();

    // 将流式消息转为正式消息加入列表
    if (streamingMessage) {
      const assistantMessage: MessageResponse = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: streamingMessage,
        agent_type: agentType,
        created_at: new Date().toISOString(),
      };

      set({
        messages: [...messages, assistantMessage],
        streamingMessage: '',
        isStreaming: false,
      });
    } else {
      set({ isStreaming: false });
    }
  },
}));
