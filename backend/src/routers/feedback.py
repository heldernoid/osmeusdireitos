import structlog
from fastapi import APIRouter

from src.database import log_feedback
from src.jsonl_log import log_feedback_jsonl
from src.models import FeedbackRequest, FeedbackResponse

router = APIRouter()
logger = structlog.get_logger()


@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(body: FeedbackRequest) -> FeedbackResponse:
    await log_feedback(
        query_id=str(body.query_id),
        helpful=body.helpful,
        comment=body.comment,
    )
    await log_feedback_jsonl(
        query_id=str(body.query_id),
        helpful=body.helpful,
        comment=body.comment,
    )
    logger.info("feedback.submitted", query_id=str(body.query_id), helpful=body.helpful)
    return FeedbackResponse()
