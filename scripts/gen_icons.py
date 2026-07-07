"""
Иконка ПДД Тренажёра. Тот же визуальный язык, что и в самом приложении:
угольно-синий фон с тёплым бликом сверху, янтарный круговой гейдж (как индикатор
прогресса вопроса в UI), белая галочка в центре — "верно / экзамен сдан".
Рисуем в 4x и уменьшаем с LANCZOS — иначе круги и засечки получаются рваными.
"""
from PIL import Image, ImageDraw, ImageFilter
import math

SCALE = 4
BASE = 1024
S = BASE * SCALE  # 4096 — рабочее полотно

BG_DARK = (11, 13, 18, 255)      # #0B0D12
BG_TOP = (27, 24, 20, 255)       # тёплый угольный блик сверху (не чисто navy — теплее, премиальнее)
ACCENT = (242, 169, 59, 255)     # #F2A93B
INK = (244, 245, 247, 255)       # #F4F5F7


def radial_gradient_bg(size):
    """Тёмный фон с мягким янтарным бликом сверху — как bg-dash-noise в самом приложении."""
    img = Image.new('RGBA', (size, size), BG_DARK)
    glow = Image.new('L', (size, size), 0)
    gd = ImageDraw.Draw(glow)
    cx, cy = size * 0.5, size * -0.05
    max_r = size * 0.95
    steps = 220
    for i in range(steps, 0, -1):
        r = max_r * i / steps
        alpha = int(72 * (1 - i / steps) ** 1.6)
        gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=alpha)
    glow = glow.filter(ImageFilter.GaussianBlur(size * 0.02))
    warm = Image.new('RGBA', (size, size), ACCENT)
    img = Image.composite(warm, img, glow)
    return img


def draw_ring_and_check(size, transparent_bg):
    """Возвращает RGBA-слой: кольцо-гейдж + галочка. Фон прозрачный либо закрашенный."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0) if transparent_bg else BG_DARK)
    d = ImageDraw.Draw(img)
    cx = cy = size / 2

    # Кольцо (полный круг-гейдж, как GaugeProgress в самом приложении)
    r_outer = size * 0.300
    r_inner = size * 0.234
    d.ellipse([cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer], fill=ACCENT)
    d.ellipse([cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner],
              fill=(0, 0, 0, 0) if transparent_bg else BG_DARK)

    # Галочка по центру — толстый штрих со скруглёнными стыками
    pts = [(-0.135, 0.0), (-0.03, 0.107), (0.166, -0.127)]
    pts = [(cx + x * size, cy + y * size) for x, y in pts]
    w = size * 0.066
    d.line(pts, fill=INK, width=int(w), joint='curve')
    for p in pts:
        d.ellipse([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2], fill=INK)

    return img


def downsample(img):
    return img.resize((BASE, BASE), Image.LANCZOS)


# --- foreground (прозрачный фон, для adaptive icon) ---
fg = draw_ring_and_check(S, transparent_bg=True)
fg = downsample(fg)
fg.save('/home/claude/pdd-trainer/resources/icon-foreground.png')

# --- background (для adaptive icon) ---
bg = radial_gradient_bg(S)
bg = downsample(bg)
bg.save('/home/claude/pdd-trainer/resources/icon-background.png')

# --- плоская иконка (легаси mipmap, сторы, favicon) ---
flat = radial_gradient_bg(S)
mark = draw_ring_and_check(S, transparent_bg=True)
flat = Image.alpha_composite(flat, mark)
flat = downsample(flat)
flat.save('/home/claude/pdd-trainer/resources/icon.png')

# --- splash: тот же фон + метка по центру помельче, на большом холсте ---
SPLASH = 2732
splash_bg = radial_gradient_bg(SPLASH * SCALE // 4)
splash_bg = splash_bg.resize((SPLASH, SPLASH), Image.LANCZOS)
mark_small = draw_ring_and_check(int(SPLASH * 0.42), transparent_bg=True)
splash = splash_bg.copy()
off = (SPLASH - mark_small.width) // 2
splash.alpha_composite(mark_small, (off, off))
splash.save('/home/claude/pdd-trainer/resources/splash.png')
splash.save('/home/claude/pdd-trainer/resources/splash-dark.png')

print("Готово:", flat.size, fg.size, bg.size, splash.size)
