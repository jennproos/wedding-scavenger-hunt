import uuid
import importlib
import sys


def _reload_stage_data():
    """Force a fresh import of stage_data to test reimport stability."""
    if "stage_data" in sys.modules:
        del sys.modules["stage_data"]
    import stage_data
    return stage_data


def test_tokens_are_valid_uuids():
    import stage_data
    for stage_id, stage in stage_data.stages.items():
        token = stage["qr_token"]
        # Should not raise ValueError
        parsed = uuid.UUID(token)
        assert str(parsed) == token


def test_all_stage_keys_are_integers():
    import stage_data
    for key in stage_data.stages.keys():
        assert isinstance(key, int), f"Expected int key, got {type(key)}: {key}"


def test_exactly_one_final_stage():
    import stage_data
    final_stages = [s for s in stage_data.stages.values() if s["next"] is None]
    assert len(final_stages) == 1, f"Expected exactly 1 final stage, got {len(final_stages)}"


def test_exactly_five_stages():
    import stage_data
    assert len(stage_data.stages) == 5


def test_tokens_are_stable_across_reimport():
    """Tokens must be loaded from JSON, not regenerated on each import."""
    import stage_data
    tokens_first = {k: v["qr_token"] for k, v in stage_data.stages.items()}

    stage_data2 = _reload_stage_data()
    tokens_second = {k: v["qr_token"] for k, v in stage_data2.stages.items()}

    assert tokens_first == tokens_second, "Tokens changed between imports — not persisted!"


def test_all_tokens_are_unique():
    import stage_data
    tokens = [v["qr_token"] for v in stage_data.stages.values()]
    assert len(tokens) == len(set(tokens)), "Duplicate tokens found!"


def test_stages_have_required_fields():
    import stage_data
    for stage_id, stage in stage_data.stages.items():
        assert "clue" in stage, f"Stage {stage_id} missing 'clue'"
        assert "qr_token" in stage, f"Stage {stage_id} missing 'qr_token'"
        assert "next" in stage, f"Stage {stage_id} missing 'next'"


def test_stage_chain_is_complete():
    """Every next pointer (except None) must point to an existing stage."""
    import stage_data
    for stage_id, stage in stage_data.stages.items():
        next_id = stage["next"]
        if next_id is not None:
            assert next_id in stage_data.stages, (
                f"Stage {stage_id} points to non-existent stage {next_id}"
            )
