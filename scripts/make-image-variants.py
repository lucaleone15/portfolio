"""Responsive variants of the project images: public/images/*.webp -> sm/ (640px) and md/ (1280px).

Used where images are displayed small (hero image trail, thumbnails) and in srcset for
phones. Run after adding or replacing a project image:  python3 scripts/make-image-variants.py
"""
from pathlib import Path
from PIL import Image

SRC = Path('public/images')
VARIANTS = {'sm': (640, 76), 'md': (1280, 78)}

for folder, (width, quality) in VARIANTS.items():
    out = SRC / folder
    out.mkdir(exist_ok=True)
    for path in sorted(SRC.glob('*.webp')):
        target = out / path.name
        with Image.open(path) as im:
            w = min(width, im.width)  # never upscale (some originals are 1200px wide)
            h = round(im.height * w / im.width)
            im.convert('RGB').resize((w, h), Image.LANCZOS).save(target, 'WEBP', quality=quality, method=6)
        print(f'{folder}/{path.name}: {path.stat().st_size // 1024} KB -> {target.stat().st_size // 1024} KB')
