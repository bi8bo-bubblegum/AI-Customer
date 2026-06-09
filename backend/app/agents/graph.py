from langgraph.graph import StateGraph, END
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from app.agents.state import AgentState
from app.agents.router_agent import router_agent
from app.agents.ticket_agent import build_ticket_subgraph
from app.agents.service_agent import build_service_subgraph
from app.agents.complaint_agent import build_complaint_subgraph
from app.agents.general_agent import general_agent


def route_by_intent(state: AgentState) -> str:
    """根据 Router Agent 的意图分类结果路由到对应节点"""
    intent = state.get("intent", "general")
    return intent


def build_graph(checkpointer: AsyncPostgresSaver):
    """构建并编译多 Agent 路由图（使用子图模式）"""
    graph = StateGraph(AgentState)

    # 添加 Router 节点
    graph.add_node("router", router_agent, tags=["agent:router"])

    # 添加专业 Agent 子图节点
    graph.add_node("ticket", build_ticket_subgraph().compile(), tags=["agent:ticket"])
    graph.add_node("service", build_service_subgraph().compile(), tags=["agent:service"])
    graph.add_node("complaint", build_complaint_subgraph().compile(), tags=["agent:complaint"])

    # General Agent 无需工具，直接作为普通节点
    graph.add_node("general", general_agent, tags=["agent:general"])

    # 设置入口
    graph.set_entry_point("router")

    # 添加条件路由边
    graph.add_conditional_edges(
        "router",
        route_by_intent,
        {
            "ticket": "ticket",
            "service": "service",
            "complaint": "complaint",
            "general": "general",
        },
    )

    # 所有专业 Agent 处理完后结束
    graph.add_edge("ticket", END)
    graph.add_edge("service", END)
    graph.add_edge("complaint", END)
    graph.add_edge("general", END)

    return graph.compile(checkpointer=checkpointer)