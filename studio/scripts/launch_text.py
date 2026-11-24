#!/usr/bin/env python3
"""Replace the headline wording inside the four launch images without rebuilding them.

The launch images (media/nuzul_launch_*.png) have no source template in the repository, so the
headline is changed in the pixels themselves: the old line is removed, the background and the
soft text shadow are rebuilt from what surrounds it, and the new line is set in the same font
(Tajawal Black), size, baseline and alignment that are measured from the old line.
Everything that is not the replaced line stays bit-identical (pill, logo, other lines, bullets).

    python3 studio/scripts/launch_text.py <folder with the ORIGINAL images> <output folder>

The originals are the files of commit fbded98 (headline "قارن أسعار الفنادق من مكان واحد"):
    git show fbded98:media/nuzul_launch_square_1080.png > orig/nuzul_launch_square_1080.png   (and the other three)
Running it on images that were already changed fails, because the old line is no longer there.

Needs: numpy, scipy, opencv-python, Pillow built with libraqm (Arabic shaping).
"""
import sys, os, json, time
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

FD = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts') + os.sep

# rows = the pixel rows of a headline line in the original image; (old, new) = its wording.
# head_rows = rows of the whole headline block (all its lines); win = plain area used to measure shadow and background.
CFG = {
    'nuzul_launch_square_1080': dict(head_rows=(285, 493), win=(60, 212, 1020, 520), align='center',
                                     lines=[((290, 383), ('قارن أسعار الفنادق', 'قارن مواقع الحجز'))]),
    'nuzul_launch_pin_1000x1500': dict(head_rows=(368, 758), win=(40, 285, 960, 792), align='center',
                                       lines=[((374, 491), ('قارن أسعار', 'قارن مواقع')), ((523, 621), ('الفنادق', 'الحجز'))]),
    'nuzul_launch_story_1080x1920': dict(head_rows=(562, 969), win=(40, 475, 1040, 1003), align='center',
                                         lines=[((568, 690), ('قارن أسعار', 'قارن مواقع')), ((723, 826), ('الفنادق', 'الحجز'))]),
    'nuzul_launch_wide_1600x900': dict(head_rows=(26, 441), head_cols=(700, 1599), win=(640, 0, 1599, 470), align='right',
                                       lines=[((32, 156), ('قارن أسعار', 'قارن مواقع')), ((191, 294), ('الفنادق', 'الحجز'))]),
}


def gb(f, s):
    return cv2.GaussianBlur(f, (0, 0), s, borderType=cv2.BORDER_REFLECT)


def content_alpha(a):
    """Coverage (0..1) of everything drawn in white/orange on the blue background, read from the red channel.
    The red level of the background under the glyphs is interpolated from the real background pixels
    around them, so a glow behind the text does not leave a haze."""
    R = a[..., 0]
    Rbg = ndi.gaussian_filter(ndi.minimum_filter(R, size=75), 20)
    al = np.clip((R - Rbg) / np.maximum(1.0, 255.0 - Rbg), 0, 1)
    for _ in range(2):
        bg = (ndi.maximum_filter(al, size=7) < 0.30).astype(np.float64)
        est = None
        have = None
        for sg in (8, 16, 32, 64):
            d = gb(bg, sg)
            v = gb(bg * R, sg) / np.maximum(d, 1e-9)
            ok = d > 0.15
            if est is None:
                est, have = v, ok
            else:
                est = np.where(have, est, v)
                have = have | ok
        Rbg = np.where(bg > 0, gb(np.where(bg > 0, R, est), 2.0), est)
        al = np.clip((R - Rbg) / np.maximum(1.0, 255.0 - Rbg), 0, 1)
    return al


def shadow(M, sigma, dy):
    """Shape of a soft drop shadow: the glyph coverage moved down by dy and blurred."""
    return ndi.gaussian_filter(ndi.shift(M, (dy, 0), order=1, mode='constant'), sigma)


