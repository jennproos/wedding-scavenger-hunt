import uuid
from typing import Optional
from models import Session

_sessions: dict = {}


def create_session(starting_stage: int) -> Session:
    session = Session(
        session_id=str(uuid.uuid4()),
        current_stage=starting_stage,
        completed=False,
    )
    _sessions[session.session_id] = session
    return session


def get_session(session_id: str) -> Optional[Session]:
    return _sessions.get(session_id)


def update_session(session: Session) -> None:
    _sessions[session.session_id] = session
