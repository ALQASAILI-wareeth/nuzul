"""Draw Nuzul logo + all text overlays (RGBA PNGs, 1080x1920)."""
import json, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1080, 1920
TURQ = (0, 194, 209)
BLUE = (0, 98, 168)
ORANGE = (255, 178, 56)
WHITE = (255, 255, 255)
FD = '/home/claude/fonts/'
OUT = '/home/claude/build/ov'
os.makedirs(OUT, exist_ok=True)


def font(size, w='Black'):
    return ImageFont.truetype(FD + f'Tajawal-{w}.ttf', size)


def ar_size(text, f):
    l, t, r, b = f.getbbox(text, direction='rtl', language='ar')
    return r - l, b - t, l, t


def draw_ar(d, xy_center, text, f, fill, anchor_y='top'):
    w, h, l, t = ar_size(text, f)
    x = xy_center[0] - w / 2 - l
    y = xy_center[1] - t
    d.text((x, y), text, font=f, fill=fill, direction='rtl', language='ar')
    return w, h


def shadow_layer(base, blur=10, alpha=170, offset=(0, 5)):
    """Return soft dark shadow of base's alpha."""
    a = base.split()[3]
    sh = Image.new('RGBA', base.size, (0, 0, 0, 0))
    black = Image.new('RGBA', base.size, (0, 20, 40, alpha))
    sh.paste(black, offset, a)
    return sh.filter(ImageFilter.GaussianBlur(blur))


def with_shadow(layer, blur=10, alpha=170, offset=(0, 5), tight=True):
    out = Image.new('RGBA', layer.size, (0, 0, 0, 0))
    out.alpha_composite(shadow_layer(layer, blur + 6, min(255, alpha + 50), offset))
    if tight:
        out.alpha_composite(shadow_layer(layer, 2.5, 150, (0, 2)))
    out.alpha_composite(layer)
    return out


# ---------- logo ----------
def house_icon(s):
    """House mark: turquoise roof, blue body, orange door. s = size px."""
    k = 4
    S = s * k
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    u = S / 32
    d.rounded_rectangle([3 * u, 13 * u, 29 * u, 30 * u], radius=3.2 * u, fill=BLUE)
    d.polygon([(16 * u, 2.5 * u), (1.5 * u, 14.5 * u), (30.5 * u, 14.5 * u)], fill=TURQ)
    d.rounded_rectangle([12.8 * u, 19.5 * u, 19.2 * u, 30 * u], radius=1.6 * u, fill=ORANGE)
    # little window wave = water/travel hint
    return im.resize((s, s), Image.LANCZOS)


