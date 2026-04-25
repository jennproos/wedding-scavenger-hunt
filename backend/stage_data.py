import json
import os
import random
from pathlib import Path

_STAGES_JSON = Path(__file__).parent / "stages.json"

_STAGE_DEFINITIONS = {
    1: {
        "clue": (
            "Before the dancing and the cheer,\n"
            "there's a place for words sincere.\n"
            "Where envelopes gather, stacked with care,\n"
            "and thoughtful notes are waiting there.\n"
            "Our story begins where kindness stays,\n"
            "start your quest where gratitude lays."
        ),
        "next": 2,
    },
    2: {
        "clue": (
            "Before the night was yours to keep,\n"
            "two voices made a promise deep.\n"
            "Walk the aisle to where it ends,\n"
            "where \"I do\" rang out, and a new life begins —\n"
            "find the spot where we stood and swore,\n"
            "your next clue waits at that very floor."
        ),
        "next": 3,
    },
    3: {
        "clue": (
            "Some nights fade, but not this one.\n"
            "We're saving proof of all this fun.\n"
            "Find the booth where flashes gleam,\n"
            "and memories print like a happy dream.\n"
            "Strike a pose, take your shot —\n"
            "your next clue waits right on the spot."
        ),
        "next": 4,
    },
    4: {
        "clue": (
            "Not every memory needs a photograph —\n"
            "some live in a song, a spin, a laugh.\n"
            "Find the place where the rhythm takes hold,\n"
            "where the night gets loud and the dancing gets bold —\n"
            "seek the speaker sitting low beside the beat —\n"
            "your next clue crowns it, right at your feet."
        ),
        "next": 5,
    },
    5: {
        "clue": (
            "Not every guest wants the spotlight's glow —\n"
            "some find the places only insiders know.\n"
            "Find the lounge where the bathrooms meet,\n"
            "soft couches waiting, a cozy retreat.\n"
            "Settle in, you've almost won —\n"
            "your final answer says you're done."
        ),
        "next": None,
    },
}


def _load_or_create_tokens() -> dict:
    """Load tokens from env vars (STAGE_N_CODE) or stages.json, generating if missing."""
    if _STAGES_JSON.exists():
        with open(_STAGES_JSON) as f:
            tokens = json.load(f)
    else:
        tokens = {str(stage_id): str(random.randint(1000, 9999)) for stage_id in _STAGE_DEFINITIONS}
        with open(_STAGES_JSON, "w") as f:
            json.dump(tokens, f, indent=2)

    for stage_id in _STAGE_DEFINITIONS:
        env_code = os.environ.get(f"STAGE_{stage_id}_CODE")
        if env_code:
            tokens[str(stage_id)] = env_code

    return tokens


def _build_stages() -> dict:
    tokens = _load_or_create_tokens()
    result = {}
    for stage_id, definition in _STAGE_DEFINITIONS.items():
        result[stage_id] = {
            "clue": definition["clue"],
            "code": tokens[str(stage_id)],
            "next": definition["next"],
        }
    return result


stages: dict = _build_stages()
