import json

from langchain_core.messages import HumanMessage
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.graph import build_graph
from app.repositories.message_repo import MessageRepo
from app.schemas.chat import SSETokenEvent, SSEToolResultEvent, SSEToolCallEvent, SSEDoneEvent


class ChatService:

    @staticmethod
    async def get_messages(db: AsyncSession, user_id: str, limit: int = 50, offset: int = 0):
        return await MessageRepo.get_by_user(db, user_id, limit, offset)

    @staticmethod
    async def clear_history(db: AsyncSession, user_id: str):
        count = await MessageRepo.delete_by_user(db, user_id)
        return count > 0

    @staticmethod
    async def save_message(db: AsyncSession, user_id: str, role: str, content: str, agent_type: str = None):
        return await MessageRepo.create(db, user_id, role, content, agent_type)

    @staticmethod
    async def stream_chat(
            db: AsyncSession,
            checkpointer,
            user_id: str,
            content: str
    ):
        graph = build_graph(checkpointer=checkpointer)

        await ChatService.save_message(db, user_id, 'user', content)

        input_data = {
            'messages':[HumanMessage(content=content)],
            'user_id': user_id,
            'intent':'',
            'current_agent': ''
        }
        config = {
            'configurable': {
                'thread_id': user_id
            }
        }
        full_response = ''
        agent_type = 'general'
        async for event in graph.astream_events(input_data, config=config, version='v2'):
            kind = event['event']
            if kind == 'on_chat_model_stream':
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

            # 保存助手回复
        await ChatService.save_message(db, user_id, "assistant", full_response, agent_type=agent_type)

        yield f"data: {SSEDoneEvent(agent_type=agent_type).model_dump_json()}\n\n"
