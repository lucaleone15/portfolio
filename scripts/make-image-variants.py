"""Small variants of the project images (public/images/*.webp -> public/images/sm/*.webp, 640px wide).

Used where images are displayed small (hero image trail, thumbnails) and in srcset for
phones. Run after adding or replacing a project image:  python3 scripts/make-image-variants.py
"""
from pathlib import Path
from PIL import Image

SRC = Path('public/images')
OUT = SRC / 'sm'
WIDTH = 640

OUT.mkdir(exist_ok=True)
for path in sorted(SRC.glob('*.webp')):
    target = OUT / path.name
    with Image.open(path) as im:
        h = round(im.height * WIDTH / im.width)
        im.convert('RGB').resize((WIDTH, h), Image.LANCZOS).save(target, 'WEBP', quality=76, method=6)
    print(f'{path.name}: {path.stat().st_size // 1024} KB -> {target.stat().st_size // 1024} KB')
