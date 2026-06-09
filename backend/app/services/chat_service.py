import json
import uuid
from typing import Optional

from langchain_core.messages import HumanMessage
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.graph import build_graph
from app.database import async_session_factory
from app.models import Message
from app.repositories.message_repo import MessageRepo
from app.schemas.chat import SSETokenEvent, SSEToolResultEvent, SSEToolCallEvent, SSEDoneEvent, MessageResponse


def _parse_uuid(user_id) -> uuid.UUID:
    if isinstance(user_id, uuid.UUID):
        return user_id
    return uuid.UUID(str(user_id))


class ChatService:

    @staticmethod
    async def get_messages(db: AsyncSession, user_id: str, limit: int = 50, offset: int = 0):
        messages = await MessageRepo.get_by_user(db, user_id, limit, offset)
        return [MessageResponse.model_validate(msg) for msg in messages]

    @staticmethod
    async def clear_history(db: AsyncSession, user_id: str):
        count = await MessageRepo.delete_by_user(db, user_id)
        return count > 0

    @staticmethod
    async def clear_checkpoint(checkpointer: AsyncPostgresSaver, thread_id: str):
        """清理 LangGraph checkpoint，重置对话上下文"""
        from sqlalchemy import text
        from app.database import async_session_factory

        async with async_session_factory() as db:
            # 删除该 thread_id 的所有 checkpoint 记录
            await db.execute(
                text("DELETE FROM checkpoints WHERE thread_id = :thread_id"),
                {"thread_id": thread_id},
            )
            await db.execute(
                text("DELETE FROM checkpoint_writes WHERE thread_id = :thread_id"),
                {"thread_id": thread_id},
            )
            await db.execute(
                text("DELETE FROM checkpoint_blobs WHERE thread_id = :thread_id"),
                {"thread_id": thread_id},
            )
            await db.commit()

    @staticmethod
    async def save_message(db: AsyncSession, user_id, role: str, content: str, agent_type: str = None):
        message = Message(
            user_id=_parse_uuid(user_id),
            role=role,
            content=content,
            agent_type=agent_type
        )
        return await MessageRepo.create(db, message)

    @staticmethod
    async def stream_chat(
            db: AsyncSession,
            checkpointer,
            user_id: str,
            content: str
    ):
        graph = build_graph(checkpointer=checkpointer)

        user_id_str = str(user_id)
        await ChatService.save_message(db, user_id, 'user', content)

        input_data = {
            'messages':[HumanMessage(content=content)],
            'user_id': user_id_str,
            'intent':'',
            'current_agent': ''
        }
        config = {
            'configurable': {
                'thread_id': user_id_str,
                'user_id': user_id_str,
            }
        }
        full_response = ''
        agent_type = 'general'
        async for event in graph.astream_events(input_data, config=config, version='v2'):
            kind = event['event']
            metadata = event.get('metadata', {})
            # 当前事件所属的 LangGraph 节点名
            langgraph_node = metadata.get('langgraph_node', '')

            if kind == 'on_chat_model_stream':
                # 跳过 router 节点的流式输出（router 输出的是意图分类 JSON，不应展示给用户）
                if langgraph_node == 'router':
                    continue
                chunk = event['data']['chunk']
                if hasattr(chunk, 'content') and chunk.content:
                    token = chunk.content if isinstance(chunk.content, str) else ''
                    if token:
                        full_response += token
                        yield f"data: {SSETokenEvent(content=token).model_dump_json()}\n\n"

            elif kind == "on_chat_model_end":
                # 捕获 agent_type
                tags = event.get("tags", [])
                for tag in tags:
                    if tag.startswith("agent:"):
                        agent_type = tag.split(":")[1]

            elif kind == "on_tool_start":
                tool_name = event.get("name", "")
                tool_args = event.get("data", {}).get("input", {})
                yield f"data: {SSEToolCallEvent(tool_name=tool_name, tool_args=tool_args).model_dump_json()}\n\n"

            elif kind == "on_tool_end":
                tool_name = event.get("name", "")
                tool_result = str(event.get("data", {}).get("output", ""))
                yield f"data: {SSEToolResultEvent(tool_name=tool_name, result=tool_result).model_dump_json()}\n\n"

            # 保存助手回复（使用独立 session，避免 StreamingResponse 结束后请求级 session 已关闭）
        async with async_session_factory() as save_db:
            await ChatService.save_message(save_db, user_id, "assistant", full_response, agent_type=agent_type)
            await save_db.commit()

        yield f"data: {SSEDoneEvent(agent_type=agent_type).model_dump_json()}\n\n"
