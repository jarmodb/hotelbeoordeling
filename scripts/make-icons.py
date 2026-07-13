from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public')
BG = (124, 58, 237, 255)


def star_path(cx, cy, r_outer, r_inner):
    import math
    points = []
    for i in range(10):
        angle = math.pi / 2 + i * math.pi / 5
        r = r_outer if i % 2 == 0 else r_inner
        points.append((cx + r * math.cos(angle), cy - r * math.sin(angle)))
    return points


def make_icon(size, path, maskable=False):
    img = Image.new('RGBA', (size, size), BG)
    draw = ImageDraw.Draw(img)
    cx, cy = size / 2, size / 2
    scale = 0.30 if maskable else 0.34
    pts = star_path(cx, cy, size * scale, size * scale * 0.42)
    draw.polygon(pts, fill=(255, 255, 255, 255))
    img.save(path)


make_icon(192, os.path.join(OUT, 'icon-192.png'))
make_icon(512, os.path.join(OUT, 'icon-512.png'))
make_icon(512, os.path.join(OUT, 'icon-maskable-512.png'), maskable=True)
print('done')