def fit_shadow(a, al, head_rows, win, head_cols=None, other_pad=14, hp=50,
               sigmas=(5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 24, 28, 32), dys=(0, 2, 4, 6, 8, 10, 12, 14)):
    """Measure the headline's shadow (blur sigma, vertical offset, strength) from the background pixels around it.
    Works on every second pixel. Other content and its surroundings are left out of the measurement."""
    H, W, _ = a.shape
    hc = head_cols or (0, W - 1)
    M = np.zeros((H, W))
    M[head_rows[0]:head_rows[1] + 1, hc[0]:hc[1] + 1] = al[head_rows[0]:head_rows[1] + 1, hc[0]:hc[1] + 1]
    other = al.copy()
    other[head_rows[0]:head_rows[1] + 1, hc[0]:hc[1] + 1] = 0
    x0, y0, x1, y1 = win
    m = np.zeros((H, W), bool)
    m[y0:y1 + 1, x0:x1 + 1] = True
    m &= ~(ndi.maximum_filter(al, size=7) > 0.08)
    m &= ~(ndi.maximum_filter(other, size=2 * other_pad + 1) > 0.08)
    sl = (slice(y0, y1 + 1, 2), slice(x0, x1 + 1, 2))
    mm = m[sl].astype(np.float64)
    den = gb(mm, hp / 2) + 1e-9

    def HP(f):   # what is left after removing the slow background gradient (background pixels only)
        return (f - gb(f * mm, hp / 2) / den) * mm

    T = [HP(np.log(np.maximum(a[..., c][sl], 1.0))) for c in (1, 2)]
    n = mm.sum() * 2
    base = sum((t ** 2).sum() for t in T)
    best = None
    for sg in sigmas:
        for dy in dys:
            s = np.ascontiguousarray(shadow(M, sg, dy)[sl])

            def E(k):
                u = HP(np.log(np.maximum(1 - k * s, 0.02)))
                return sum(((t - u) ** 2).sum() for t in T)

            lo, hi, g = 0.02, 0.95, 0.381966
            c1 = lo + g * (hi - lo)
            c2 = hi - g * (hi - lo)
            e1, e2 = E(c1), E(c2)
            for _ in range(11):
                if e1 < e2:
                    hi, c2, e2 = c2, c1, e1
                    c1 = lo + g * (hi - lo)
                    e1 = E(c1)
                else:
                    lo, c1, e1 = c1, c2, e2
                    c2 = hi - g * (hi - lo)
                    e2 = E(c2)
            k = (lo + hi) / 2
            e = E(k)
            if best is None or e < best[0]:
                best = (e, sg, dy, k)
    e, sg, dy, k = best
    return dict(sigma=sg, dy=dy, k=float(k), rms=float(np.sqrt(e / n)), base=float(np.sqrt(base / n))), M


def render(text, font, pad=4):
    """Coverage of `text` on a tight canvas, with the position of its advance origin and baseline."""
    l, t, r, b = font.getbbox(text, direction='rtl', language='ar', anchor='ls')
    adv = font.getlength(text, direction='rtl', language='ar')
    W = int(max(r, adv) - min(l, 0) + 2 * pad) + 2
    H = int(b - t + 2 * pad) + 2
    ox, oy = pad - min(l, 0), pad - t
    im = Image.new('L', (W, H), 0)
    ImageDraw.Draw(im).text((ox, oy), text, font=font, fill=255, anchor='ls', direction='rtl', language='ar')
    return np.asarray(im).astype(np.float32) / 255.0, (ox, oy, adv)


