from dataclasses import dataclass

import chromadb
import httpx
import structlog

from src.config import settings

logger = structlog.get_logger()


@dataclass
class RetrievedArticle:
    article_number: int
    title: str
    chapter: str
    text: str
    score: float
    source: str = ""


def _embed_query(query: str) -> list[float]:
    with httpx.Client(timeout=30.0) as client:
        resp = client.post(
            f"{settings.ollama_base_url}/api/embeddings",
            json={"model": settings.ollama_embed_model, "prompt": query},
        )
        resp.raise_for_status()
        return resp.json()["embedding"]


def search(query: str, top_k: int | None = None) -> list[RetrievedArticle]:
    """Embed query and return top-k most relevant articles from ChromaDB."""
    if top_k is None:
        top_k = settings.top_k_results

    query_embedding = _embed_query(query)

    db = chromadb.PersistentClient(path=settings.chroma_persist_dir)
    col = db.get_collection(settings.chroma_collection)

    results = col.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )

    articles: list[RetrievedArticle] = []
    docs = results["documents"][0]
    metas = results["metadatas"][0]
    distances = results["distances"][0]

    for doc, meta, dist in zip(docs, metas, distances):
        articles.append(
            RetrievedArticle(
                article_number=int(meta["article_number"]),
                title=str(meta["title"]),
                chapter=str(meta.get("chapter", "")),
                text=doc,
                score=float(1.0 - dist),  # cosine distance -> similarity
                source=str(meta.get("source", "")),
            )
        )

    logger.info(
        "retriever.search",
        query=query[:60],
        top_k=top_k,
        results=[(a.article_number, a.title, round(a.score, 3)) for a in articles],
    )
    return articles
