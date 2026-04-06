from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    situation: str = Field(..., min_length=10, max_length=500)
    language: str = Field(default="pt", pattern="^(pt|emk|cha|sen)$")


class ArticleCited(BaseModel):
    number: int
    source: str = ""
    title: str
    excerpt: str
    relevance: str


class QueryResponse(BaseModel):
    query_id: UUID
    violated: bool
    severity: Literal["low", "medium", "high"]
    verdict_summary: str
    articles_cited: list[ArticleCited]
    explanation: str
    next_steps: list[str]


class FeedbackRequest(BaseModel):
    query_id: UUID
    helpful: bool
    comment: str | None = Field(default=None, max_length=300)


class FeedbackResponse(BaseModel):
    status: str = "ok"


class HealthResponse(BaseModel):
    status: str
    index_ready: bool
    article_count: int
    version: str


class ExampleSituation(BaseModel):
    id: int
    text: str
    category: str


class ExamplesResponse(BaseModel):
    examples: list[ExampleSituation]