def calibrate_font(al, rows, cols, text, weights=('Black', 'ExtraBold', 'Bold')):
    """Weight, size and position of `text` that best reproduce the coverage found in al[rows, cols]."""
    y0, y1 = rows
    x0, x1 = cols
    w = x1 - x0 + 1
    m = 12
    tgt = al[y0 - m:y1 + m + 1, x0 - m:x1 + m + 1].astype(np.float32)
    best = None
    for wgt in weights:
        r100, _ = render(text, ImageFont.truetype(FD + f'Tajawal-{wgt}.ttf', 100))
        xs100 = np.where((r100 > 0.02).any(axis=0))[0]
        est = 100.0 * w / (xs100.max() - xs100.min() + 1)
        for size in np.arange(round(est * 4) / 4 - 4, round(est * 4) / 4 + 4.01, 0.25):
            f = ImageFont.truetype(FD + f'Tajawal-{wgt}.ttf', float(size))
            ra, (ox, oy, adv) = render(text, f)
            ys, xs = np.where(ra > 0.02)
            crop = ra[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
            if crop.shape[0] > tgt.shape[0] or crop.shape[1] > tgt.shape[1]:
                continue
            _, _, loc, _ = cv2.minMaxLoc(cv2.matchTemplate(tgt, crop, cv2.TM_SQDIFF))
            tx, ty = loc
            full = np.zeros_like(tgt)
            full[ty:ty + crop.shape[0], tx:tx + crop.shape[1]] = crop
            err = float(np.abs(full - tgt).sum() / max(1.0, tgt.sum()))
            if best is None or err < best['err']:
                best = dict(err=err, weight=wgt, size=float(size), adv=float(adv),
                            left=float((x0 - m) + tx - (xs.min() - ox)), base=float((y0 - m) + ty - (ys.min() - oy)))
    return best


def place(shape, text, font, left, base):
    H, W = shape
    im = Image.new('L', (W, H), 0)
    ImageDraw.Draw(im).text((left, base), text, font=font, fill=255, anchor='ls', direction='rtl', language='ar')
    return np.asarray(im).astype(np.float64) / 255.0


def local_linear(f, w, sg):
    """Locally weighted plane fit (Gaussian window sg), evaluated at every pixel.
    Stays unbiased on a gradient even when the trusted pixels lie on one side only."""
    H, W = f.shape
    X = np.arange(W, dtype=np.float64)[None, :].repeat(H, 0)
    Y = np.arange(H, dtype=np.float64)[:, None].repeat(W, 1)
    S0, Sx, Sy = gb(w, sg), gb(w * X, sg), gb(w * Y, sg)
    Sxx, Sxy, Syy = gb(w * X * X, sg), gb(w * X * Y, sg), gb(w * Y * Y, sg)
    T0, Tx, Ty = gb(w * f, sg), gb(w * f * X, sg), gb(w * f * Y, sg)
    cx, cy = Sx - X * S0, Sy - Y * S0                       # moments centred on each pixel
    cxx = Sxx - 2 * X * Sx + X * X * S0
    cyy = Syy - 2 * Y * Sy + Y * Y * S0
    cxy = Sxy - X * Sy - Y * Sx + X * Y * S0
    tx, ty = Tx - X * T0, Ty - Y * T0
    det = S0 * (cxx * cyy - cxy * cxy) - cx * (cx * cyy - cxy * cy) + cy * (cx * cxy - cxx * cy)
    d0 = T0 * (cxx * cyy - cxy * cxy) - cx * (tx * cyy - cxy * ty) + cy * (tx * cxy - cxx * ty)
    ok = (S0 > 0.08) & (det > 1e-3 * np.maximum(S0, 1e-9) ** 3 * sg ** 4 * 0.05)
    b0 = np.where(ok, d0 / np.where(np.abs(det) > 1e-12, det, 1.0), T0 / np.maximum(S0, 1e-9))
    return b0, ok


def patch(a, head_rows, win, lines, align, head_cols=None, zone=14):
    H, W, _ = a.shape
    al = content_alpha(a)
    sh, M = fit_shadow(a, al, head_rows, win, head_cols=head_cols)
    rep = dict(shadow=sh, lines=[])
    M_new = M.copy()
    old_line = np.zeros((H, W))
    new_line = np.zeros((H, W))
    for (y0, y1), (old, new) in lines:
        cols = np.where((al[y0:y1 + 1] > 0.5).any(axis=0))[0]
        if align == 'right':                       # the logo may share these rows: keep the right-hand run
            gaps = np.where(np.diff(cols) > 60)[0]
            if len(gaps):
                cols = cols[gaps[-1] + 1:]
        x0, x1 = int(cols.min()), int(cols.max())
        cal = calibrate_font(al, (y0, y1), (x0, x1), old)
        f = ImageFont.truetype(FD + f"Tajawal-{cal['weight']}.ttf", cal['size'])
        adv_new = f.getlength(new, direction='rtl', language='ar')
        left = cal['left'] + cal['adv'] / 2 - adv_new / 2 if align == 'center' else cal['left'] + cal['adv'] - adv_new
        an = place((H, W), new, f, left, cal['base'])
        ao = np.zeros((H, W))
        ao[y0 - 3:y1 + 4, x0 - 3:x1 + 4] = al[y0 - 3:y1 + 4, x0 - 3:x1 + 4]
        old_line = np.maximum(old_line, ao)
        new_line = np.maximum(new_line, an)
        M_new[y0 - 3:y1 + 4, x0 - 3:x1 + 4] = 0
        ys, xs = np.where(an > 0.5)
        cal.update(old_box=[x0, y0, x1, y1], new_box=[int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())])
        rep['lines'].append(cal)
    M_new = np.maximum(M_new, new_line)
    k = sh['k']                                    # black shadow: the same fraction on every channel
    a_old = np.clip(k * shadow(M, sh['sigma'], sh['dy']), 0, 0.9)
    a_new = np.clip(k * shadow(M_new, sh['sigma'], sh['dy']), 0, 0.9)
    # clean background: take the old shadow out of real background pixels, then fit it locally from trusted pixels
    wgt = (~(ndi.maximum_filter(al, size=7) > 0.08)).astype(np.float64) * (1 - np.clip(a_old / k, 0, 1)) ** 3
    wgt *= (ndi.maximum_filter(old_line, size=2 * zone + 3) <= 0.08)     # not right next to the old glyphs
    inwin = np.zeros((H, W))
    inwin[win[1]:win[3] + 1, win[0]:win[2] + 1] = 1
    wgt *= inwin                                                          # only the plain area around the headline
    Bs = np.zeros_like(a)
    for c in range(3):
        Be = a[..., c] / (1 - a_old)
        est = None
        have = None
        for sg in (16, 32, 64):
            b0, ok = local_linear(Be, wgt, sg)
            if est is None:
                est, have = b0, ok
            else:
                est = np.where(have, est, b0)
                have = have | ok
        Bs[..., c] = est
    kept = np.clip(al - old_line, 0, 1)            # everything drawn that stays (other lines, pill, logo, ...)
    Z = (ndi.maximum_filter(old_line, size=2 * zone + 1) > 0.08).astype(np.float64)
    Z = gb(Z, 4.0)
    Z[ndi.maximum_filter(kept, size=5) > 0.08] = 0
    Z = np.clip(Z, 0, 1)[..., None]
    # away from the old line: only the change of shadow is applied, so untouched areas stay exactly as they were
    delta = a + Bs * (a_old - a_new)[..., None] * (1 - np.clip(al, 0, 1))[..., None]
    # where the old line was: rebuilt background with the new shadow
    synth = Bs * (1 - a_new)[..., None]
    out = delta * (1 - Z) + synth * Z
    out = out * (1 - new_line[..., None]) + 255.0 * new_line[..., None]
    out = np.clip(out, 0, 255)
    ch = np.abs(out - a).max(axis=2) > 0.5
    ys, xs = np.where(ch)
    rep['changed_box'] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    # safety: nothing that was kept may have changed
    solid_kept = (al > 0.5) & (old_line < 0.5)
    rep['kept_content_max_change'] = float(np.abs(out - a).max(axis=2)[solid_kept].max())
    return out, rep


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    os.makedirs(dst, exist_ok=True)
    for name, cfg in CFG.items():
        t0 = time.time()
        a = np.asarray(Image.open(os.path.join(src, name + '.png')).convert('RGB')).astype(np.float64)
        out, rep = patch(a, **cfg)
        if rep['kept_content_max_change'] > 0.5 or any(l['err'] > 0.12 for l in rep['lines']):
            raise SystemExit(f'{name}: refused, the result does not pass the checks: ' + json.dumps(rep, ensure_ascii=False))
        Image.fromarray(out.round().astype('uint8')).save(os.path.join(dst, name + '.png'), optimize=True)
        print(name, json.dumps(rep, ensure_ascii=False), round(time.time() - t0, 1), 's', flush=True)
