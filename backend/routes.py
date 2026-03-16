import os
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from models import StartRequest, StartResponse, ScanRequest, ScanResponse, DevRequest
from services import session_service, stage_service, leaderboard_service

router = APIRouter()


@router.post("/start", response_model=StartResponse)
async def start(request: StartRequest):
    if leaderboard_service.name_exists(request.player_name):
        raise HTTPException(status_code=409, detail="That name is already on the hunt!")
    first_stage_id = stage_service.get_first_stage_id()
    session = session_service.create_session(
        starting_stage=first_stage_id,
        player_name=request.player_name,
    )
    clue_text = stage_service.get_clue(first_stage_id)
    leaderboard_service.save_entry(session, clue_number=first_stage_id)
    return StartResponse(
        session_id=session.session_id,
        clue_text=clue_text,
        player_name=session.player_name,
    )


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
        session.completion_time = datetime.utcnow()
        session_service.update_session(session)
        leaderboard_service.save_entry(session, clue_number=session.current_stage)
        return ScanResponse(
            success=True,
            completed=True,
            message="You have unlocked THE TRUE MASTERS OF THE HOUSE.",
        )

    next_stage_id = stage_service.get_next_stage_id(session.current_stage)
    session.current_stage = next_stage_id
    session_service.update_session(session)
    leaderboard_service.save_entry(session, clue_number=next_stage_id)
    next_clue = stage_service.get_clue(next_stage_id)
    return ScanResponse(
        success=True,
        completed=False,
        next_clue=next_clue,
        is_final_clue=stage_service.is_final_stage(next_stage_id),
        message="Onward!",
    )


@router.get("/leaderboard")
async def get_leaderboard():
    entries = leaderboard_service.get_entries()
    return [e.model_dump() for e in entries]


@router.delete("/leaderboard/{session_id}")
async def delete_leaderboard_entry(session_id: str):
    leaderboard_service.remove_entry(session_id)
    return {"ok": True}


@router.delete("/leaderboard")
async def clear_leaderboard(request: Request):
    expected = os.environ.get("ADMIN_SECRET", "")
    auth = request.headers.get("Authorization", "")
    if not expected or not auth.startswith("Bearer ") or auth[len("Bearer "):] != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")
    leaderboard_service.clear_all()
    return {"ok": True}


@router.get("/admin/ping")
async def admin_ping(request: Request):
    expected = os.environ.get("ADMIN_SECRET", "")
    auth = request.headers.get("Authorization", "")
    if not expected or not auth.startswith("Bearer ") or auth[len("Bearer "):] != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"ok": True}


@router.get("/session/{session_id}")
async def check_session(session_id: str):
    if session_service.get_session(session_id) is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"ok": True}


@router.post("/back", response_model=ScanResponse)
async def back(request: DevRequest):
    session = session_service.get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    prev_stage_id = stage_service.get_prev_stage_id(session.current_stage)
    if prev_stage_id is None:
        return ScanResponse(success=False, message="Already at the beginning!")

    session.current_stage = prev_stage_id
    session_service.update_session(session)
    clue = stage_service.get_clue(prev_stage_id)
    return ScanResponse(
        success=True,
        completed=False,
        next_clue=clue,
        is_final_clue=stage_service.is_final_stage(prev_stage_id),
        message="Went back!",
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
        session.completion_time = datetime.utcnow()
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
        is_final_clue=False,
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
