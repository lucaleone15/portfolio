/**
 * Responsive variants of the project images. Every /images/X.webp has a 640px copy in
 * /images/sm/ and a 1280px copy in /images/md/ (scripts/make-image-variants.py).
 * Full images are 1200–1920px wide.
 */
export const smallImage = (src: string) => src.replace('/images/', '/images/sm/');

export const mediumImage = (src: string) => src.replace('/images/', '/images/md/');

/** srcset offering 640 / 1280 px variants and the full image; the browser picks per screen */
export const imageSrcSet = (src: string) => `${smallImage(src)} 640w, ${mediumImage(src)} 1280w, ${src} 1920w`;
