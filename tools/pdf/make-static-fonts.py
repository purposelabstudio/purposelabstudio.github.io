#!/usr/bin/env python3
"""
Pin static instances out of the variable fonts.

Why this exists: Chromium cannot embed a *variable* font instance as a real
outline font in a PDF. It falls back to Type 3 fonts, which are procedure-based
glyphs — they render poorly at small sizes, bloat the file with one subset per
instance, and are rejected or flagged by most print services. Pinning a static
instance first makes Chromium embed proper TrueType/CID fonts.

Verified 2026-08-03: rendering with the variable TTFs produced 14 Type 3 font
objects; rendering with these static instances produces real embedded fonts.

Run:  ./.venv/bin/python make-static-fonts.py
"""

import shutil
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = Path(__file__).parent
SRC = HERE / "fonts"
OUT = SRC / "static"

# opsz 14 is a normal text optical size; the display sizes on our pages are set
# in CSS, not by the optical-size axis.
INSTANCES = [
    ("DMSans.ttf", "DMSans-Regular.ttf", {"wght": 400, "opsz": 14}),
    ("DMSans.ttf", "DMSans-Bold.ttf", {"wght": 700, "opsz": 14}),
    ("PlayfairDisplay.ttf", "PlayfairDisplay-Regular.ttf", {"wght": 400}),
    ("PlayfairDisplay.ttf", "PlayfairDisplay-Bold.ttf", {"wght": 700}),
    ("Caveat.ttf", "Caveat-Regular.ttf", {"wght": 400}),
    ("Caveat.ttf", "Caveat-Bold.ttf", {"wght": 700}),
    ("DancingScript.ttf", "DancingScript-Regular.ttf", {"wght": 400}),
]

# Already static, and the only one with Devanagari coverage — needed for the
# bilingual products.
COPIES = [("Kalam.ttf", "Kalam-Regular.ttf")]


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)

    for src_name, out_name, axes in INSTANCES:
        src = SRC / src_name
        font = TTFont(src)
        static = instancer.instantiateVariableFont(font, axes, updateFontNames=True)
        static.save(OUT / out_name)
        static.close()
        print(f"pinned  {out_name:32} from {src_name} at {axes}")

    for src_name, out_name in COPIES:
        shutil.copy(SRC / src_name, OUT / out_name)
        print(f"copied  {out_name:32} from {src_name} (already static)")

    print()
    failures = 0
    for path in sorted(OUT.glob("*.ttf")):
        font = TTFont(path, lazy=True)
        variable = "fvar" in font
        font.close()
        if variable:
            failures += 1
        print(f"  {path.name:32} {'STILL VARIABLE — BAD' if variable else 'static — OK'}")

    if failures:
        print(f"\nFAIL: {failures} font(s) are still variable.", file=sys.stderr)
        return 1

    print(f"\nOK: {len(list(OUT.glob('*.ttf')))} static fonts in {OUT.relative_to(HERE)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
