from langchain_core.tools import tool

from app.database import async_session_factory
from app.services.knowledge_service import KnowledgeService


@tool
async def knowledge_search(query: str):
    """
    搜索知识库，获取相关的服务政策、行李规定、乘车须知、站点设施等信息。
    当用户询问关于服务政策、退改签规则、行李规定、站点设施、乘车须知等问题时使用此工具
    如：买票后多久能退票、可以带易燃物上车吗、多久停止检票等

    Args:
        query: 用户查询的内容
    """
    async with async_session_factory() as db:
        results = await KnowledgeService.search(db, query)
        if not results:
            return "没有找到相关的信息"
        context_parts = []
        for i, r in enumerate(results, 1):
            context_parts.append(f"[{i}]{r['content']}")
        return '以下是从知识库中检索到的相关信息：\n\n' + '\n\n'.join(context_parts)