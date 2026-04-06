import structlog
from fastapi import APIRouter

from src.config import settings
from src.models import HealthResponse

router = APIRouter()
logger = structlog.get_logger()


def _get_article_count() -> int:
    """Return number of indexed articles from ChromaDB, 0 if not ready."""
    try:
        import chromadb

        client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
        collection = client.get_collection(settings.chroma_collection)
        return collection.count()
    except Exception:
        return 0


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    count = _get_article_count()
    ready = count > 0
    logger.info("health.check", index_ready=ready, article_count=count)
    return HealthResponse(
        status="ok",
        index_ready=ready,
        article_count=count,
        version=settings.version,
    )
