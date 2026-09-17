import { newProducts } from "./newProducts.js";
const sourceImages = (folder, count) => Array.from({ length: count }, (_, index) => `${folder}/source-${String(index + 1).padStart(2, "0")}.jpg`);
const redIvoryImages = (numbers) => numbers.map((number) => `/assets/products/red-ivory/source/source-${String(number).padStart(2, "0")}.jpg`);
const range = (start, end) => Array.from({ length: end - start + 1 }, (_, index) => start + index);

export const products = [
  {
    id: "blue-gingham-dress-x4991", slug: "blue-gingham-dress-x4991", itemNumber: "X4991", name: "Blue Gingham Collar Dress", collection: "Current edit", category: "Girls", type: "Dress", colour: "Powder blue & ivory", status: "Current edit", featured: true, sizes: ["2Y", "3Y", "4Y", "5Y"],
    description: "A softly structured blue gingham dress with a floral collar, gathered waist and matching headpiece.", detail: "PDF catalog piece X4991 in blue. Final stock and fit are confirmed directly on WhatsApp before ordering.", images: sourceImages("/assets/products/blue-dress/source", 22), video: "/assets/products/blue-dress/product.mp4", alt: "Blue gingham dress with floral collar from Elite Kidz", tags: ["Girls", "Dresses", "Blue", "X4991"]
  },
  {
    id: "ivory-collar-blouse-x4992", slug: "ivory-collar-blouse-x4992", itemNumber: "X4992", name: "Ivory Collar Blouse", collection: "Current edit", category: "Girls", type: "Top", colour: "Natural ivory", status: "Current edit", sizes: ["2Y", "3Y", "4Y", "5Y"],
    description: "An ivory collar blouse with softly gathered volume and delicate trim details.", detail: "PDF catalog piece X4992 in beige/ivory. Final stock and fit are confirmed directly on WhatsApp before ordering.", images: ["/assets/products/pdf-components/x4992-ivory.jpg"], alt: "Ivory collar blouse from Elite Kidz", tags: ["Girls", "Tops", "Ivory", "X4992"]
  },
  {
    id: "blue-gingham-blouse-x4992", slug: "blue-gingham-blouse-x4992", itemNumber: "X4992", name: "Blue Gingham Blouse", collection: "Current edit", category: "Girls", type: "Top", colour: "Powder blue", status: "Current edit", sizes: ["2Y", "3Y", "4Y", "5Y"],
    description: "A blue gingham blouse with a rounded floral collar and an easy, playful shape.", detail: "PDF catalog piece X4992 in blue. The supplied PDF shows this as a separate colourway from the ivory X4992.", images: ["/assets/products/pdf-components/x4992-blue.jpg"], alt: "Blue gingham blouse from Elite Kidz", tags: ["Girls", "Tops", "Blue", "X4992"]
  },
  {
    id: "blue-gingham-pants-x4993", slug: "blue-gingham-pants-x4993", itemNumber: "X4993", name: "Blue Gingham Pants", collection: "Current edit", category: "Girls", type: "Trousers", colour: "Powder blue", status: "Current edit", sizes: ["2Y", "3Y", "4Y", "5Y"],
    description: "Soft blue gingham pants with a relaxed leg and floral details made for movement.", detail: "PDF catalog piece X4993 in blue. Final stock and fit are confirmed directly on WhatsApp before ordering.", images: ["/assets/products/pdf-components/x4993-blue.jpg"], alt: "Blue gingham pants from Elite Kidz", tags: ["Girls", "Trousers", "Blue", "X4993"]
  },
  {
    id: "pink-floral-top-x5010", slug: "pink-floral-top-x5010", itemNumber: "X5010", name: "Pink Floral Collar Top", collection: "Current edit", category: "Girls", type: "Top", colour: "Pink", status: "Current edit", sizes: ["120cm", "130cm", "140cm"],
    description: "A softly printed pink top with a sweet collar and an easy shape for everyday dressing.", detail: "PDF catalog piece X5010 in pink. The supplied stock sheet shows availability for 120cm, 130cm and 140cm; final confirmation is on WhatsApp.", images: ["/assets/products/pdf-5010/product.jpg"], alt: "Pink floral collar top from Elite Kidz", tags: ["Girls", "Tops", "Pink", "X5010"]
  },
  {
    id: "embroidered-flower-shorts-x5011", slug: "embroidered-flower-shorts-x5011", itemNumber: "X5011", name: "Embroidered Flower Shorts", collection: "Current edit", category: "Girls", type: "Shorts", colour: "Natural ivory", status: "Current edit", sizes: ["120cm"],
    description: "Light ivory shorts finished with delicate embroidered flowers and a softly tailored shape.", detail: "PDF catalog piece X5011 in beige. The supplied stock sheet shows availability for 120cm; final confirmation is on WhatsApp.", images: ["/assets/products/pdf-5011/product.jpg"], alt: "Ivory embroidered flower shorts from Elite Kidz", tags: ["Girls", "Shorts", "Ivory", "X5011"]
  },
  {
    id: "pink-floral-collar-dress-x5008", slug: "pink-floral-collar-dress-x5008", itemNumber: "X5008", name: "Pink Floral Collar Dress", collection: "Current edit", category: "Girls", type: "Dress", colour: "Pink", status: "Current edit", sizes: ["120cm", "130cm", "140cm"],
    description: "A charming pink floral dress with a rounded collar and a gently gathered silhouette.", detail: "PDF catalog piece X5008 in pink. The supplied stock sheet shows availability for 120cm, 130cm and 140cm; final confirmation is on WhatsApp.", images: ["/assets/products/pdf-5008/product.jpg"], alt: "Pink floral collar dress from Elite Kidz", tags: ["Girls", "Dresses", "Pink", "X5008"]
  },
  {
    id: "pink-ruffle-bib-dress-x5009", slug: "pink-ruffle-bib-dress-x5009", itemNumber: "X5009", name: "Pink Ruffle Bib Dress", collection: "Current edit", category: "Girls", type: "Dress", colour: "Pink", status: "Current edit", sizes: ["120cm", "130cm"],
    description: "A softly detailed pink floral dress with ruffle sleeves and a pretty bib-style collar.", detail: "PDF catalog piece X5009 in pink. The supplied stock sheet shows availability for 120cm and 130cm; final confirmation is on WhatsApp.", images: ["/assets/products/pdf-5009/product.jpg"], alt: "Pink floral ruffle bib dress from Elite Kidz", tags: ["Girls", "Dresses", "Pink", "X5009"]
  },
  {
    id: "ivory-floral-collar-dress-x5671", slug: "ivory-floral-collar-dress-x5671", itemNumber: "X5671", name: "Ivory Floral Collar Dress", collection: "Current edit", category: "Girls", type: "Dress", colour: "Natural ivory", status: "New arrival", featured: true, sizes: ["90cm", "100cm", "110cm", "120cm", "130cm", "140cm", "150cm"],
    description: "An airy ivory dress with a hand-finished floral collar, flutter sleeves and gentle movement.", detail: "Client-supplied piece X5671 in ivory. The source size chart runs from 90cm to 150cm; final stock and fit are confirmed on WhatsApp.", images: redIvoryImages([9, ...range(11, 17), ...range(52, 72)]), video: "/assets/products/red-ivory/collection.mp4", videoLabel: "See the collection in motion", alt: "Ivory floral collar dress from the Elite Kidz collection", tags: ["Girls", "Dresses", "Ivory", "X5671"]
  },
  {
    id: "ivory-embroidered-top-x5396", slug: "ivory-embroidered-top-x5396", itemNumber: "X5396", name: "Ivory Embroidered Top", collection: "Current edit", category: "Girls", type: "Top", colour: "Natural ivory", status: "New arrival", sizes: ["90cm", "100cm", "110cm", "120cm", "130cm", "140cm", "150cm"],
    description: "A breezy sleeveless top with floral embroidery and a soft, easy drape.", detail: "Client-supplied piece X5396 in ivory. The source size chart runs from 90cm to 150cm; final stock and fit are confirmed on WhatsApp.", images: redIvoryImages([8, ...range(11, 17), ...range(18, 31), ...range(73, 79)]), video: "/assets/products/red-ivory/collection.mp4", videoLabel: "See the collection in motion", alt: "Ivory embroidered top from the Elite Kidz collection", tags: ["Girls", "Tops", "Ivory", "X5396"]
  },
  {
    id: "red-ruffle-dress-x5672", slug: "red-ruffle-dress-x5672", itemNumber: "X5672", name: "Red Ruffle Collar Dress", collection: "Current edit", category: "Girls", type: "Dress", colour: "Pomegranate red", status: "New arrival", featured: true, sizes: ["90cm", "100cm", "110cm", "120cm", "130cm", "140cm", "150cm"],
    description: "A joyful red cotton dress with a floral collar, flutter sleeves and softly gathered tiers.", detail: "Client-supplied piece X5672 in red. The source size chart runs from 90cm to 150cm; final stock and fit are confirmed on WhatsApp.", images: redIvoryImages([7, ...range(11, 17), ...range(32, 51)]), video: "/assets/products/red-ivory/collection.mp4", videoLabel: "See the collection in motion", alt: "Red ruffle collar dress from the Elite Kidz collection", tags: ["Girls", "Dresses", "Red", "X5672"]
  },
  {
    id: "ivory-floral-wide-leg-pants-x5673", slug: "ivory-floral-wide-leg-pants-x5673", itemNumber: "X5673", name: "Ivory Floral Wide-Leg Pants", collection: "Current edit", category: "Girls", type: "Trousers", colour: "Natural ivory", status: "New arrival", sizes: ["90cm", "100cm", "110cm", "120cm", "130cm", "140cm", "150cm"],
    description: "Light, wide-leg cotton pants with tiny floral embroidery and an easy shape made for movement.", detail: "Client-supplied piece X5673 in ivory. The source size chart runs from 90cm to 150cm; final stock and fit are confirmed on WhatsApp.", images: redIvoryImages([10, ...range(11, 17), ...range(18, 31), ...range(73, 79)]), video: "/assets/products/red-ivory/collection.mp4", videoLabel: "See the collection in motion", alt: "Ivory floral wide-leg pants from the Elite Kidz collection", tags: ["Girls", "Trousers", "Ivory", "X5673"]
  },
  {
    id: "sage-tulip-dress-x5014", slug: "sage-tulip-dress-x5014", itemNumber: "X5014", name: "Sage Tulip Dress", collection: "Current edit", category: "Girls", type: "Dress", colour: "Sage green", status: "Current edit", featured: true, sizes: ["2Y", "3Y", "4Y", "5Y"],
    description: "A softly gathered sage dress with appliqué tulips, wide shoulder straps and a ruffled hem.", detail: "PDF catalog piece X5014 in beige/sage. Final stock and fit are confirmed directly on WhatsApp before ordering.", images: ["/assets/products/sage-dress/detail.jpg", "/assets/products/sage-dress/detail-2.jpg", "/assets/products/sage-dress/detail-3.jpg", "/assets/products/sage-dress/detail-4.jpg"], video: "/assets/products/sage-dress/product.mp4", alt: "Sage green tulip appliqué dress from Elite Kidz", tags: ["Girls", "Dresses", "Sage", "X5014"]
  },
  ...newProducts
];

export function getProduct(slug) {
  return products.find((product) => product.slug === slug);
}
