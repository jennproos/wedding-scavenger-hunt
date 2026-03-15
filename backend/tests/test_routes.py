import pytest
from httpx import AsyncClient, ASGITransport


@pytest.fixture
async def client():
    from main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.mark.anyio
async def test_start_returns_session_id_and_clue(client):
    response = await client.post("/start", json={"player_name": "Alice"})
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert isinstance(data["session_id"], str)
    assert len(data["session_id"]) > 0
    assert "clue_text" in data
    assert isinstance(data["clue_text"], str)
    assert len(data["clue_text"]) > 0


@pytest.mark.anyio
async def test_start_returns_player_name(client):
    response = await client.post("/start", json={"player_name": "Bob"})
    assert response.status_code == 200
    data = response.json()
    assert data["player_name"] == "Bob"


@pytest.mark.anyio
async def test_start_requires_player_name(client):
    response = await client.post("/start", json={})
    assert response.status_code == 422


@pytest.mark.anyio
async def test_start_rejects_empty_player_name(client):
    response = await client.post("/start", json={"player_name": ""})
    assert response.status_code == 422


@pytest.mark.anyio
async def test_start_rejects_name_over_30_chars(client):
    response = await client.post("/start", json={"player_name": "A" * 31})
    assert response.status_code == 422


@pytest.mark.anyio
async def test_start_accepts_name_exactly_30_chars(client):
    response = await client.post("/start", json={"player_name": "A" * 30})
    assert response.status_code == 200


@pytest.mark.anyio
async def test_start_creates_unique_sessions(client):
    r1 = await client.post("/start", json={"player_name": "Alice"})
    r2 = await client.post("/start", json={"player_name": "Bob"})
    assert r1.json()["session_id"] != r2.json()["session_id"]


@pytest.mark.anyio
async def test_scan_correct_token_advances_stage(client):
    from stage_data import stages
    start = await client.post("/start", json={"player_name": "Alice"})
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
    start = await client.post("/start", json={"player_name": "Alice"})
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
    start = await client.post("/start", json={"player_name": "Alice"})
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
    start = await client.post("/start", json={"player_name": "Alice"})
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
    start = await client.post("/start", json={"player_name": "Alice"})
    session_id = start.json()["session_id"]

    resp = await client.post("/back", json={"session_id": session_id})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is False


@pytest.mark.anyio
async def test_scan_advancing_to_final_stage_sets_is_final_clue(client):
    from stage_data import stages
    start = await client.post("/start", json={"player_name": "Alice"})
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
    start = await client.post("/start", json={"player_name": "Alice"})
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
async def test_check_session_returns_200_for_known_session(client):
    start = await client.post("/start", json={"player_name": "Alice"})
    session_id = start.json()["session_id"]
    resp = await client.get(f"/session/{session_id}")
    assert resp.status_code == 200


@pytest.mark.anyio
async def test_check_session_returns_404_for_unknown_session(client):
    resp = await client.get("/session/nonexistent-id")
    assert resp.status_code == 404


@pytest.mark.anyio
async def test_scan_already_completed_session(client):
    from stage_data import stages
    start = await client.post("/start", json={"player_name": "Alice"})
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


# --- Leaderboard tests ---

@pytest.mark.anyio
async def test_leaderboard_empty_initially(client):
    resp = await client.get("/leaderboard")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.anyio
async def test_leaderboard_contains_entry_after_start(client):
    await client.post("/start", json={"player_name": "Carol"})
    resp = await client.get("/leaderboard")
    assert resp.status_code == 200
    entries = resp.json()
    assert any(e["player_name"] == "Carol" for e in entries)


@pytest.mark.anyio
async def test_leaderboard_entry_has_required_fields(client):
    await client.post("/start", json={"player_name": "Dave"})
    resp = await client.get("/leaderboard")
    entry = resp.json()[0]
    assert "player_name" in entry
    assert "clue_number" in entry
    assert "completed" in entry
    assert "start_time" in entry


@pytest.mark.anyio
async def test_leaderboard_clue_number_advances_after_scan(client):
    from stage_data import stages
    start = await client.post("/start", json={"player_name": "Eve"})
    session_id = start.json()["session_id"]

    token = stages[1]["code"]
    await client.post("/scan", json={"session_id": session_id, "token": token})

    resp = await client.get("/leaderboard")
    entry = next(e for e in resp.json() if e["player_name"] == "Eve")
    assert entry["clue_number"] == 2


@pytest.mark.anyio
async def test_leaderboard_completion_time_set_when_completed(client):
    from stage_data import stages
    start = await client.post("/start", json={"player_name": "Frank"})
    session_id = start.json()["session_id"]

    for stage_id in range(1, 6):
        token = stages[stage_id]["code"]
        await client.post("/scan", json={"session_id": session_id, "token": token})

    resp = await client.get("/leaderboard")
    entry = next(e for e in resp.json() if e["player_name"] == "Frank")
    assert entry["completed"] is True
    assert entry["completion_time"] is not None


@pytest.mark.anyio
async def test_clear_leaderboard_without_auth(client):
    resp = await client.delete("/leaderboard")
    assert resp.status_code == 401


@pytest.mark.anyio
async def test_clear_leaderboard_with_wrong_password(client):
    resp = await client.delete("/leaderboard", headers={"Authorization": "Bearer wrong"})
    assert resp.status_code == 401


@pytest.mark.anyio
async def test_clear_leaderboard_with_correct_password(client):
    import os
    os.environ["ADMIN_SECRET"] = "test-secret"
    try:
        # Add an entry first
        await client.post("/start", json={"player_name": "TestPlayer"})
        leaderboard_resp = await client.get("/leaderboard")
        assert len(leaderboard_resp.json()) > 0

        resp = await client.delete("/leaderboard", headers={"Authorization": "Bearer test-secret"})
        assert resp.status_code == 200
        assert resp.json() == {"ok": True}

        leaderboard_resp = await client.get("/leaderboard")
        assert leaderboard_resp.json() == []
    finally:
        del os.environ["ADMIN_SECRET"]


@pytest.mark.anyio
async def test_admin_ping_without_auth(client):
    resp = await client.get("/admin/ping")
    assert resp.status_code == 401


@pytest.mark.anyio
async def test_admin_ping_with_wrong_password(client):
    resp = await client.get("/admin/ping", headers={"Authorization": "Bearer wrong"})
    assert resp.status_code == 401


@pytest.mark.anyio
async def test_admin_ping_with_correct_password(client):
    import os
    os.environ["ADMIN_SECRET"] = "test-secret"
    try:
        resp = await client.get("/admin/ping", headers={"Authorization": "Bearer test-secret"})
        assert resp.status_code == 200
        assert resp.json() == {"ok": True}
    finally:
        del os.environ["ADMIN_SECRET"]


@pytest.mark.anyio
async def test_leaderboard_completed_entries_sorted_before_in_progress(client):
    from stage_data import stages

    # Start two sessions
    r1 = await client.post("/start", json={"player_name": "Grace"})
    sid1 = r1.json()["session_id"]
    r2 = await client.post("/start", json={"player_name": "Hank"})
    sid2 = r2.json()["session_id"]

    # Complete Grace's game
    for stage_id in range(1, 6):
        token = stages[stage_id]["code"]
        await client.post("/scan", json={"session_id": sid1, "token": token})

    # Hank stays in progress

    resp = await client.get("/leaderboard")
    entries = resp.json()
    names = [e["player_name"] for e in entries]
    grace_idx = names.index("Grace")
    hank_idx = names.index("Hank")
    assert grace_idx < hank_idx
