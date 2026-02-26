"""
Generate printable QR code PNGs for each stage token.

Run from the backend/ directory:
    python qr_generator.py

Output: qr_codes/qr_stage_1.png ... qr_stage_5.png
"""
import os
import qrcode
from stage_data import stages

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "qr_codes")


def generate_qr_codes():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for stage_id, stage in stages.items():
        img = qrcode.make(stage["qr_token"])
        path = os.path.join(OUTPUT_DIR, f"qr_stage_{stage_id}.png")
        img.save(path)
        print(f"Saved {path}")


if __name__ == "__main__":
    generate_qr_codes()
