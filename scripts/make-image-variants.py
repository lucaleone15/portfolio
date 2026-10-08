"""Responsive variants of the project images: public/images/*.webp -> sm/ (640px) and md/ (1280px).

Used in srcset for project cards and covers, so phones and small slots load lighter files.
Run after adding or replacing a project image:  python3 scripts/make-image-variants.py
"""
import io
from pathlib import Path
from PIL import Image, ImageCms

SRGB = ImageCms.createProfile('sRGB')


def to_srgb(im):
    """Pixels converted to sRGB. Mac screenshots are tagged Display P3: dropping the profile
    without converting makes their colours look washed out in the browser."""
    icc = im.info.get('icc_profile')
    if icc:
        source = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        return ImageCms.profileToProfile(im.convert('RGB'), source, SRGB, outputMode='RGB')
    return im.convert('RGB')

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
            to_srgb(im).resize((w, h), Image.LANCZOS).save(target, 'WEBP', quality=quality, method=6)
        print(f'{folder}/{path.name}: {path.stat().st_size // 1024} KB -> {target.stat().st_size // 1024} KB')