def text_img(text, f, fill, rtl=True):
    kw = dict(direction='rtl', language='ar') if rtl else {}
    l, t, r, b = f.getbbox(text, **kw)
    im = Image.new('RGBA', (r - l + 4, b - t + 4), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((2 - l, 2 - t), text, font=f, fill=fill, **kw)
    return im


def logo(height=120, tagline=True, color=WHITE):
    """Icon + wordmark (+ tagline under it), RTL: icon on the right."""
    icon = house_icon(height)
    word = text_img('نُزُل', font(int(height * 0.95), 'Black'), color)
    tag = text_img('فنادق وسفر', font(int(height * 0.25), 'Bold'), ORANGE) if tagline else None
    gap = int(height * 0.16)
    tgap = int(height * 0.08)
    textw = max(word.width, tag.width if tag else 0)
    texth = word.height + (tgap + tag.height if tag else 0)
    Hd = max(height, texth) + 10
    Wd = height + gap + textw + 6
    im = Image.new('RGBA', (Wd, Hd), (0, 0, 0, 0))
    im.alpha_composite(icon, (Wd - height, (Hd - height) // 2))
    ty = (Hd - texth) // 2
    right = Wd - height - gap
    im.alpha_composite(word, (right - word.width, ty))
    if tag:
        im.alpha_composite(tag, (right - tag.width, ty + word.height + tgap))
    m = 40  # room for soft shadows
    padded = Image.new('RGBA', (im.width + 2 * m, im.height + 2 * m), (0, 0, 0, 0))
    padded.alpha_composite(im, (m, m))
    return padded


# ---------- persistent frame layer: gradients + small logo ----------
def frame_layer():
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    g = Image.new('L', (1, H), 0)
    for y in range(H):
        a = 0
        if y < 520:
            a = int(150 * (1 - y / 520) ** 1.6)
        if y > 1000:
            a = max(a, int(175 * min(1, (y - 1000) / 600) ** 1.4))
        g.putpixel((0, y), a)
    shade = Image.new('RGBA', (W, H), (0, 15, 30, 255))
    shade.putalpha(g.resize((W, H)))
    im.alpha_composite(shade)
    lg = with_shadow(logo(92), blur=8, alpha=140)
    im.alpha_composite(lg, (W - lg.width - 4, 110))
    return im


# ---------- hook (top, first shot) ----------
def hook_layer(line1, line2=None):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    f1 = font(84, 'Black')
    y = 330
    w, h = draw_ar(d, (W / 2, y), line1, f1, WHITE)
    y += h + 30
    if line2:
        f2 = font(66, 'Black')
        w2, h2, l2, t2 = ar_size(line2, f2)
        padx, pady = 34, 20
        box = [W / 2 - w2 / 2 - padx, y, W / 2 + w2 / 2 + padx, y + h2 + 2 * pady + 6]
        d.rounded_rectangle(box, radius=26, fill=ORANGE)
        d.text((W / 2 - w2 / 2 - l2, y + pady + 3 - t2), line2, font=f2, fill=(10, 35, 60),
               direction='rtl', language='ar')
    return with_shadow(im, blur=12, alpha=150)


# ---------- caption (lower third) ----------
def caption_layer(title, sub, idx, total):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    f1 = font(100, 'Black')
    y = 1180
    w, h = draw_ar(d, (W / 2, y), title, f1, WHITE)
    # orange underline accent
    y2 = y + h + 26
    d.rounded_rectangle([W / 2 - 60, y2, W / 2 + 60, y2 + 10], radius=5, fill=ORANGE)
    # sub chip: turquoise -> blue
    f2 = font(48, 'Bold')
    w2, h2, l2, t2 = ar_size(sub, f2)
    cy = y2 + 38
    padx, pady = 30, 16
    bw, bh = int(w2 + 2 * padx), int(h2 + 2 * pady + 6)
    chip = Image.new('RGBA', (bw, bh), (0, 0, 0, 0))
    grad = Image.new('RGBA', (bw, bh))
    for x in range(bw):
        t = x / max(1, bw - 1)
        c = tuple(int(BLUE[i] * t + TURQ[i] * (1 - t)) for i in range(3)) + (255,)
        for yy in range(bh):
            grad.putpixel((x, yy), c)
    mask = Image.new('L', (bw, bh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, bw - 1, bh - 1], radius=bh // 2, fill=255)
    chip.paste(grad, (0, 0), mask)
    ImageDraw.Draw(chip).text((padx - l2, pady + 3 - t2), sub, font=f2, fill=WHITE,
                              direction='rtl', language='ar')
    im = with_shadow(im, blur=12, alpha=160)
    im.alpha_composite(with_shadow(chip, blur=6, alpha=90, offset=(0, 3)), (int(W / 2 - bw / 2), int(cy)))
    return im


# ---------- end card ----------
def endcard_layer(cta):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    lg = logo(190)
    im.alpha_composite(with_shadow(lg, blur=14, alpha=120), ((W - lg.width) // 2, 610))
    y = 970
    sz = 76
    while ar_size(cta, font(sz, 'Black'))[0] > 940:
        sz -= 2
    w, h = draw_ar(d, (W / 2, y), cta, font(sz, 'Black'), WHITE)
    y += h + 40
    sub = 'قارن الأسعار واحجز بثقة'
    w, h = draw_ar(d, (W / 2, y), sub, font(50, 'Bold'), (220, 245, 250))
    # URL pill
    y += h + 60
    pill = text_img('nuzultravel.com', ImageFont.truetype(FD + 'Tajawal-Black.ttf', 62), (10, 35, 60), rtl=False)
    pw, ph = pill.width + 96, pill.height + 44
    box = [W / 2 - pw / 2, y, W / 2 + pw / 2, y + ph]
    d.rounded_rectangle(box, radius=ph // 2, fill=ORANGE)
    im.alpha_composite(pill, (int(W / 2 - pill.width / 2), int(y + 22)))
    y = box[3] + 22
    w, h = draw_ar(d, (W / 2, y), 'الرابط في البايو', font(40, 'Bold'), (220, 245, 250))
    return with_shadow(im, blur=10, alpha=120)


if __name__ == '__main__':
    spec = json.load(open('/home/claude/scripts/videos.json'))
    frame_layer().save(f'{OUT}/frame.png')
    for v in spec:
        vid = v['id']
        hook_layer(*v['hook']).save(f'{OUT}/{vid}_hook.png')
        for i, s in enumerate(v['shots']):
            caption_layer(s['title'], s['sub'], i, len(v['shots'])).save(f'{OUT}/{vid}_cap{i}.png')
        endcard_layer(v['cta']).save(f'{OUT}/{vid}_end.png')
    # standalone logo files
    os.makedirs('/home/claude/out', exist_ok=True)
    logo(300).save('/home/claude/out/nuzul_logo_white.png')
    logo(300, color=BLUE).save('/home/claude/out/nuzul_logo_blue.png')
    house_icon(1024).save('/home/claude/out/nuzul_icon.png')
    print('ok')
