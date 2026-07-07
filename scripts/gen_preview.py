from PIL import Image, ImageDraw, ImageFont

ICON = Image.open('/home/claude/pdd-trainer/resources/icon.png').convert('RGBA')
FG = Image.open('/home/claude/pdd-trainer/resources/icon-foreground.png').convert('RGBA')
BG = Image.open('/home/claude/pdd-trainer/resources/icon-background.png').convert('RGBA')
SPLASH = Image.open('/home/claude/pdd-trainer/resources/splash.png').convert('RGBA')

SIZE = 1024


def mask_circle(img):
    m = Image.new('L', img.size, 0)
    ImageDraw.Draw(m).ellipse([0, 0, img.size[0], img.size[1]], fill=255)
    out = img.copy()
    out.putalpha(m)
    return out


def mask_squircle(img, n=4.5):
    w, h = img.size
    m = Image.new('L', (w, h), 0)
    px = m.load()
    cx, cy = w / 2, h / 2
    r = w / 2
    for y in range(h):
        for x in range(w):
            v = (abs(x - cx) / r) ** n + (abs(y - cy) / r) ** n
            if v <= 1:
                px[x, y] = 255
    out = img.copy()
    out.putalpha(m)
    return out


def compose_adaptive():
    """Собираем adaptive icon вручную (bg + fg) как это делает Android рантайм, для превью."""
    out = BG.copy()
    out.alpha_composite(FG)
    return out


def paste_on_checker(img, size, cell=16):
    """Кладём на мелкую шахматку, чтобы видеть прозрачность/края."""
    base = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    for y in range(0, size, cell):
        for x in range(0, size, cell):
            c = (30, 32, 38, 255) if (x // cell + y // cell) % 2 == 0 else (20, 22, 26, 255)
            base.paste(Image.new('RGBA', (cell, cell), c), (x, y))
    icon_resized = img.resize((size, size), Image.LANCZOS)
    base.alpha_composite(icon_resized)
    return base


adaptive_flat = compose_adaptive()

# --- Лист 1: формы масок лаунчера, крупно ---
pad = 60
cell = 340
cols = 3
sheet = Image.new('RGBA', (cell * cols + pad * (cols + 1), cell + pad * 2 + 90), (18, 20, 26, 255))
d = ImageDraw.Draw(sheet)

shapes = [
    ('Круг (Pixel)', mask_circle(adaptive_flat.resize((cell, cell), Image.LANCZOS))),
    ('Сквиркл (Samsung)', mask_squircle(adaptive_flat.resize((cell, cell), Image.LANCZOS))),
    ('Квадрат (легаси)', ICON.resize((cell, cell), Image.LANCZOS)),
]

try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 26)
except Exception:
    font = ImageFont.load_default()

for i, (label, im) in enumerate(shapes):
    x = pad + i * (cell + pad)
    y = pad
    sheet.alpha_composite(im, (x, y))
    tw = d.textlength(label, font=font)
    d.text((x + cell / 2 - tw / 2, y + cell + 20), label, fill=(180, 185, 195, 255), font=font)

sheet.convert('RGB').save('/home/claude/pdd-trainer/resources/preview-shapes.png', quality=95)

# --- Лист 2: реальные мелкие размеры на тёмном фоне, как строка приложений ---
sizes = [96, 72, 48, 32]
pad2 = 50
row_h = 160
sheet2 = Image.new('RGBA', (pad2 * (len(sizes) + 1) + sum(row_h for _ in sizes), row_h + pad2 * 2), (10, 12, 16, 255))
d2 = ImageDraw.Draw(sheet2)
x = pad2
for s in sizes:
    small = mask_circle(adaptive_flat.resize((s, s), Image.LANCZOS))
    y = pad2 + (row_h - s) // 2
    sheet2.alpha_composite(small, (x, y))
    label = f'{s}px'
    tw = d2.textlength(label, font=font)
    d2.text((x + s / 2 - tw / 2, pad2 + row_h - 24), label, fill=(140, 145, 155, 255), font=font)
    x += row_h
sheet2 = sheet2.crop((0, 0, x, sheet2.height))
sheet2.convert('RGB').save('/home/claude/pdd-trainer/resources/preview-sizes.png', quality=95)

# --- Лист 3: сплэш-скрин целиком (уменьшенный) ---
splash_preview = SPLASH.resize((600, 600), Image.LANCZOS)
splash_preview.convert('RGB').save('/home/claude/pdd-trainer/resources/preview-splash.png', quality=95)

print('OK')
