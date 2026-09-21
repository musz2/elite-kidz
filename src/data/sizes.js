// The Elite Kidz size scale.
//
// Every piece in the catalog is sold on one age scale. The supplied supplier
// charts label their rows by age band ("1-2Y"), while the stock sheets label the
// same garments by body height in centimetres ("90cm"). They are the same scale:
// 2Y is the 90cm height, 3Y is 100cm, and so on up to 8Y at 150cm.
//
// `key` is what is stored in the bag and sent to WhatsApp. `height` is the child's
// body height the size is cut for — the centimetre figure shoppers ask for.
export const sizeScale = [
  { key: "2Y", age: "1–2 years", band: "1-2Y", height: 90 },
  { key: "3Y", age: "2–3 years", band: "2-3Y", height: 100 },
  { key: "4Y", age: "3–4 years", band: "3-4Y", height: 110 },
  { key: "5Y", age: "4–5 years", band: "4-5Y", height: 120 },
  { key: "6Y", age: "5–6 years", band: "5-6Y", height: 130 },
  { key: "7Y", age: "6–7 years", band: "6-7Y", height: 140 },
  { key: "8Y", age: "7–8 years", band: "7-8Y", height: 150 }
];

export const allSizes = sizeScale.map((size) => size.key);
const byKey = new Map(sizeScale.map((size) => [size.key, size]));

export function sizeInfo(key) {
  return byKey.get(key);
}

/** "5Y" → "120cm" — the centimetre label for a size key. */
export function sizeHeight(key) {
  const size = byKey.get(key);
  return size ? `${size.height}cm` : "";
}

/** "5Y" → "5Y (120cm)" — used in the bag and the WhatsApp enquiry. */
export function formatSize(key) {
  const size = byKey.get(key);
  return size ? `${size.key} · ${size.height}cm` : key;
}

/** Sort a product's sizes into scale order, dropping anything unrecognised. */
export function orderSizes(keys) {
  return allSizes.filter((key) => keys.includes(key));
}

// Garment measurements exactly as printed on the supplier size sheets supplied by
// the client. Values are centimetres, in scale order (2Y first). A `null` column
// value is a measurement the sheet does not give for that style.
// Source: /assets/products/client-september/photo-054.jpg and photo-110.jpg
const chart = (columns, rows) => ({ columns, rows });

export const measurementCharts = {
  LX0063: chart(["Length", "½ chest", "Shoulder"], [
    [32, 28.5, 20.4],
    [35, 29.5, 21.6],
    [38, 30.5, 22.8],
    [41, 32, 24],
    [44, 33.5, 25.2],
    [47, 35, 26.4],
    [50, 36.5, 27.6]
  ]),
  X5014: chart(["Length", "½ chest", "Shoulder"], [
    [46.5, 27, 21],
    [52, 28, 22],
    [57.5, 30, 23.5],
    [63, 32, 25],
    [68.5, 34, 26.5],
    [74, 36, 28],
    [79.5, 38, 29.5]
  ]),
  X5013: chart(["Length", "½ waist", "½ hip"], [
    [39.5, 21, 35],
    [44, 21.5, 37],
    [48.5, 22, 39],
    [54, 23, 41],
    [59.5, 24, 43],
    [65, 25.5, 45],
    [70.5, 26.5, 47]
  ]),
  X5008: chart(["Length", "½ chest", "Shoulder", "Sleeve"], [
    [44.5, 28.5, 19.5, 15],
    [49.5, 30.5, 21, 16],
    [54.5, 32.5, 22.5, 17],
    [59.5, 34.5, 24, 18],
    [64.5, 36.5, 25.5, 19],
    [69.5, 38.5, 27, 20],
    [74.5, 40.5, 28.5, 21]
  ]),
  X5009: chart(["Length", "½ chest", "Shoulder"], [
    [46, 27.5, 17.3],
    [51, 29.5, 18.2],
    [56, 31.5, 19.1],
    [61, 33.5, 20],
    [66, 35.5, 20.9],
    [71, 37.5, 21.8],
    [76, 39.5, 22.7]
  ]),
  X5010: chart(["Length", "½ chest", "Shoulder", "Sleeve"], [
    [32, 35.5, 21.9, 16.6],
    [35, 37.5, 23.6, 17.4],
    [38, 39.5, 25.3, 18.2],
    [41, 41.5, 27, 19],
    [44, 43.5, 28.7, 19.8],
    [47, 45.5, 30.4, 20.6],
    [50, 47.5, 32.1, 21.4]
  ]),
  X5011: chart(["Length", "½ waist", "½ hip"], [
    [21, 21, 34],
    [22, 21.5, 36],
    [23, 22, 38],
    [24, 23, 40],
    [25, 24.5, 42],
    [26, 25.5, 44],
    [27, 26.5, 46]
  ])
};

export function measurementsFor(itemNumber) {
  return measurementCharts[itemNumber] || null;
}
