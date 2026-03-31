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
            "Our story begins where kindness stays —\n"
            "start your quest where gratitude lays."
        ),
        "next": 2,
    },
    2: {
        "clue": (
            "Before the night, before the cheer,\n"
            "two voices said the words most dear.\n"
            "Where flowers stood and witnessed our vow,\n"
            "the petals still remember how —\n"
            "find the place where \"I do\" rang true,\n"
            "your next clue blooms there, just for you."
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
            "When the music starts and shoes come off,\n"
            "grace disappears and moves get soft.\n"
            "Find the floor where rhythm rules,\n"
            "where uncles spin and cousins twirl.\n"
            "Hit the floor, don't miss a beat —\n"
            "your next clue hides beneath your feet."
        ),
        "next": 5,
    },
    5: {
        "clue": (
            "Not every love needs center stage —\n"
            "some joy belongs on a quieter page.\n"
            "Find the nook where hushed and still,\n"
            "soft couches wait with cozy fill.\n"
            "The calmest corner of this place —\n"
            "your final answer ends the race."
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
