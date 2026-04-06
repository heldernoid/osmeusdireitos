import json

import structlog
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from src.database import log_query
from src.jsonl_log import log_query_jsonl
from src.models import QueryRequest

router = APIRouter()
logger = structlog.get_logger()


@router.post("/query")
async def query(body: QueryRequest) -> StreamingResponse:
    from src.rag.pipeline import analyze_stream

    logger.info("query.received", language=body.language, length=len(body.situation))

    async def _generate():
        result_data = None
        phases: list[dict] = []
        async for event in analyze_stream(situation=body.situation, language=body.language):
            phases.append({k: v for k, v in event.items() if k != "result"})
            if event.get("phase") == "analyze" and event.get("status") == "done":
                result_data = event.get("result")
            yield json.dumps(event, ensure_ascii=False) + "\n"

        if result_data:
            try:
                await log_query(
                    query_id=str(result_data["query_id"]),
                    situation=body.situation,
                    language=body.language,
                    violated=result_data["violated"],
                    severity=result_data["severity"],
                    articles_cited=result_data["articles_cited"],
                )
                await log_query_jsonl(
                    query_id=str(result_data["query_id"]),
                    language=body.language,
                    situation=body.situation,
                    result=result_data,
                    phases=phases,
                )
                logger.info(
                    "query.completed",
                    query_id=result_data["query_id"],
                    violated=result_data["violated"],
                )
            except Exception as exc:
                logger.error("query.log_failed", error=str(exc))

    return StreamingResponse(_generate(), media_type="application/x-ndjson")
