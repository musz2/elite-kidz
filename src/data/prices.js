// Sale prices in rupees, as confirmed by Elite Kidz on WhatsApp. Every piece is
// 50% off, so the original price is always double the sale price. Pieces not
// listed here still show "Price on enquiry".
export const SALE_PERCENT = 50;

const salePrices = {
  "blue-gingham-dress-x4991": 899,
  "ivory-collar-blouse-x4992": 899,
  "blue-gingham-blouse-x4992": 899,
  "blue-gingham-pants-x4993": 899,
  "pink-floral-top-x5010": 599,
  "embroidered-flower-shorts-x5011": 499,
  "pink-floral-collar-dress-x5008": 899,
  "pink-ruffle-bib-dress-x5009": 899,
  "ivory-floral-collar-dress-x5671": 1499,
  "ivory-embroidered-top-x5396": 899,
  "red-ruffle-dress-x5672": 899,
  "ivory-floral-wide-leg-pants-x5673": 899,
  "sage-tulip-dress-x5014": 899,
  "sage-babydoll-blouse-lx0063": 599,
  "ivory-tulip-pants-x5013": 799,
  "ivory-tulip-dress-x5014": 899
};

export function priceFor(product) {
  const sale = product && salePrices[product.slug];
  if (!sale) return null;
  return { sale, original: Math.round(sale * 100 / (100 - SALE_PERCENT)) };
}

export const formatRupees = (amount) => `₹${amount.toLocaleString("en-IN")}`;
