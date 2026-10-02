/**
 * Responsive variants of the project images. Every /images/X.webp has a 640px-wide copy in
 * /images/sm/X.webp (scripts/make-image-variants.py). Full images are 1200–1920px wide.
 */
export const smallImage = (src: string) => src.replace('/images/', '/images/sm/');

/** srcset offering the 640px variant and the full image; the browser picks per screen */
export const imageSrcSet = (src: string) => `${smallImage(src)} 640w, ${src} 1920w`;
