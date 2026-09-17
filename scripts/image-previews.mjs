const { default: sharp } = await import(process.env.SHARP_MODULE || 'sharp');
import fs from 'node:fs';
import path from 'node:path';
import {products} from '../src/data/products.js';
import {galleryImages,imagePreview} from '../src/media.js';
const files=[...new Set(products.flatMap(p=>[...p.images,...galleryImages(p)]))];
for(const src of files) for(const width of [160,480,960]) {
 const dest='public'+imagePreview(src,width); fs.mkdirSync(path.dirname(dest),{recursive:true});
 if(!fs.existsSync(dest)) await sharp('public'+src).resize({width,withoutEnlargement:true}).webp({quality:85}).toFile(dest);
}
console.log('Generated responsive derivatives for',files.length,'original photos.');
