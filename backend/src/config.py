from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Ollama
    ollama_base_url: str = "http://host.docker.internal:11434"
    ollama_llm_model: str = "mistral:7b"
    ollama_embed_model: str = "nomic-embed-text"

    # OpenRouter (used when enabled_cloud=True)
    enabled_cloud: bool = False
    openrouter_api_key: str = ""
    openrouter_llm_model: str = "mistralai/ministral-3b-2512"

    # Raw documents directory (all PDFs are indexed)
    raw_docs_dir: str = "./data/raw"

    # ChromaDB
    chroma_persist_dir: str = "./data/chroma"
    chroma_collection: str = "constitution_mz"

    # RAG
    top_k_results: int = 10

    # App
    log_level: str = "info"
    cors_origins: str = "*"
    version: str = "1.0.0"


settings = Settings()
