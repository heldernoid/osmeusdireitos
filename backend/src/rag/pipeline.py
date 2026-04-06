import asyncio
import json
import re
import uuid
from collections.abc import AsyncGenerator

import httpx
import structlog

from src.config import settings
from src.models import ArticleCited, QueryResponse
from src.rag.prompt import build_system_prompt, build_user_prompt
from src.rag.retriever import RetrievedArticle, search

logger = structlog.get_logger()

_JSON_BLOCK_RE = re.compile(r"```(?:json)?\s*(.*?)```", re.DOTALL)

# Set to True at startup if OpenRouter key is present and reachable
_openrouter_ok: bool = False


async def init_llm_provider() -> str:
    """Test OpenRouter if key is set. Returns 'openrouter' or 'ollama'."""
    global _openrouter_ok
    if not settings.enabled_cloud:
        logger.info("llm.provider", provider="ollama", reason="cloud disabled")
        return "ollama"
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.openrouter_api_key}"},
                json={
                    "model": settings.openrouter_llm_model,
                    "messages": [{"role": "user", "content": "hi"}],
                    "max_tokens": 1,
                },
            )
            resp.raise_for_status()
        _openrouter_ok = True
        logger.info("llm.provider", provider="openrouter", model=settings.openrouter_llm_model)
        return "openrouter"
    except Exception as exc:
        logger.warning("llm.openrouter_unavailable", error=str(exc), fallback="ollama")
        _openrouter_ok = False
        return "ollama"


def _extract_json(text: str) -> str:
    text = text.strip()
    m = _JSON_BLOCK_RE.search(text)
    if m:
        return m.group(1).strip()
    return text


async def _openrouter_chat(
    messages: list[dict], *, json_mode: bool = False, max_tokens: int = 1500
) -> str:
    """Call OpenRouter chat completions API."""
    body: dict = {
        "model": settings.openrouter_llm_model,
        "messages": messages,
        "temperature": 0.1,
        "max_tokens": max_tokens,
    }
    if json_mode:
        body["response_format"] = {"type": "json_object"}
    async with httpx.AsyncClient(timeout=180.0) as client:
        resp = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.openrouter_api_key}"},
            json=body,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


async def _classify(situation: str) -> bool:
    """Node 1: JSON-mode classifier — does this warrant a constitutional review?"""
    messages = [
        {
            "role": "system",
            "content": (
                "És um assistente que decide se uma mensagem descreve uma situação "
                "que pode requerer a revisão de leis ou verificação de violação de direitos. "
                "Responde APENAS com JSON no formato: {\"constituicao\": \"SIM\"} ou {\"constituicao\": \"NAO\"}. "
                "SIM: qualquer situação vivida por uma pessoa que possa envolver direitos — "
                "detenção, violência, despedimento, ameaça, corrupção, invasão de domicílio, "
                "discriminação, abuso de autoridade, ou qualquer conflito com entidades públicas ou privadas. "
                "NAO: apenas se for claramente inútil — números de telefone, listas de contactos, "
                "texto sem sentido, ou conteúdo sem qualquer evento ou situação descrita."
            ),
        },
        {"role": "user", "content": situation},
    ]
    try:
        if _openrouter_ok:
            raw = await _openrouter_chat(messages, json_mode=True, max_tokens=20)
        else:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"{settings.ollama_base_url}/api/chat",
                    json={
                        "model": settings.ollama_llm_model,
                        "messages": messages,
                        "format": "json",
                        "stream": False,
                        "options": {"temperature": 0, "num_predict": 20},
                    },
                )
                resp.raise_for_status()
                raw = resp.json()["message"]["content"]
        result = json.loads(raw)
        return str(result.get("constituicao", "SIM")).upper().startswith("S")
    except (json.JSONDecodeError, AttributeError):
        return True  # on parse error, let it through


async def _call_llm(system: str, user: str) -> str:
    """Call LLM with JSON mode. Uses OpenRouter if available, otherwise Ollama."""
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]
    if _openrouter_ok:
        return await _openrouter_chat(messages, json_mode=True, max_tokens=1500)
    async with httpx.AsyncClient(timeout=180.0) as client:
        resp = await client.post(
            f"{settings.ollama_base_url}/api/chat",
            json={
                "model": settings.ollama_llm_model,
                "messages": messages,
                "format": "json",
                "stream": False,
                "options": {"temperature": 0.1, "num_predict": 1500},
            },
        )
        resp.raise_for_status()
        return resp.json()["message"]["content"]


