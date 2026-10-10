"""Project logos for the cards and case studies: public/images/logos/<id>.webp (light theme)
and <id>-dark.webp (dark theme), transparent, cropped tight.

Made from the projects' own files in matiere/ (local only, see .gitignore). Logos that only
exist on a solid background (poster, PDF cover) are separated from it by un-mixing: with a
known background colour, each pixel's opacity and true colour can be recovered, so the
anti-aliased edges stay clean. Neutral parts of a logo (black or white letters) take the
theme's ink colour; brand colours are kept.

Requires PyMuPDF and Pillow (no numpy: plain per-pixel loops, a few seconds). Run from the project root:  python3 scripts/make-project-logos.py
"""
import io
from pathlib import Path

import fitz
from PIL import Image

OUT = Path('public/images/logos')
HEIGHT = 160  # px; shown at most ~40 px high
INK = {'light': (23, 23, 23), 'dark': (255, 255, 255)}


def pixels(im: Image.Image):
    # get_flattened_data replaces getdata from Pillow 12
    return (im.get_flattened_data if hasattr(im, 'get_flattened_data') else im.getdata)()


def unmix(rgb: Image.Image, bg) -> Image.Image:
    """Opaque image on a solid background -> transparent image of what was drawn on it"""
    k = bg

    def pixel(c):
        # Per channel, how far the pixel moved from the background towards 0 or 255
        a = max(
            (v - kv) / max(255 - kv, 1) if v > kv else (kv - v) / max(kv, 1)
            for v, kv in zip(c, k)
        )
        if a < 0.04:
            return (0, 0, 0, 0)
        a = min(a, 1)
        return tuple(round(min(255, max(0, kv + (v - kv) / a))) for v, kv in zip(c, k)) + (round(a * 255),)

    out = Image.new('RGBA', rgb.size)
    out.putdata([pixel(c) for c in pixels(rgb.convert("RGB"))])
    return out


def key(rgb: Image.Image, bg, lo=40, hi=110) -> Image.Image:
    """Coloured logo on a coloured or uneven background: opacity from the distance to the
    background colour (soft edge between lo and hi), colours kept as they are. Un-mixing
    would also pick up a background gradient, or wash out a colour close to the background."""

    def pixel(c):
        d = sum((v - kv) ** 2 for v, kv in zip(c, bg)) ** 0.5
        a = min(1, max(0, (d - lo) / (hi - lo)))
        return tuple(c) + (round(a * 255),) if a else (0, 0, 0, 0)

    out = Image.new('RGBA', rgb.size)
    out.putdata([pixel(c) for c in pixels(rgb.convert('RGB'))])
    return out


def crop(im: Image.Image) -> Image.Image:
    return im.crop(im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox())


def widest_gap(im: Image.Image) -> int:
    """x where the widest run of empty columns starts (between a wordmark and its symbol)"""
    alpha = im.getchannel('A')
    empty = [alpha.crop((x, 0, x + 1, im.height)).getbbox() is None for x in range(im.width)]
    best, start = (im.width, 0), None
    for x, e in enumerate(empty + [False]):
        if e and start is None:
            start = x
        if not e and start is not None:
            if x - start > best[1]:
                best = (start, x - start)
            start = None
    return best[0]


def themed(im: Image.Image, theme: str, mono: bool = False, ink_before: int | None = None) -> Image.Image:
    """Neutral (unsaturated) pixels take the theme's ink colour, brand colours stay
    (mono: the whole logo in the ink colour; ink_before: only left of that x, so that the
    white drawn inside a coloured symbol stays white)"""
    ink = INK[theme]
    width = im.width
    limit = width if ink_before is None else ink_before

    def pixel(i, p):
        r, g, b, a = p
        if i % width >= limit:
            return p
        mx, mn = max(r, g, b), min(r, g, b)
        saturation = (mx - mn) / mx if mx else 0
        return ink + (a,) if mono or saturation < 0.22 else p

    out = Image.new('RGBA', im.size)
    out.putdata([pixel(i, p) for i, p in enumerate(pixels(im))])
    return out


def save(im: Image.Image, name: str, dark_mono: bool = False, symbol_right: bool = False):
    im = crop(im)
    im = im.resize((round(im.width * HEIGHT / im.height), HEIGHT), Image.LANCZOS)
    ink_before = widest_gap(im) if symbol_right else None
    for theme in ('light', 'dark'):
        path = OUT / (f'{name}.webp' if theme == 'light' else f'{name}-dark.webp')
        themed(im, theme, mono=dark_mono and theme == 'dark', ink_before=ink_before).save(path, 'WEBP', quality=92, method=6)
    print(f'{name}: {im.width}x{im.height}')


def pdf_region(path: str, page: int, rect, dpi: int) -> Image.Image:
    pix = fitz.open(path)[page].get_pixmap(dpi=dpi, clip=fitz.Rect(*rect))
    return Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB')


OUT.mkdir(parents=True, exist_ok=True)

# HUG: the full logo (letters + Hôpitaux Universitaires Genève), from the white poster of
# the communication kit (embedded image)
kit = fitz.open('matiere/hug/06-communication/Kit_Communication_CTS.pdf')
poster = Image.open(io.BytesIO(fitz.Pixmap(kit, 2593).tobytes('png'))).convert('RGB')
save(unmix(poster.crop((150, 150, 1250, 520)), (255, 255, 255)), 'hug')

# Karting de Vuiteboeuf: transparent logo file
# (the KV symbol on the right keeps its white letters in both themes)
save(Image.open('matiere/kartingvuiteboeuf/LOGO/Logo-KartingVuiteboeuf.png').convert('RGBA'), 'karting-vuiteboeuf', symbol_right=True)

# OceanSight: the logo on its green, from the case study image
ocean = Image.open('public/images/case/oceansight/logo.webp').convert('RGB')
save(key(ocean, ocean.getpixel((10, 10))), 'oceansight')

# L'Étoile Blanche: the name, from the cover of the Zest playbook (vector), on its white box
eb = pdf_region('matiere/etoileblanche/M53-1_Zest_playbook.pdf', 0, (55, 55, 262, 175), 600)
# Dark red reads poorly on the dark theme: there, the name is white (it is the white star)
save(unmix(eb.crop((80, 260, eb.width - 80, 610)), (255, 255, 255)), 'etoile-blanche', dark_mono=True)

# DriveGear: transparent logo file, the one-line version
save(Image.open('matiere/drivegear/Logo/LogoLigneV1.png').convert('RGBA'), 'drivegear')

# F1 PitWall: the cover of the mock-ups (vector), on black
f1 = pdf_region('matiere/f1pitwall/webdon-labo2-luca-leone-M53-1--maquettes.pdf', 0, (100, 380, 1820, 660), 144)
save(key(f1, f1.getpixel((5, 5))), 'f1-pitwall')
