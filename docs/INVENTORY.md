# Inventory integration — 18 September 2026

Source: `/Users/mustafa/Downloads/itms` (112 client photos and 4 videos).

The original 13 catalog records remain unchanged. Three distinct pieces were added; the store now has 16 products. No prices, stock counts, discounts, reviews, brands, or categories were invented.

| Added product | Supplied style | Supplied size labels | Source evidence |
|---|---|---|---|
| Sage Sleeveless Babydoll Blouse | LX0063 | 1-2Y through 7-8Y | `00.44.17.jpeg` detail sheet; `00.44.19.jpeg` size chart |
| Ivory Tulip Pants | X5013 | 1-2Y through 7-8Y | Same detail sheet and size chart |
| Ivory Tulip Dress | X5014 | 1-2Y through 7-8Y | Same detail sheet and size chart |

The ivory X5014 is a distinct colourway of the existing sage dress. Both retain separate product IDs and routes. Names describe the photographed garments; no unsupplied marketing descriptions were added. Material fields come from the supplied cotton/jacquard and lining sheets.

The existing stock-sheet size selections for X5008, X5009, X5010, X5011, and the sage X5014 were preserved. The newly supplied general size charts do not establish live availability. New size selectors likewise state that availability requires confirmation.

Additional verified photography enriches the existing Sage Tulip Dress, Pink Floral Collar Top, Embroidered Flower Shorts, Pink Floral Collar Dress, and Pink Ruffle Bib Dress. Original gallery arrays and original files were retained. Presentation-only selection in `src/media.js` excludes unrelated red/ivory images from individual galleries, including a red dress incorrectly included in the ivory dress’s old gallery. Group images and unrelated detail crops are not used as product alternatives.

`asset-provenance.json` maps imported filenames to local assets and product assignments. Used originals are copied byte-for-byte. The gallery uses the original JPEGs; 160/480/960px WebP derivatives serve thumbnails and listings without enlarging the source. The supplied tulip film is attached to the ivory tulip dress, and the pink film to the pink collar dress. Existing genuine films remain available. Other supplied films overlap existing collection footage and do not create new product records.

Orders remain WhatsApp enquiries. There is no price or live inventory backend in the existing project. The bag therefore shows “Price on enquiry” instead of fabricating a subtotal or a checkout payment flow.
