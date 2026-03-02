from pydantic import BaseModel
from typing import Optional


class Session(BaseModel):
    session_id: str
    current_stage: int
    completed: bool = False


class StartResponse(BaseModel):
    session_id: str
    clue_text: str


class ScanRequest(BaseModel):
    session_id: str
    token: str


class ScanResponse(BaseModel):
    success: bool
    message: str
    next_clue: Optional[str] = None
    completed: bool = False
    is_final_clue: bool = False


class DevRequest(BaseModel):
    session_id: str
