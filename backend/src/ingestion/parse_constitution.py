import re
from dataclasses import dataclass
from pathlib import Path

import pdfplumber
import structlog

logger = structlog.get_logger()

# Matches "Artigo 1.º", "Artigo 1", "ARTIGO 1.º" etc.
ARTICLE_RE = re.compile(r"(?:^|\n)\s*artigo\s+(\d+)\.?\s*[.º°]?", re.MULTILINE | re.IGNORECASE)

# Title in parentheses on the line after article number: "(Titulo)"
TITLE_PAREN_RE = re.compile(r"^\s*\(([^)]+)\)\s*$")

# Chapter marker
CHAPTER_RE = re.compile(
    r"(?:CAP[IÍ]TULO|CAPÍTULO)\s+([IVXivx]+(?:\s+\w+)*)",
    re.IGNORECASE,
)

# Title marker
TITLE_SECTION_RE = re.compile(r"T[IÍ]TULO\s+([IVXivx]+(?:\s+\w+)*)", re.IGNORECASE)


@dataclass
class ArticleChunk:
    article_number: int
    title: str
    chapter: str
    text: str
    source: str = ""


def _extract_text(pdf_path: Path) -> str:
    """Extract all text from PDF, joining pages."""
    pages: list[str] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages.append(text)
    return "\n".join(pages)


def _clean_text(text: str) -> str:
    """Remove page headers/footers and normalize whitespace."""
    # Remove lines that are purely numeric (page numbers)
    lines = text.split("\n")
    cleaned: list[str] = []
    for line in lines:
        stripped = line.strip()
        # Skip bare page numbers
        if re.match(r"^\d+$", stripped):
            continue
        cleaned.append(line)
    return "\n".join(cleaned)


def _find_current_context(text_before: str) -> str:
    """Find the most recent chapter/title marker before an article."""
    chapter = ""
    for m in CHAPTER_RE.finditer(text_before):
        chapter = f"Capitulo {m.group(1)}"
    return chapter


def parse_constitution(pdf_path: Path, source: str = "") -> list[ArticleChunk]:
    """Parse Constitution PDF into a list of ArticleChunk, one per article."""
    logger.info("parse.start", path=str(pdf_path))
    raw = _extract_text(pdf_path)
    text = _clean_text(raw)

    # Find all article boundaries
    matches = list(ARTICLE_RE.finditer(text))
    logger.info("parse.articles_found", count=len(matches))

    if len(matches) < 10:
        logger.warning("parse.low_article_count", count=len(matches))

    articles: list[ArticleChunk] = []
    seen: set[int] = set()

    for i, match in enumerate(matches):
        article_number = int(match.group(1))

        # Skip duplicates (e.g. table of contents references)
        if article_number in seen:
            continue

        # Article body: from end of this match to start of next
        body_start = match.end()
        body_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[body_start:body_end].strip()

        # Try to extract title from first non-empty line (parenthesised or plain)
        lines = [ln for ln in body.split("\n") if ln.strip()]
        title = ""
        text_lines_start = 0

        if lines:
            first = lines[0].strip()
            paren_match = TITLE_PAREN_RE.match(first)
            if paren_match:
                title = paren_match.group(1).strip()
                text_lines_start = 1
            elif len(first) < 80 and not first[0].islower():
                # Short line starting with uppercase - likely a title
                title = first
                text_lines_start = 1

        article_text = " ".join(
            line.strip() for line in lines[text_lines_start:] if line.strip()
        )

        # Determine chapter from text preceding this article
        chapter = _find_current_context(text[: match.start()])

        if not article_text:
            # Some articles may just be titles or one-liners - use title as text
            article_text = title

        chunk = ArticleChunk(
            article_number=article_number,
            title=title or f"Artigo {article_number}",
            chapter=chapter,
            text=f"Artigo {article_number}. {title}. {article_text}".strip(),
            source=source or pdf_path.stem,
        )
        articles.append(chunk)
        seen.add(article_number)

    # Sort by article number
    articles.sort(key=lambda a: a.article_number)
    logger.info("parse.complete", unique_articles=len(articles))
    return articles
