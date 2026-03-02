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
            "Love takes bravery — this much is true.\n"
            "Sometimes it starts with a drink or two.\n"
            "Find the place where glasses clink,\n"
            "where laughter grows with every drink.\n"
            "Raise a toast, don't spill a drop —\n"
            "your next clue waits where spirits hop."
        ),
        "next": 3,
    },
    3: {
        "clue": (
            "Some nights fade, but not this one.\n"
            "We're saving proof of all this fun.\n"
            "Find the place where flashes gleam,\n"
            "and silly faces live in between.\n"
            "Strike a pose or sign your name —\n"
            "the next step waits beside the frame."
        ),
        "next": 4,
    },
    4: {
        "clue": (
            "When the music starts and shoes come off,\n"
            "grace disappears and moves get soft.\n"
            "Find the floor where rhythm rules,\n"
            "where uncles spin and cousins twirl.\n"
            "When the beat drops low and joy takes hold —\n"
            "your final secret will unfold."
        ),
        "next": 5,
    },
    5: {
        "clue": (
            "Two tiny rulers of our domain,\n"
            "soft of paw and loud of reign.\n"
            "They supervise our every plan,\n"
            "judge each guest and each dance span.\n"
            "Seek the faces small yet grand —\n"
            "the true heads of this wedding land."
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
