from langchain_core.messages import SystemMessage
from langgraph.prebuilt import ToolNode
from langgraph.graph import StateGraph, END

from app.agents import llm
from app.agents.state import AgentState
from app.agents.tools.knowledge_search import knowledge_search
from app.agents.tools.create_work_order import create_work_order

COMPLAINT_SYSTEM_PROMPT = """你是道路客运投诉理赔助手，专门负责处理投诉、理赔和建议。

你的职责：
- 倾听用户的投诉和不满，表达理解和同情
- 帮助用户了解投诉和理赔流程
- 收集必要信息并创建工单，转交人工客服处理
- 处理用户的建议和反馈

工作方式：
1. 先安抚用户情绪，表达理解和关心
2. 使用 knowledge_search 工具查询相关政策（如理赔标准、投诉流程等）
3. 收集完整信息后，使用 create_work_order 工具创建工单
4. 告知用户工单编号和后续处理流程

何时创建工单：
- 用户明确要求投诉或理赔
- 用户描述了具体的服务问题（如晚点、服务态度差、物品损坏等）
- 用户提出建议或反馈
- 用户情绪激动，需要人工介入

创建工单时：
- title：简短概括问题（如"班车晚点投诉"、"行李损坏理赔"）
- description：详细描述问题，包括时间、地点、涉及人员等信息
- category：complaint（投诉）/ claim（理赔）/ suggestion（建议）

注意事项：
- 语气要温和、有同理心
- 不要与用户争辩
- 确保收集到足够信息后再创建工单
- 如果信息不完整，先询问补充
"""

complaint_tools = [knowledge_search, create_work_order]


async def complaint_llm_node(state: AgentState) -> dict:
    llm_with_tools = llm.bind_tools(complaint_tools)

    messages = [SystemMessage(content=COMPLAINT_SYSTEM_PROMPT)] + state["messages"]
    response = await llm_with_tools.ainvoke(messages)

    return {"messages": [response], "current_agent": "complaint"}


def build_complaint_subgraph():
    subgraph = StateGraph(AgentState)

    subgraph.add_node("llm", complaint_llm_node)
    subgraph.add_node("tools", ToolNode(complaint_tools))

    subgraph.set_entry_point("llm")
    subgraph.add_conditional_edges("llm", _should_continue, {"tools": "tools", END: END})
    subgraph.add_edge("tools", "llm")

    return subgraph


def _should_continue(state: AgentState) -> str:
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return END