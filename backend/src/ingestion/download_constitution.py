from pathlib import Path

import httpx
import structlog

from src.config import settings

logger = structlog.get_logger()

DEST = Path("./data/constitution.pdf")


def download_constitution() -> Path:
    """Download the Constitution PDF. Skip if already present."""
    if DEST.exists():
        logger.info("download.skip", path=str(DEST), size=DEST.stat().st_size)
        return DEST

    DEST.parent.mkdir(parents=True, exist_ok=True)
    logger.info("download.start", url=settings.constitution_pdf_url)

    with httpx.Client(follow_redirects=True, timeout=120.0) as client:
        with client.stream("GET", settings.constitution_pdf_url) as resp:
            resp.raise_for_status()
            with open(DEST, "wb") as f:
                for chunk in resp.iter_bytes(chunk_size=8192):
                    f.write(chunk)

    logger.info("download.complete", path=str(DEST), size=DEST.stat().st_size)
    return DEST