def _parse_response(raw: str, articles: list[RetrievedArticle]) -> QueryResponse:
    text = _extract_json(raw)
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        logger.error("pipeline.invalid_json", raw=raw[:200])
        raise ValueError(f"LLM returned invalid JSON: {exc}") from exc

    # Build lookup from retrieved articles — only these can be cited
    retrieved_by_key = {(a.source, a.article_number): a for a in articles}
    # Fallback: by number only (in case LLM gets source label slightly wrong)
    retrieved_by_number: dict[int, RetrievedArticle] = {}
    for a in articles:
        if a.article_number not in retrieved_by_number:
            retrieved_by_number[a.article_number] = a

    raw_cited = data.get("articles_cited") or []
    articles_cited: list[ArticleCited] = []
    for item in raw_cited:
        try:
            num = int(item["number"])
            source = str(item.get("source", "")).strip()
            retrieved = retrieved_by_key.get((source, num)) or retrieved_by_number.get(num)
            if retrieved is None:
                # Model hallucinated an article not in the retrieved context — discard
                logger.warning("pipeline.hallucinated_article", number=num, source=source)
                continue
            # Use excerpt from LLM only if it appears verbatim in the real article text.
            # Otherwise fall back to the opening of the real text to prevent fabrication.
            llm_excerpt = str(item.get("excerpt", "")).strip()
            if llm_excerpt and llm_excerpt.lower() in retrieved.text.lower():
                excerpt = llm_excerpt
            else:
                excerpt = retrieved.text[:350].strip()
            articles_cited.append(
                ArticleCited(
                    number=num,
                    source=retrieved.source,
                    title=retrieved.title,  # always use real title
                    excerpt=excerpt,
                    relevance=str(item.get("relevance", "")),
                )
            )
        except (KeyError, TypeError, ValueError):
            continue

    severity = data.get("severity", "medium")
    if severity not in ("low", "medium", "high"):
        severity = "medium"

    return QueryResponse(
        query_id=uuid.uuid4(),
        violated=bool(data.get("violated", False)),
        severity=severity,
        verdict_summary=str(data.get("verdict_summary", "")).replace("**", ""),
        articles_cited=articles_cited,
        explanation=str(data.get("explanation", "")).replace("**", ""),
        next_steps=[str(s).replace("**", "") for s in data.get("next_steps", [])],
    )


async def analyze_stream(
    situation: str, language: str
) -> AsyncGenerator[dict, None]:
    """3-node streaming pipeline. Yields NDJSON-compatible dicts."""

    # Node 1 — classify
    yield {"phase": "classify", "status": "running"}
    try:
        valid = await _classify(situation)
    except Exception:
        valid = True  # on error, let it through
    if not valid:
        yield {
            "phase": "classify",
            "status": "failed",
            "message": (
                "O texto não parece descrever uma situação concreta. "
                "Descreve o que aconteceu — por exemplo: "
                "\"Um polícia pediu-me dinheiro\" ou \"Fui despedido sem razão\"."
            ),
        }
        return
    yield {"phase": "classify", "status": "done"}

    # Node 2 — retrieve
    yield {"phase": "retrieve", "status": "running"}
    loop = asyncio.get_event_loop()
    articles = await loop.run_in_executor(None, search, situation, settings.top_k_results)
    logger.info("pipeline.retrieved", count=len(articles))
    yield {"phase": "retrieve", "status": "done"}

    # Node 3 — analyse
    yield {"phase": "analyze", "status": "running"}
    system = build_system_prompt()
    user = build_user_prompt(situation, articles, language)
    raw = await _call_llm(system, user)
    result = _parse_response(raw, articles)
    logger.info("pipeline.done", query_id=str(result.query_id), violated=result.violated)
    yield {"phase": "analyze", "status": "done", "result": result.model_dump(mode="json")}


async def analyze(situation: str, language: str) -> QueryResponse:
    """Non-streaming wrapper kept for tests."""
    loop = asyncio.get_event_loop()
    articles = await loop.run_in_executor(None, search, situation, settings.top_k_results)
    system = build_system_prompt()
    user = build_user_prompt(situation, articles, language)
    raw = await _call_llm(system, user)
    return _parse_response(raw, articles)
