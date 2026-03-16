import json
import os
import boto3
from typing import List, Optional
from datetime import datetime
from pathlib import Path
from botocore.exceptions import ClientError
from models import Session, LeaderboardEntry

_LEADERBOARD_PATH = Path(__file__).parent.parent / "leaderboard.json"
_S3_KEY = "leaderboard.json"


def _bucket() -> Optional[str]:
    return os.environ.get("LEADERBOARD_BUCKET")


def _read_data() -> dict:
    bucket = _bucket()
    if bucket:
        s3 = boto3.client("s3")
        try:
            obj = s3.get_object(Bucket=bucket, Key=_S3_KEY)
            return json.loads(obj["Body"].read())
        except ClientError as e:
            if e.response["Error"]["Code"] == "NoSuchKey":
                return {}
            raise
    if not _LEADERBOARD_PATH.exists():
        return {}
    with open(_LEADERBOARD_PATH, "r") as f:
        return json.load(f)


def _write_data(data: dict) -> None:
    bucket = _bucket()
    if bucket:
        s3 = boto3.client("s3")
        s3.put_object(Bucket=bucket, Key=_S3_KEY, Body=json.dumps(data, default=str))
        return
    with open(_LEADERBOARD_PATH, "w") as f:
        json.dump(data, f, default=str)


def name_exists(name: str) -> bool:
    data = _read_data()
    name_lower = name.strip().lower()
    return any(
        entry.get("player_name", "").strip().lower() == name_lower
        for entry in data.values()
    )


def save_entry(session: Session, clue_number: int) -> None:
    data = _read_data()
    data[session.session_id] = {
        "session_id": session.session_id,
        "player_name": session.player_name,
        "clue_number": clue_number,
        "completed": session.completed,
        "start_time": session.start_time.isoformat() if session.start_time else None,
        "completion_time": session.completion_time.isoformat() if session.completion_time else None,
    }
    _write_data(data)


def get_entries() -> List[LeaderboardEntry]:
    data = _read_data()
    entries = [LeaderboardEntry(**entry) for entry in data.values()]

    completed = [e for e in entries if e.completed]
    in_progress = [e for e in entries if not e.completed]

    def duration(e: LeaderboardEntry) -> float:
        if e.start_time and e.completion_time:
            return (e.completion_time - e.start_time).total_seconds()
        return float("inf")

    completed.sort(key=duration)

    def in_progress_key(e: LeaderboardEntry):
        return (-e.clue_number, e.start_time or datetime.max)

    in_progress.sort(key=in_progress_key)

    return completed + in_progress


def remove_entry(session_id: str) -> None:
    data = _read_data()
    if session_id in data:
        del data[session_id]
        _write_data(data)


def clear_all() -> None:
    bucket = _bucket()
    if bucket:
        s3 = boto3.client("s3")
        s3.delete_object(Bucket=bucket, Key=_S3_KEY)
        return
    if _LEADERBOARD_PATH.exists():
        _LEADERBOARD_PATH.unlink()
