import { clientMedia } from "./data/clientMedia.js";
// Presentation-only selection. The supplied catalog and original assets remain intact.
// Some red/ivory catalog galleries mix group shots and other styles; show only
// photographs visibly containing the selected piece.
// Six photographs per piece: the lead shot plus five, and the film after them.
export const GALLERY_LIMIT = 6;

export function galleryImages(product) {
  const ranges = {
    X5671: n => n === 9 || (n >= 53 && n <= 71),
    X5396: n => n === 8 || (n >= 18 && n <= 23) || (n >= 28 && n <= 31) || n >= 73,
    X5672: n => n === 7 || (n >= 32 && n <= 51),
    X5673: n => n === 10 || (n >= 18 && n <= 22) || (n >= 24 && n <= 31) || n >= 73,
  };
  const accepts = ranges[product.itemNumber];
  const originals = accepts ? product.images.filter(src => accepts(Number(src.match(/source-(\d+)/)?.[1]))) : product.images;
  return [...new Set([...originals, ...(clientMedia[product.slug] || [])])].slice(0, GALLERY_LIMIT);
}
export function imagePreview(src, width = 480) {
  return `/assets/previews/${src.replace('/assets/products/', '').replace(/\.jpg$/, '')}-${width}.webp`;
}

export function cardImage(product) { return clientMedia[product.slug]?.[0] || product.images[0]; }
