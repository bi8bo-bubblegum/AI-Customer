from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from langgraph.prebuilt import ToolNode
from langgraph.graph import StateGraph, END

from app.agents import llm
from app.agents.state import AgentState
from app.agents.tools.knowledge_search import knowledge_search

SERVICE_SYSTEM_PROMPT = """你是道路客运服务咨询助手，专门负责处理服务相关问题。

你的职责：
- 解答站点设施相关问题（洗手间、餐饮、停车等）
- 解答行李规定相关问题（尺寸、重量限制等）
- 解答乘车须知（检票、候车、换乘等）
- 解答服务政策（退改签规则、特殊旅客服务等）
- 解答失物招领相关问题

工作方式：
1. 使用 knowledge_search 工具搜索知识库中的相关信息
2. 根据检索结果，用友好、专业的语气为用户解答
3. 如果知识库中没有相关信息，如实告知并建议联系人工客服

注意事项：
- 回答要基于知识库检索结果，不要编造信息
- 如果信息不确定，明确告知用户
- 语气要友好、耐心
"""

service_tools = [knowledge_search]


async def service_llm_node(state: AgentState) -> dict:
    llm_with_tools = llm.bind_tools(service_tools)

    messages = [SystemMessage(content=SERVICE_SYSTEM_PROMPT)] + state["messages"]
    response = await llm_with_tools.ainvoke(messages)

    return {"messages": [response], "current_agent": "service"}


def build_service_subgraph():
    subgraph = StateGraph(AgentState)

    subgraph.add_node("llm", service_llm_node)
    subgraph.add_node("tools", ToolNode(service_tools))

    subgraph.set_entry_point("llm")
    subgraph.add_conditional_edges("llm", _should_continue, {"tools": "tools", END: END})
    subgraph.add_edge("tools", "llm")

    return subgraph


def _should_continue(state: AgentState) -> str:
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return END