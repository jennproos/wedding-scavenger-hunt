from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Session(BaseModel):
    session_id: str
    current_stage: int
    completed: bool = False
    player_name: str = ""
    start_time: Optional[datetime] = None
    completion_time: Optional[datetime] = None


class StartRequest(BaseModel):
    player_name: str = Field(..., min_length=1, max_length=30)


class StartResponse(BaseModel):
    session_id: str
    clue_text: str
    player_name: str


class ScanRequest(BaseModel):
    session_id: str
    token: str


class ScanResponse(BaseModel):
    success: bool
    message: str
    next_clue: Optional[str] = None
    completed: bool = False
    is_final_clue: bool = False


class LeaderboardEntry(BaseModel):
    session_id: str
    player_name: str
    clue_number: int
    completed: bool
    start_time: Optional[datetime] = None
    completion_time: Optional[datetime] = None


class DevRequest(BaseModel):
    session_id: str
