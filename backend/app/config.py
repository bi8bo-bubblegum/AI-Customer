from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # 应用配置
    APP_NAME: str = "AI-Customer"
    DEBUG: bool = False

    # 数据库配置
    DATABASE_URL: str
    CHECKPOINTER_DATABASE_URL: str

    # JWT 配置
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # LLM 配置
    LLM_BASE_URL: str
    LLM_API_KEY: str
    LLM_MODEL_NAME: str
    LLM_TEMPERATURE: float = 0.3

    # Embedding 配置
    EMBEDDING_BASE_URL: str
    EMBEDDING_API_KEY: str
    EMBEDDING_MODEL_NAME: str
    EMBEDDING_DIMENSION: int = 1536

    # RAG 配置
    RAG_CHUNK_SIZE: int = 500
    RAG_CHUNK_OVERLAP: int = 50
    RAG_TOP_K: int = 5

    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 50

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }

settings = Settings()



