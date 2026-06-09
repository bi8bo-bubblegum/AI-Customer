from datetime import date

from langchain_core.messages import SystemMessage
from langgraph.constants import END, START
from langgraph.graph import StateGraph
from langgraph.prebuilt import ToolNode

from app.agents import llm
from app.agents.state import AgentState
from app.agents.tools.bus_query import search_bus_info

TICKET_SYSTEM_PROMPT = """你是道路客运票务助手，专门负责处理票务相关问题。

你的职责：
- 帮助用户查询班次、票价、线路、余票等信息
- 解答退改签相关问题
- 提供出行建议

工作方式：
1. 先使用 search_bus_info 工具查询相关信息
2. 根据查询结果，用友好、专业的语气为用户解答
3. 如果查询不到相关信息，如实告知用户

注意事项：
- 回答要准确，基于工具查询结果，不要编造信息
- 票价和余票信息以系统查询结果为准
- 如果用户需要退改签，告知相关政策（如知识库中有）
- 当用户提到相对日期（明天、后天等），直接将中文传给工具的 date 参数，工具会自动解析
"""

ticket_tools = [search_bus_info]

async def ticket_llm_node(state: AgentState):
    llm_with_tools = llm.bind_tools(tools=ticket_tools)
    today = date.today()
    weekday_names = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
    today_info = f"\n\n当前日期：{today.strftime('%Y-%m-%d')}（{weekday_names[today.isoweekday() - 1]}）"
    system_content = TICKET_SYSTEM_PROMPT + today_info
    messages = [SystemMessage(content=system_content)] + state["messages"]
    response = await llm_with_tools.ainvoke(messages)

    return {"messages": [response], "current_agent": "ticket"}

def should_continue(state: AgentState) -> str:
    """判断是否需要继续调用工具"""
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return END

def build_ticket_subgraph():
    subgraph = StateGraph(AgentState)

    subgraph.add_node("llm", ticket_llm_node)
    subgraph.add_node("tools", ToolNode(ticket_tools))

    subgraph.add_edge(START, "llm")
    subgraph.add_conditional_edges("llm", should_continue, {"tools": "tools", END: END})
    subgraph.add_edge("tools", "llm")

    return subgraph