"""
Part 3 tests: RAG query pipeline.

Uses mocked Ollama LLM - no real API calls.
Retriever calls are also mocked to isolate pipeline logic.
"""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.models import QueryResponse

# --- Mock data ---

_ARTICLES_MOCK = [
    MagicMock(
        article_number=58,
        title="Direito à indemnização e responsabilidade do Estado",
        text="Artigo 58. O Estado é responsável pelos danos causados por actos ilegais dos seus agentes.",
        chapter="",
        score=0.8,
    ),
    MagicMock(
        article_number=59,
        title="Direito à liberdade e à segurança",
        text="Artigo 59. Ninguém pode ser preso senão nos termos da lei.",
        chapter="",
        score=0.75,
    ),
]

_LLM_BRIBERY = {
    "violated": True,
    "severity": "high",
    "verdict_summary": "Os seus direitos foram violados. O pedido de dinheiro por um polícia é corrupção.",
    "articles_cited": [
        {
            "number": 58,
            "title": "Direito à indemnização e responsabilidade do Estado",
            "excerpt": "O Estado é responsável pelos danos causados por actos ilegais dos seus agentes.",
            "relevance": "O polícia é agente do Estado. O pedido de suborno é um acto ilegal.",
        }
    ],
    "explanation": "O comportamento descrito é ilegal. Nenhum polícia tem o direito de pedir dinheiro.",
    "next_steps": [
        "Registe o número do agente e local do acontecimento.",
        "Apresente queixa na esquadra mais próxima.",
        "Contacte a Liga dos Direitos Humanos: +258 21 321 193.",
    ],
}

_LLM_ARREST = {
    "violated": True,
    "severity": "high",
    "verdict_summary": "Os seus direitos foram violados. A detenção sem mandado judicial é ilegal.",
    "articles_cited": [
        {
            "number": 51,
            "title": "Liberdade de reunião e manifestação",
            "excerpt": "Os cidadãos têm o direito de se reunir pacificamente.",
            "relevance": "A manifestação era pacífica e legal.",
        },
        {
            "number": 64,
            "title": "Prisão preventiva",
            "excerpt": "A prisão preventiva está sujeita a controlo judicial.",
            "relevance": "A detenção por 3 dias sem ver um juiz viola este artigo.",
        },
    ],
    "explanation": "Manifestar pacificamente é um direito constitucional. Foi detido ilegalmente.",
    "next_steps": [
        "Contacte um advogado imediatamente.",
        "Apresente queixa ao Ministério Público.",
        "Contacte a Liga dos Direitos Humanos.",
    ],
}

_LLM_NOT_VIOLATED = {
    "violated": False,
    "severity": "low",
    "verdict_summary": "Com base na informação fornecida, não há violação clara de direitos.",
    "articles_cited": [],
    "explanation": "A situação descrita não parece configurar uma violação constitucional clara.",
    "next_steps": ["Consulte um advogado para mais informações."],
}

_LLM_INVALID_JSON = "Desculpe, não consigo responder a isso."


# --- Helpers ---

def _mock_pipeline(llm_response: dict | str):
    """Context manager that patches retriever and LLM call."""
    raw = json.dumps(llm_response) if isinstance(llm_response, dict) else llm_response

    retriever_patch = patch(
        "src.rag.pipeline.search",
        return_value=_ARTICLES_MOCK,
    )
    llm_patch = patch(
        "src.rag.pipeline._call_llm",
        new=AsyncMock(return_value=raw),
    )
    return retriever_patch, llm_patch


# --- Tests ---

@pytest.mark.asyncio
async def test_pipeline_police_bribery_violated() -> None:
    """Police bribery scenario returns violated=True and cites Article 58."""
    from src.rag.pipeline import analyze

    r_patch, l_patch = _mock_pipeline(_LLM_BRIBERY)
    with r_patch, l_patch:
        result = await analyze(
            "Um polícia parou-me e pediu dinheiro de refresco.", "pt"
        )

    assert isinstance(result, QueryResponse)
    assert result.violated is True
    assert result.severity == "high"
    assert any(a.number == 58 for a in result.articles_cited)
    assert len(result.next_steps) >= 2
    assert result.query_id is not None


@pytest.mark.asyncio
async def test_pipeline_protest_arrest_violated() -> None:
    """Peaceful protest arrest returns violated=True and cites Articles 51 and 64."""
    from src.rag.pipeline import analyze

    r_patch, l_patch = _mock_pipeline(_LLM_ARREST)
    with r_patch, l_patch:
        result = await analyze(
            "Fui preso numa manifestação pacífica e fiquei 3 dias sem ver um juiz.", "pt"
        )

    assert result.violated is True
    cited_numbers = [a.number for a in result.articles_cited]
    assert 51 in cited_numbers, f"Article 51 missing from {cited_numbers}"
    assert 64 in cited_numbers, f"Article 64 missing from {cited_numbers}"


@pytest.mark.asyncio
async def test_pipeline_not_violated() -> None:
    """Non-violation scenario returns violated=False."""
    from src.rag.pipeline import analyze

    r_patch, l_patch = _mock_pipeline(_LLM_NOT_VIOLATED)
    with r_patch, l_patch:
        result = await analyze("Recebi uma multa de trânsito.", "pt")

    assert result.violated is False
    assert result.severity == "low"


@pytest.mark.asyncio
async def test_pipeline_invalid_json_raises() -> None:
    """Invalid JSON from LLM raises ValueError (router converts to 500)."""
    from src.rag.pipeline import analyze

    r_patch, l_patch = _mock_pipeline(_LLM_INVALID_JSON)
    with r_patch, l_patch, pytest.raises((ValueError, Exception)):
        await analyze("Situação qualquer.", "pt")


@pytest.mark.asyncio
async def test_pipeline_response_has_all_fields() -> None:
    """QueryResponse contains all required fields."""
    from src.rag.pipeline import analyze

    r_patch, l_patch = _mock_pipeline(_LLM_BRIBERY)
    with r_patch, l_patch:
        result = await analyze("Polícia pediu dinheiro.", "pt")

    assert result.query_id is not None
    assert result.verdict_summary != ""
    assert result.explanation != ""
    assert isinstance(result.articles_cited, list)
    assert isinstance(result.next_steps, list)


@pytest.mark.asyncio
async def test_pipeline_severity_normalised() -> None:
    """Unknown severity value is normalised to 'medium'."""
    from src.rag.pipeline import analyze

    bad_severity = {**_LLM_BRIBERY, "severity": "extreme"}
    r_patch, l_patch = _mock_pipeline(bad_severity)
    with r_patch, l_patch:
        result = await analyze("Polícia pediu dinheiro.", "pt")

    assert result.severity == "medium"
