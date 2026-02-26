from fastapi import APIRouter, HTTPException
from models import StartResponse, ScanRequest, ScanResponse
from services import session_service, stage_service

router = APIRouter()


@router.post("/start", response_model=StartResponse)
async def start():
    first_stage_id = stage_service.get_first_stage_id()
    session = session_service.create_session(starting_stage=first_stage_id)
    clue_text = stage_service.get_clue(first_stage_id)
    return StartResponse(session_id=session.session_id, clue_text=clue_text)


@router.post("/scan", response_model=ScanResponse)
async def scan(request: ScanRequest):
    session = session_service.get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.completed:
        return ScanResponse(
            success=True,
            completed=True,
            message="You already unlocked the chaos.",
        )

    expected_token = stage_service.get_token(session.current_stage)
    if request.token != expected_token:
        return ScanResponse(
            success=False,
            message="Patience, explorer 👀",
        )

    if stage_service.is_final_stage(session.current_stage):
        session.completed = True
        session_service.update_session(session)
        return ScanResponse(
            success=True,
            completed=True,
            message="You have unlocked THE TRUE MASTERS OF THE HOUSE.",
        )

    next_stage_id = stage_service.get_next_stage_id(session.current_stage)
    session.current_stage = next_stage_id
    session_service.update_session(session)
    next_clue = stage_service.get_clue(next_stage_id)
    return ScanResponse(
        success=True,
        completed=False,
        next_clue=next_clue,
        message="Onward!",
    )
