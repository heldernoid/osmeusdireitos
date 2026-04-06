import asyncio
from pathlib import Path

import chromadb
import httpx
import structlog

from src.config import settings
from src.ingestion.parse_constitution import ArticleChunk

logger = structlog.get_logger()

CONCURRENCY = 1  # sequential - avoids Ollama 500 errors on model cold-start


async def _embed_one(client: httpx.AsyncClient, text: str, retries: int = 3) -> list[float]:
    for attempt in range(retries):
        resp = await client.post(
            f"{settings.ollama_base_url}/api/embeddings",
            json={"model": settings.ollama_embed_model, "prompt": text},
            timeout=60.0,
        )
        if resp.status_code == 500 and attempt < retries - 1:
            await asyncio.sleep(1.0 * (attempt + 1))
            continue
        resp.raise_for_status()
        return resp.json()["embedding"]
    raise RuntimeError("embed failed after retries")


async def _embed_batch(texts: list[str]) -> list[list[float]]:
    sem = asyncio.Semaphore(CONCURRENCY)
    async with httpx.AsyncClient() as client:

        async def bounded(text: str) -> list[float]:
            async with sem:
                return await _embed_one(client, text)

        return await asyncio.gather(*[bounded(t) for t in texts])


def _get_or_create_collection(client: chromadb.ClientAPI) -> chromadb.Collection:
    return client.get_or_create_collection(
        name=settings.chroma_collection,
        metadata={"hnsw:space": "cosine"},
    )


def is_indexed() -> bool:
    """Return True if the ChromaDB collection already has documents."""
    try:
        db = chromadb.PersistentClient(path=settings.chroma_persist_dir)
        col = db.get_collection(settings.chroma_collection)
        return col.count() > 0
    except Exception:
        return False


async def embed_and_index(articles: list[ArticleChunk]) -> int:
    """Embed articles and store in ChromaDB. Always wipes and re-indexes."""
    Path(settings.chroma_persist_dir).mkdir(parents=True, exist_ok=True)
    db = chromadb.PersistentClient(path=settings.chroma_persist_dir)

    # Wipe existing collection so removed/updated docs don't linger
    try:
        db.delete_collection(settings.chroma_collection)
        logger.info("index.wiped_collection")
    except Exception:
        pass

    col = _get_or_create_collection(db)

    logger.info("embed.start", articles=len(articles), model=settings.ollama_embed_model)

    # nomic-embed-text context window is 8192 tokens; truncate to 2000 chars to stay safe
    MAX_EMBED_CHARS = 2000

    texts = [a.text for a in articles]  # full text stored in ChromaDB
    embed_texts = [t[:MAX_EMBED_CHARS] for t in texts]  # truncated for embedding
    ids = [f"{a.source}_art_{a.article_number}" for a in articles]
    metadatas = [
        {
            "article_number": a.article_number,
            "title": a.title,
            "chapter": a.chapter,
            "source": a.source,
        }
        for a in articles
    ]

    # Embed in batches to show progress
    batch_size = 20
    all_embeddings: list[list[float]] = []

    for i in range(0, len(embed_texts), batch_size):
        batch = embed_texts[i : i + batch_size]
        logger.info("embed.batch", start=i, end=i + len(batch), total=len(embed_texts))
        embeddings = await _embed_batch(batch)
        all_embeddings.extend(embeddings)

    col.upsert(
        ids=ids,
        embeddings=all_embeddings,
        documents=texts,
        metadatas=metadatas,
    )

    count = col.count()
    logger.info("index.complete", count=count)
    return count
