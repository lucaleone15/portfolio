"""Site icons from one definition: the "LL" monogram (two Ls, one on each side of a line,
on the site's two reds). Writes public/favicon.svg and the PNGs (rendered by headless Chrome,
so they match the SVG exactly):

  favicon-32.png        browser tabs (full mark)
  apple-touch-icon.png  iOS home screen, 180 px (iOS rounds the corners itself: small margin)
  icon-192/512.png      Android / manifest, "maskable": the Ls stay inside the central safe
                        zone, the two reds run to the edges
  signature-logo.png    email signature, 168 px (shown at 56, sharp on retina): the whole tile,
                        corners rounded in the image itself (Outlook ignores border-radius)

Run: python3 scripts/make-icons.py  (needs Google Chrome and Pillow)
The intro animation (src/components/IntroCurtain.tsx) draws the same geometry: keep them in sync.
"""
import os
import subprocess
import tempfile

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'public')
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

RED, HOT, WHITE = '#C50E36', '#FF2E55', '#FFFFFF'  # light / dark accents (src/index.css)

# 64-unit grid. The line runs through the centre from (20, 0) to (44, 64); each L sits whole on
# its side of it, with real L proportions (stem 44 tall, foot 23 wide, 9 thick).
HALF_RED = 'M0 0H20L44 64H0Z'
HALF_HOT = 'M20 0H64V64H44Z'
L_LEFT = 'M10 10H19V45H33V54H10Z'
L_RIGHT = 'M54 54H45V19H31V10H54Z'  # the same L turned 180°


def svg(radius=0, scale=1.0):
    letters = f'<path fill="{WHITE}" d="{L_LEFT}"/><path fill="{WHITE}" d="{L_RIGHT}"/>'
    if scale != 1:
        letters = f'<g transform="translate(32 32) scale({scale}) translate(-32 -32)">{letters}</g>'
    clip = f'<clipPath id="tile"><rect width="64" height="64" rx="{radius}"/></clipPath>' if radius else ''
    # The bright red fills the whole tile and the deep half sits on it: two halves side by side
    # would leave a faint antialiased seam along the line
    body = f'<path fill="{HOT}" d="M0 0H64V64H0Z"/><path fill="{RED}" d="{HALF_RED}"/>{letters}'
    if radius:
        body = f'<g clip-path="url(#tile)">{body}</g>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">{clip}{body}</svg>\n'


def render(svg_text, size, out, transparent=False):
    with tempfile.TemporaryDirectory() as tmp:
        open(os.path.join(tmp, 'icon.svg'), 'w').write(svg_text)
        html = os.path.join(tmp, 'icon.html')
        open(html, 'w').write('<!doctype html><style>html,body{margin:0}img{display:block;width:1024px;height:1024px}</style><img src="icon.svg">')
        shot = os.path.join(tmp, 'shot.png')
        background = ['--default-background-color=00000000'] if transparent else []
        subprocess.run([CHROME, '--headless', '--disable-gpu', '--hide-scrollbars', '--window-size=1024,1024', *background,
                        f'--screenshot={shot}', 'file://' + html], check=True, capture_output=True)
        Image.open(shot).convert('RGBA' if transparent else 'RGB').resize((size, size), Image.LANCZOS).save(out, optimize=True)


open(os.path.join(PUBLIC, 'favicon.svg'), 'w').write(svg(radius=14))
render(svg(), 32, os.path.join(PUBLIC, 'favicon-32.png'))
render(svg(scale=0.86), 180, os.path.join(PUBLIC, 'apple-touch-icon.png'))
render(svg(scale=0.78), 192, os.path.join(PUBLIC, 'icon-192.png'))
render(svg(scale=0.78), 512, os.path.join(PUBLIC, 'icon-512.png'))
render(svg(radius=14), 168, os.path.join(PUBLIC, 'signature-logo.png'), transparent=True)
print('icons written to public/')
