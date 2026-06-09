/** 用户信息响应 */
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** 认证响应（登录/注册成功后返回） */
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/** 聊天消息响应 */
export interface MessageResponse {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent_type: string | null;
  created_at: string;
}

/** SSE 流式 token 事件 */
export interface SSETokenEvent {
  type: 'token';
  content: string;
}

/** SSE 工具调用事件 */
export interface SSEToolCallEvent {
  type: 'tool_call';
  tool_name: string;
  tool_args: Record<string, unknown>;
}

/** SSE 工具结果事件 */
export interface SSEToolResultEvent {
  type: 'tool_result';
  tool_name: string;
  result: string;
}

/** SSE 完成事件 */
export interface SSEDoneEvent {
  type: 'done';
  agent_type: string;
}

/** SSE 事件联合类型 */
export type SSEEvent =
  | SSETokenEvent
  | SSEToolCallEvent
  | SSEToolResultEvent
  | SSEDoneEvent;

/** 知识库文档响应 */
export interface KnowledgeDocumentResponse {
  id: string;
  title: string;
  file_name: string;
  file_path: string;
  chunk_count: number;
  uploaded_by: string;
  created_at: string;
}

/** 工单响应 */
export interface WorkOrderResponse {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'complaint' | 'claim' | 'suggestion';
  status: 'pending' | 'processing' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_to: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
}

/** 更新工单请求 */
export interface UpdateWorkOrderRequest {
  status?: string;
  priority?: string;
  assigned_to?: string;
  resolution?: string;
}

/** 通用 API 响应包装 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
