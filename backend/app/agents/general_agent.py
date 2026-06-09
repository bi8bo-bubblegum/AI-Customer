from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage

from app.agents import llm
from app.agents.state import AgentState
GENERAL_SYSTEM_PROMPT = """你是道路客运 AI 客服的通用助手。

你的职责：
- 友好地回应用户的问候和闲聊
- 回答与道路客运无关的通用问题
- 当用户的问题不属于票务、服务、投诉范畴时，提供帮助
- 引导用户了解你可以提供的服务

你可以提供的服务：
- 班次查询、票价查询、线路查询
- 服务政策咨询、行李规定、乘车须知
- 投诉、理赔、建议

注意事项：
- 语气友好、热情
- 如果用户的问题与客运相关，引导他们直接描述需求
- 不要编造客运相关信息
"""


async def general_agent(state: AgentState) -> dict:
    messages = [SystemMessage(content=GENERAL_SYSTEM_PROMPT)] + state["messages"]
    response = await llm.ainvoke(messages)

    return {"messages": [response], "current_agent": "general"}