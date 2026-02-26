from typing import Optional
from stage_data import stages


def get_first_stage_id() -> int:
    return min(stages.keys())


def get_stage(stage_id: int) -> dict:
    return stages[stage_id]


def get_clue(stage_id: int) -> str:
    return stages[stage_id]["clue"]


def get_token(stage_id: int) -> str:
    return stages[stage_id]["qr_token"]


def get_next_stage_id(stage_id: int) -> Optional[int]:
    return stages[stage_id]["next"]


def is_final_stage(stage_id: int) -> bool:
    return stages[stage_id]["next"] is None
