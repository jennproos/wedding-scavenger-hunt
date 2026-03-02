import pytest
from httpx import AsyncClient, ASGITransport


@pytest.fixture
async def client():
    from main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def dev_client(monkeypatch):
    monkeypatch.setenv("DEV_OVERRIDE", "true")
    from main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.mark.anyio
async def test_dev_advance_returns_404_without_env_var(client):
    start = await client.post("/start")
    session_id = start.json()["session_id"]
    resp = await client.post("/dev/advance", json={"session_id": session_id})
    assert resp.status_code == 404


@pytest.mark.anyio
async def test_dev_back_returns_404_without_env_var(client):
    start = await client.post("/start")
    session_id = start.json()["session_id"]
    resp = await client.post("/dev/back", json={"session_id": session_id})
    assert resp.status_code == 404


@pytest.mark.anyio
async def test_dev_advance_moves_to_next_stage(dev_client):
    start = await dev_client.post("/start")
    session_id = start.json()["session_id"]

    resp = await dev_client.post("/dev/advance", json={"session_id": session_id})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["completed"] is False
    assert data["next_clue"] is not None
    assert "[DEV]" in data["message"]


@pytest.mark.anyio
async def test_dev_advance_on_final_stage_marks_completed(dev_client):
    from stage_data import stages
    start = await dev_client.post("/start")
    session_id = start.json()["session_id"]

    # Scan through stages 1–4 to reach stage 5 (the final stage)
    for stage_id in range(1, 5):
        token = stages[stage_id]["code"]
        await dev_client.post("/scan", json={"session_id": session_id, "token": token})

    # Now dev-advance from the final stage
    resp = await dev_client.post("/dev/advance", json={"session_id": session_id})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["completed"] is True


@pytest.mark.anyio
async def test_dev_back_moves_to_prev_stage(dev_client):
    from stage_data import stages
    start = await dev_client.post("/start")
    session_id = start.json()["session_id"]

    # Advance to stage 2 by scanning stage 1 token
    token = stages[1]["code"]
    await dev_client.post("/scan", json={"session_id": session_id, "token": token})

    # Now go back
    resp = await dev_client.post("/dev/back", json={"session_id": session_id})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["completed"] is False
    assert data["next_clue"] is not None


@pytest.mark.anyio
async def test_dev_back_on_stage_1_returns_failure(dev_client):
    start = await dev_client.post("/start")
    session_id = start.json()["session_id"]

    resp = await dev_client.post("/dev/back", json={"session_id": session_id})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is False
    assert "beginning" in data["message"].lower()


@pytest.mark.anyio
async def test_dev_back_on_completed_resets_and_goes_back(dev_client):
    from stage_data import stages
    start = await dev_client.post("/start")
    session_id = start.json()["session_id"]

    # Complete all stages
    for stage_id in range(1, 6):
        token = stages[stage_id]["code"]
        await dev_client.post("/scan", json={"session_id": session_id, "token": token})

    # Go back from completed state
    resp = await dev_client.post("/dev/back", json={"session_id": session_id})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["completed"] is False
    assert data["next_clue"] is not None
