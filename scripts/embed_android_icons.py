"""
@capacitor/assets не смог установиться в этой песочнице (sharp тянет нативный бинарник
с GitHub releases, а egress туда закрыт — 403). Раскладываем вручную по тем же путям
и точно тем же размерам, что использует сам шаблон Capacitor — это даже надёжнее.
"""
from PIL import Image, ImageDraw, ImageFilter
import glob
import xml.etree.ElementTree as ET

ACCENT = (242, 169, 59, 255)
BG_DARK = (11, 13, 18, 255)
INK = (244, 245, 247, 255)

RES = '/home/claude/pdd-trainer/android/app/src/main/res'
SCALE = 4  # суперсэмплинг для чистых краёв


def gradient_bg(w, h):
    S = max(w, h) * SCALE
    img = Image.new('RGBA', (S, S), BG_DARK)
    glow = Image.new('L', (S, S), 0)
    gd = ImageDraw.Draw(glow)
    cx, cy = S * 0.5, S * -0.05
    max_r = S * 0.95
    for i in range(220, 0, -1):
        r = max_r * i / 220
        alpha = int(72 * (1 - i / 220) ** 1.6)
        gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=alpha)
    glow = glow.filter(ImageFilter.GaussianBlur(S * 0.02))
    warm = Image.new('RGBA', (S, S), ACCENT)
    img = Image.composite(warm, img, glow)
    img = img.resize((max(w, h), max(w, h)), Image.LANCZOS)
    # обрезаем по центру под нужный прямоугольник
    left = (img.width - w) // 2
    top = (img.height - h) // 2
    return img.crop((left, top, left + w, top + h))


def ring_and_check(size, transparent=True):
    S = size * SCALE
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0) if transparent else BG_DARK)
    d = ImageDraw.Draw(img)
    cx = cy = S / 2
    r_outer, r_inner = S * 0.300, S * 0.234
    d.ellipse([cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer], fill=ACCENT)
    d.ellipse([cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner],
              fill=(0, 0, 0, 0) if transparent else BG_DARK)
    pts = [(-0.135, 0.0), (-0.03, 0.107), (0.166, -0.127)]
    pts = [(cx + x * S, cy + y * S) for x, y in pts]
    w = S * 0.066
    d.line(pts, fill=INK, width=int(w), joint='curve')
    for p in pts:
        d.ellipse([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2], fill=INK)
    return img.resize((size, size), Image.LANCZOS)


def flat_icon(size):
    bg = gradient_bg(size, size)
    fg = ring_and_check(size, transparent=True)
    return Image.alpha_composite(bg, fg)


def circle_mask(img):
    m = Image.new('L', img.size, 0)
    ImageDraw.Draw(m).ellipse([0, 0, img.size[0], img.size[1]], fill=255)
    out = img.copy()
    out.putalpha(m)
    return out


def splash_at(w, h):
    bg = gradient_bg(w, h)
    mark_size = int(min(w, h) * 0.36)
    mark = ring_and_check(mark_size, transparent=True)
    out = bg.copy()
    out.alpha_composite(mark, ((w - mark_size) // 2, (h - mark_size) // 2))
    return out


# --- adaptive + legacy launcher icons, все плотности ---
DENSITY_FG = {'mdpi': 108, 'hdpi': 162, 'xhdpi': 216, 'xxhdpi': 324, 'xxxhdpi': 432}
DENSITY_LEGACY = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}

for density, sz in DENSITY_FG.items():
    fg = ring_and_check(sz, transparent=True)
    fg.save(f'{RES}/mipmap-{density}/ic_launcher_foreground.png')
    bgpng = gradient_bg(sz, sz)
    bgpng.save(f'{RES}/mipmap-{density}/ic_launcher_background.png')

for density, sz in DENSITY_LEGACY.items():
    flat = flat_icon(sz)
    flat.save(f'{RES}/mipmap-{density}/ic_launcher.png')
    circle_mask(flat).save(f'{RES}/mipmap-{density}/ic_launcher_round.png')

# --- переключаем adaptive-icon XML на растровый background вместо плоского цвета ---
for xml_name in ['ic_launcher.xml', 'ic_launcher_round.xml']:
    path = f'{RES}/mipmap-anydpi-v26/{xml_name}'
    content = (
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
        '    <background android:drawable="@mipmap/ic_launcher_background"/>\n'
        '    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n'
        '</adaptive-icon>\n'
    )
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# --- splash под каждый реальный размер, который использует шаблон Capacitor ---
splash_targets = set()
for fp in glob.glob(f'{RES}/drawable*/splash.png'):
    im = Image.open(fp)
    splash_targets.add((fp, im.size))

for fp, (w, h) in splash_targets:
    splash_at(w, h).convert('RGB').save(fp)

print(f'Иконок по плотностям: {len(DENSITY_FG) + len(DENSITY_LEGACY)*2}, splash-файлов: {len(splash_targets)}')
