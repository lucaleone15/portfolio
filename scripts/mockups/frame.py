"""Crop each render to 4:3 around its devices (bbox from the transparent render), same margin
for all, and save the final 1600x1200 webp. Usage: frame.py outdir name dest.webp [fill]"""
import sys
from PIL import Image
outdir, name, dest = sys.argv[1:4]
fill = float(sys.argv[4]) if len(sys.argv) > 4 else 0.86   # share of the frame the devices take
im = Image.open(f'{outdir}/{name}.png').convert('RGB')
a = Image.open(f'{outdir}/{name}.alpha.png').getchannel('A').point(lambda v: 255 if v > 160 else 0)
x0, y0, x1, y1 = a.getbbox()
bw, bh = x1 - x0, y1 - y0
W, H = im.size
# smallest 4:3 box holding the devices at `fill`
ch = max(bh / fill, bw / fill * 3 / 4); cw = ch * 4 / 3
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
ch = min(ch, H); cw = min(cw, W, ch * 4 / 3); ch = cw * 3 / 4
left = min(max(cx - cw / 2, 0), W - cw); top = min(max(cy - ch / 2, 0), H - ch)
out = im.crop((round(left), round(top), round(left + cw), round(top + ch))).resize((1600, 1200), Image.LANCZOS)
out.save(dest, 'WEBP', quality=86, method=6)
print(name, 'bbox', (x0, y0, x1, y1), 'of', (W, H), '->', dest)
