"""Rewrite the two text lines of the social share image (og.png) without touching the rest of the design.

The background is a purely horizontal gradient, so each row equals the top row. The original lines were drawn
with Pillow (libraqm) as: headline Tajawal-Black 62 px, white, anchor 'ms' at (600, 393); sub-line Tajawal-Bold
32 px, colour (220, 240, 250), anchor 'ms' at (600, 457). Rendering the old texts with these values reproduces
the previous image pixel for pixel, so new text drawn the same way keeps the design identical.

Usage (from the repository root):  python3 studio/scripts/og_text.py
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
FONTS = os.path.join(ROOT, 'studio', 'fonts')
SRC = DST = os.path.join(ROOT, 'og.png')

HEADLINE = 'قارن مواقع حجز الفنادق واحجز بثقة'
SUBLINE = 'فنادق وشقق ومنتجعات حول العالم · بدون رسوم من عندنا'
BAND = (320, 490)          # rows that hold only these two lines (logo ends at 271, button starts at 507)
MAX_WIDTH = 1040           # keep at least 80 px free on each side


def fit(text, weight, size):
    """Largest size not above `size` whose width fits MAX_WIDTH."""
    while True:
        f = ImageFont.truetype(os.path.join(FONTS, 'Tajawal-%s.ttf' % weight), size)
        l, t, r, b = f.getbbox(text, direction='rtl', language='ar', anchor='ms')
        if r - l <= MAX_WIDTH:
            return f, size, r - l
        size -= 1


def main():
    im = Image.open(SRC).convert('RGB')
    a = np.asarray(im).copy()
    a[BAND[0]:BAND[1] + 1] = a[3][None, :, :]          # repaint the band with the background gradient
    out = Image.fromarray(a)
    d = ImageDraw.Draw(out)
    f1, s1, w1 = fit(HEADLINE, 'Black', 62)
    f2, s2, w2 = fit(SUBLINE, 'Bold', 32)
    d.text((600, 393), HEADLINE, font=f1, fill=(255, 255, 255), anchor='ms', direction='rtl', language='ar')
    d.text((600, 457), SUBLINE, font=f2, fill=(220, 240, 250), anchor='ms', direction='rtl', language='ar')
    out.save(DST, optimize=True)
    print('headline size', s1, 'width', w1, '| sub-line size', s2, 'width', w2)


if __name__ == '__main__':
    main()
