from langchain_openai import ChatOpenAI

from app.config import settings

llm = ChatOpenAI(
        model=settings.LLM_MODEL_NAME,
        api_key=settings.LLM_API_KEY,
        base_url=settings.LLM_BASE_URL,
        temperature=0,
        extra_body={"thinking": {"type": "disabled"}}
    )