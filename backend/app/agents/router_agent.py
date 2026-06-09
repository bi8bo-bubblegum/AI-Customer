from typing import Literal

from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

from app.agents import llm
from app.agents.state import AgentState


class RouterOutPut(BaseModel):
    intent: Literal['ticket','service','complaint','general'] = Field(
        description='用户意图：ticket=票务相关，service=服务咨询，complaint=投诉理赔，general=通用/闲聊"'
    )
    reason: str = Field(description='分类理由')

ROUTER_SYSTEM_PROMPT = """你是一个道路客运 AI 客服的意图分流器。你的任务是根据用户的消息判断应该由哪个专业 Agent 来处理。

分类规则：
- ticket：用户询问班次、票价、线路、余票、时刻表、退改签等票务相关问题
- service：用户询问站点设施、行李规定、乘车须知、服务政策、失物招领等服务相关问题
- complaint：用户投诉、理赔、建议、不满情绪、要求人工处理等
- general：问候、闲聊、与客运无关的问题、无法分类的问题

注意：
- 如果用户只是打招呼或闲聊，归类为 general
- 如果用户情绪激动或明确表示不满，优先归类为 complaint
- 如果用户的问题涉及多个类别，选择最核心的类别
- 只根据当前用户消息判断，不要考虑历史上下文

"""
async def router_agent(state: AgentState):
    parser = JsonOutputParser(pydantic_object=RouterOutPut)
    chain = llm | parser
    last_user_msg = ''
    for msg in reversed(state['messages']):
        if msg.type == 'human':
            last_user_msg = msg.content
            break
    system_prompt = ROUTER_SYSTEM_PROMPT + '\n' + parser.get_format_instructions()
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=last_user_msg),
    ]

    result = await chain.ainvoke(messages)
    return {
        'intent': result['intent'],
        'current_agent': result['intent']
    }

