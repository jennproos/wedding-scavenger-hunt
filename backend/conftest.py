import pytest


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture(autouse=True)
def clear_leaderboard():
    from services import leaderboard_service
    leaderboard_service.clear_all()
    yield
    leaderboard_service.clear_all()
