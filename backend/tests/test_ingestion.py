"""
Part 2 tests: ingestion pipeline and retriever.

Parsing tests: run standalone (no Ollama needed).
Retriever tests: require Ollama + indexed ChromaDB (run after ingestion).
"""

from pathlib import Path

import pytest

PDF_PATH = Path("./data/constitution.pdf")
PDF_AVAILABLE = PDF_PATH.exists()


@pytest.mark.skipif(not PDF_AVAILABLE, reason="Constitution PDF not found at ./data/constitution.pdf")
def test_parsing_produces_articles() -> None:
    from src.ingestion.parse_constitution import parse_constitution

    articles = parse_constitution(PDF_PATH)
    assert len(articles) > 100, f"Expected >100 articles, got {len(articles)}"


@pytest.mark.skipif(not PDF_AVAILABLE, reason="Constitution PDF not found at ./data/constitution.pdf")
def test_parsing_article_fields() -> None:
    from src.ingestion.parse_constitution import parse_constitution

    articles = parse_constitution(PDF_PATH)
    for a in articles:
        assert a.article_number > 0
        assert len(a.text) > 5
        assert isinstance(a.title, str)
        assert isinstance(a.chapter, str)


@pytest.mark.skipif(not PDF_AVAILABLE, reason="Constitution PDF not found at ./data/constitution.pdf")
def test_parsing_no_duplicate_articles() -> None:
    from src.ingestion.parse_constitution import parse_constitution

    articles = parse_constitution(PDF_PATH)
    numbers = [a.article_number for a in articles]
    assert len(numbers) == len(set(numbers)), "Duplicate article numbers found"


@pytest.mark.skipif(not PDF_AVAILABLE, reason="Constitution PDF not found at ./data/constitution.pdf")
def test_parsing_articles_sorted() -> None:
    from src.ingestion.parse_constitution import parse_constitution

    articles = parse_constitution(PDF_PATH)
    numbers = [a.article_number for a in articles]
    assert numbers == sorted(numbers), "Articles not sorted by number"


# --- Retriever tests (require Ollama + indexed data) ---

@pytest.mark.integration
def test_retriever_returns_results() -> None:
    from src.rag.retriever import search

    results = search("fui preso pela policia", top_k=3)
    assert len(results) > 0
    for r in results:
        assert r.article_number > 0
        assert len(r.text) > 5
        assert 0.0 <= r.score <= 1.5


@pytest.mark.integration
def test_retriever_arrest_query_finds_article_59() -> None:
    """Query about unlawful arrest should surface Article 59 (freedom and security).

    all-minilm:33m ranks Art 59 at position 5 in top_k=5.
    """
    from src.rag.retriever import search

    results = search("fui preso pela policia sem ordem judicial", top_k=5)
    numbers = [r.article_number for r in results]
    assert 59 in numbers, f"Article 59 not in top 5 for arrest query. Got: {numbers}"


@pytest.mark.integration
def test_retriever_bribery_query_finds_relevant_articles() -> None:
    """Query about police bribery should return relevant articles."""
    from src.rag.retriever import search

    results = search("policia pediu dinheiro de refresco", top_k=5)
    assert len(results) == 5
    # At least one result should have a high similarity score
    assert results[0].score > 0.3, f"Top result score too low: {results[0].score}"
