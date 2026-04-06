"""Append-only JSONL log alongside the SQLite store.

Two record types:
  {"type": "query",    "ts": ..., "id": ..., "language": ..., "situation": ...,
   "violated": ..., "severity": ..., "verdict_summary": ..., "explanation": ...,
   "articles_cited": [...], "next_steps": [...], "phases": [...]}

  {"type": "feedback", "ts": ..., "query_id": ..., "helpful": ..., "comment": ...}
"""

import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path

_LOG_PATH = Path("./data/queries.jsonl")
_lock = asyncio.Lock()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _write_line(line: str) -> None:
    with _LOG_PATH.open("a", encoding="utf-8") as fh:
        fh.write(line + "\n")


async def _append(record: dict) -> None:
    _LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    line = json.dumps(record, ensure_ascii=False)
    async with _lock:
        await asyncio.to_thread(_write_line, line)


async def log_query_jsonl(
    query_id: str,
    language: str,
    situation: str,
    result: dict,
    phases: list[dict],
) -> None:
    await _append(
        {
            "type": "query",
            "ts": _now(),
            "id": query_id,
            "language": language,
            "situation": situation,
            "violated": result.get("violated"),
            "severity": result.get("severity"),
            "verdict_summary": result.get("verdict_summary"),
            "explanation": result.get("explanation"),
            "articles_cited": result.get("articles_cited", []),
            "next_steps": result.get("next_steps", []),
            "phases": phases,
        }
    )


async def log_feedback_jsonl(query_id: str, helpful: bool, comment: str | None) -> None:
    await _append(
        {
            "type": "feedback",
            "ts": _now(),
            "query_id": query_id,
            "helpful": helpful,
            "comment": comment,
        }
    )
