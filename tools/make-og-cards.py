#!/usr/bin/env python3
"""Generate 1200x630 Open Graph share cards for each app in link-config.json.

Each card: app icon + name + tagline + a "free on <stores>" line on a calm
parchment background with the app's accent. Written to <app>/og-share.png and
referenced by the /go/ redirect pages so pasted links unfurl a proper large card
on WhatsApp / Reddit / Discord / Substack / Medium / X.

Run: python3 tools/make-og-cards.py   (from the repo root)
Deps: Pillow (PIL). Fonts are vendored in tools/fonts/.
"""
import json
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, "tools", "fonts")
CONFIG = os.path.join(ROOT, "tools", "link-config.json")

W, H = 1200, 630
BG = (250, 246, 240)        # #FAF6F0 parchment
INK = (45, 42, 38)          # #2D2A26
MUTED = (110, 104, 94)      # #6E685E
ICON_BOX = 300
PAD = 100
TEXT_X = PAD + ICON_BOX + 70  # right column start


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rounded(img, radius):
    """Return img with rounded-corner alpha."""
    img = img.convert("RGBA")
    mask = Image.new("L", img.size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, img.size[0], img.size[1]], radius=radius, fill=255)
    img.putalpha(mask)
    return img


def fit(img, box):
    """Scale to fit within box x box preserving aspect."""
    img = img.copy()
    img.thumbnail((box, box), Image.LANCZOS)
    return img


def wrap(draw, text, font, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def fit_font(draw, text, path, start, max_w, min_size=48):
    size = start
    while size > min_size:
        f = ImageFont.truetype(path, size)
        if draw.textlength(text, font=f) <= max_w:
            return f
        size -= 4
    return ImageFont.truetype(path, min_size)


def make_card(app_key, app):
    accent = hex_to_rgb(app.get("accent", "#A08560"))
    card = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(card)

    # Top accent bar
    draw.rectangle([0, 0, W, 12], fill=accent)

    # Icon (left, vertically centered), rounded
    icon_path = os.path.join(ROOT, app["icon"].lstrip("/"))
    icon = fit(Image.open(icon_path), ICON_BOX)
    icon = rounded(icon, 56)
    iy = (H - icon.size[1]) // 2
    card.paste(icon, (PAD, iy), icon)

    playfair = os.path.join(FONTS, "PlayfairDisplay.ttf")
    dmsans = os.path.join(FONTS, "DMSans.ttf")
    max_w = W - TEXT_X - 80

    # Name
    name_font = fit_font(draw, app["name"], playfair, 96, max_w, 60)
    # Tagline (wrapped)
    tag_font = ImageFont.truetype(dmsans, 38)
    tag_lines = wrap(draw, app["tagline"], tag_font, max_w)
    # CTA
    stores = "Google Play & App Store" if app.get("ios") else "Google Play"
    cta_font = ImageFont.truetype(dmsans, 32)
    dom_font = ImageFont.truetype(dmsans, 26)

    # Vertical layout (measured, centered as a block)
    name_h = name_font.getbbox(app["name"])[3]
    line_h = 48
    block_h = name_h + 24 + len(tag_lines) * line_h + 40 + 40 + 30 + 34
    y = (H - block_h) // 2

    draw.text((TEXT_X, y), app["name"], font=name_font, fill=INK)
    y += name_h + 24
    for ln in tag_lines:
        draw.text((TEXT_X, y), ln, font=tag_font, fill=MUTED)
        y += line_h
    y += 24
    draw.text((TEXT_X, y), f"Free on {stores}", font=cta_font, fill=accent)
    y += 52
    draw.text((TEXT_X, y), "purposelabstudio.com", font=dom_font, fill=accent)

    out = os.path.join(ROOT, app_key, "og-share.png")
    card.save(out, "PNG", optimize=True)
    print(f"  {app_key}/og-share.png  ({app['name']})")
    return out


def main():
    with open(CONFIG) as f:
        cfg = json.load(f)
    print("Generating OG share cards (1200x630):")
    for key, app in cfg["apps"].items():
        make_card(key, app)
    print("Done. Re-run after changing an app icon, name, tagline, or accent.")


if __name__ == "__main__":
    main()
