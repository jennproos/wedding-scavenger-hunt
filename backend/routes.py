import os
from fastapi import APIRouter, HTTPException
from models import StartResponse, ScanRequest, ScanResponse, DevRequest
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


def _dev_guard():
    if os.environ.get("DEV_OVERRIDE", "").lower() != "true":
        raise HTTPException(status_code=404)


@router.post("/dev/advance", response_model=ScanResponse)
async def dev_advance(request: DevRequest):
    _dev_guard()
    session = session_service.get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.completed:
        return ScanResponse(
            success=True,
            completed=True,
            message="You already unlocked the chaos.",
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
        message="[DEV] Skipped!",
    )


@router.post("/dev/back", response_model=ScanResponse)
async def dev_back(request: DevRequest):
    _dev_guard()
    session = session_service.get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.completed:
        prev_stage_id = stage_service.get_prev_stage_id(session.current_stage)
        session.completed = False
        session.current_stage = prev_stage_id
        session_service.update_session(session)
        clue = stage_service.get_clue(prev_stage_id)
        return ScanResponse(
            success=True,
            completed=False,
            next_clue=clue,
            message="[DEV] Went back!",
        )

    prev_stage_id = stage_service.get_prev_stage_id(session.current_stage)
    if prev_stage_id is None:
        return ScanResponse(
            success=False,
            message="Already at the beginning!",
        )

    session.current_stage = prev_stage_id
    session_service.update_session(session)
    clue = stage_service.get_clue(prev_stage_id)
    return ScanResponse(
        success=True,
        completed=False,
        next_clue=clue,
        message="[DEV] Went back!",
    )
