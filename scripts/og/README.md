# Social preview image

`og-image.html` is rendered at 1200×630 to `public/og-image.jpg` (used as `og:image` /
`twitter:image` on the home pages, see `src/seo.ts`).

To regenerate after a design change, render it with headless Chrome (PNG), then convert to
JPEG (~75 KB instead of ~800 KB because of the grain):

    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
      --hide-scrollbars --window-size=1200,630 --virtual-time-budget=4000 \
      --allow-file-access-from-files --screenshot=/tmp/og.png "file://$PWD/scripts/og/og-image.html"
    python3 -c "from PIL import Image; Image.open('/tmp/og.png').convert('RGB').save('public/og-image.jpg', quality=88, optimize=True, progressive=True)"
