"""
Multi-document ingestion pipeline.

Usage (inside container):
    python -m src.ingestion.run_ingestion

Steps:
    1. Parse all PDFs in data/raw/ into article chunks
    2. Embed with nomic-embed-text and store in ChromaDB
"""

import asyncio
import sys
import time
from pathlib import Path

from src.config import settings
from src.ingestion.embed_and_index import embed_and_index
from src.ingestion.parse_constitution import ArticleChunk, parse_constitution

RAW_DIR = Path(settings.raw_docs_dir)


async def main() -> None:
    t0 = time.time()
    print("Os Meus Direitos - Document Ingestion Pipeline")
    print("-" * 50)

    if not RAW_DIR.exists():
        print(f"ERROR: Raw docs directory not found at {RAW_DIR}")
        sys.exit(1)

    pdfs = sorted(RAW_DIR.glob("*.pdf"))
    if not pdfs:
        print(f"ERROR: No PDF files found in {RAW_DIR}")
        sys.exit(1)

    print(f"\nFound {len(pdfs)} PDF(s) in {RAW_DIR}:")
    for pdf in pdfs:
        print(f"  - {pdf.name}")

    all_articles: list[ArticleChunk] = []

    print("\n[1/2] Parsing articles from PDFs...")
    for pdf in pdfs:
        articles = parse_constitution(pdf)
        print(f"      {pdf.name}: {len(articles)} articles")
        all_articles.extend(articles)

    print(f"\n      Total: {len(all_articles)} articles across {len(pdfs)} documents")

    if len(all_articles) == 0:
        print("ERROR: No articles parsed - check PDF format")
        sys.exit(1)

    print("\n[2/2] Embed with nomic-embed-text + index in ChromaDB...")
    count = await embed_and_index(all_articles)
    print(f"      -> {count} articles indexed")

    elapsed = time.time() - t0
    print(f"\nDone in {elapsed:.1f}s")
    print("Health check: GET /api/health should now return index_ready=true")


if __name__ == "__main__":
    asyncio.run(main())
