from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from backend.app.ai.visualization_analyzer import stream_visualization_analysis

router = APIRouter()


class AnalysisRequest(BaseModel):
    image: str
    title: str
    chartType: Optional[str] = None


@router.post("/analyze-visualization")
async def analyze_visualization(request: AnalysisRequest):
    """
    Streams AI-generated insights from a chart image.
    """
    if "," not in request.image:
        raise HTTPException(status_code=400, detail="Invalid image payload")

    base64_image = request.image.split(",", 1)[1]

    try:
        stream = stream_visualization_analysis(
            base64_image=base64_image,
            title=request.title,
            chart_type=request.chartType,
        )
        try:
            first_chunk = next(stream)
        except StopIteration:
            first_chunk = ""
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    def stream_response():
        if first_chunk:
            yield first_chunk
        try:
            for chunk in stream:
                yield chunk
        except Exception as exc:
            yield f"\n\n[error] {exc}"

    return StreamingResponse(stream_response(), media_type="text/plain")
