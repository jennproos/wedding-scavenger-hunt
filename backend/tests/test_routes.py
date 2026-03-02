import pytest
from httpx import AsyncClient, ASGITransport


@pytest.fixture
async def client():
    from main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.mark.anyio
async def test_start_returns_session_id_and_clue(client):
    response = await client.post("/start")
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert isinstance(data["session_id"], str)
    assert len(data["session_id"]) > 0
    assert "clue_text" in data
    assert isinstance(data["clue_text"], str)
    assert len(data["clue_text"]) > 0


@pytest.mark.anyio
async def test_start_creates_unique_sessions(client):
    r1 = await client.post("/start")
    r2 = await client.post("/start")
    assert r1.json()["session_id"] != r2.json()["session_id"]


@pytest.mark.anyio
async def test_scan_correct_token_advances_stage(client):
    from stage_data import stages
    start = await client.post("/start")
    session_id = start.json()["session_id"]

    stage1_token = stages[1]["code"]
    scan = await client.post("/scan", json={"session_id": session_id, "token": stage1_token})
    assert scan.status_code == 200
    data = scan.json()
    assert data["success"] is True
    assert data["completed"] is False
    assert data["next_clue"] is not None
    assert len(data["next_clue"]) > 0


@pytest.mark.anyio
async def test_scan_wrong_token_returns_playful_error(client):
    start = await client.post("/start")
    session_id = start.json()["session_id"]

    scan = await client.post("/scan", json={"session_id": session_id, "token": "not-a-real-token"})
    assert scan.status_code == 200
    data = scan.json()
    assert data["success"] is False
    message = data["message"].lower()
    assert "patience" in message or "explorer" in message


@pytest.mark.anyio
async def test_scan_wrong_token_does_not_advance_stage(client):
    from stage_data import stages
    start = await client.post("/start")
    session_id = start.json()["session_id"]

    # Scan wrong token
    await client.post("/scan", json={"session_id": session_id, "token": "wrong-token"})

    # Correct stage 1 token should still work
    stage1_token = stages[1]["code"]
    scan = await client.post("/scan", json={"session_id": session_id, "token": stage1_token})
    data = scan.json()
    assert data["success"] is True


@pytest.mark.anyio
async def test_scan_unknown_session_returns_404(client):
    scan = await client.post("/scan", json={"session_id": "nonexistent-id", "token": "any"})
    assert scan.status_code == 404


@pytest.mark.anyio
async def test_back_moves_to_prev_stage(client):
    from stage_data import stages
    start = await client.post("/start")
    session_id = start.json()["session_id"]

    token = stages[1]["code"]
    await client.post("/scan", json={"session_id": session_id, "token": token})

    resp = await client.post("/back", json={"session_id": session_id})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["next_clue"] is not None


@pytest.mark.anyio
async def test_back_on_stage_1_returns_failure(client):
    start = await client.post("/start")
    session_id = start.json()["session_id"]

    resp = await client.post("/back", json={"session_id": session_id})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is False


@pytest.mark.anyio
async def test_scan_advancing_to_final_stage_sets_is_final_clue(client):
    from stage_data import stages
    start = await client.post("/start")
    session_id = start.json()["session_id"]

    for stage_id in range(1, 4):
        token = stages[stage_id]["code"]
        await client.post("/scan", json={"session_id": session_id, "token": token})

    # Advance from stage 4 → stage 5 (the final stage)
    token = stages[4]["code"]
    scan = await client.post("/scan", json={"session_id": session_id, "token": token})
    data = scan.json()
    assert data["success"] is True
    assert data["completed"] is False
    assert data["is_final_clue"] is True


@pytest.mark.anyio
async def test_complete_all_stages_reaches_completed(client):
    from stage_data import stages
    start = await client.post("/start")
    session_id = start.json()["session_id"]

    for stage_id in range(1, 6):
        token = stages[stage_id]["code"]
        scan = await client.post("/scan", json={"session_id": session_id, "token": token})
        data = scan.json()
        assert data["success"] is True
        if stage_id == 5:
            assert data["completed"] is True
            assert "MASTERS" in data["message"] or "chaos" in data["message"].lower()


@pytest.mark.anyio
async def test_scan_already_completed_session(client):
    from stage_data import stages
    start = await client.post("/start")
    session_id = start.json()["session_id"]

    # Complete all stages
    for stage_id in range(1, 6):
        token = stages[stage_id]["code"]
        await client.post("/scan", json={"session_id": session_id, "token": token})

    # Scan again on completed session
    any_token = stages[1]["code"]
    scan = await client.post("/scan", json={"session_id": session_id, "token": any_token})
    assert scan.status_code == 200
    data = scan.json()
    assert data["completed"] is True
