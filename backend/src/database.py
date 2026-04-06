import json
from pathlib import Path

import aiosqlite
import structlog

logger = structlog.get_logger()

DB_PATH = Path("./data/db.sqlite3")


async def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS query_log (
                id TEXT PRIMARY KEY,
                situation_text TEXT NOT NULL,
                language TEXT NOT NULL DEFAULT 'pt',
                violated INTEGER,
                severity TEXT,
                articles_cited TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query_id TEXT NOT NULL,
                helpful INTEGER NOT NULL,
                comment TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)
        await db.commit()
    logger.info("database.init", path=str(DB_PATH))


async def log_query(
    query_id: str,
    situation: str,
    language: str,
    violated: bool,
    severity: str,
    articles_cited: list[dict],
) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO query_log (id, situation_text, language, violated, severity, articles_cited)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (query_id, situation, language, int(violated), severity, json.dumps(articles_cited)),
        )
        await db.commit()


async def log_feedback(query_id: str, helpful: bool, comment: str | None) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO feedback (query_id, helpful, comment) VALUES (?, ?, ?)",
            (query_id, int(helpful), comment),
        )
        await db.commit()
