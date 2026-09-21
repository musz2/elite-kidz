# Storefront verification

Run locally with `npm run dev`. Build with `npm run build`. The production server supports `PORT=4187 NODE_ENV=production node server.mjs`.

Browser checks live in `tests/storefront.mjs`. They use an installed Playwright/Chromium rather than adding browser dependencies to the storefront. Set `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE` to your installation; set `TEST_ORIGIN` to the running server. Example: `TEST_ORIGIN=http://localhost:4187 node tests/storefront.mjs` on the current workspace.

Verified in rendered Chromium desktop and touch emulation:

- All 16 product routes, home, shop, about, contact, FAQ, size guide, shipping/returns and not-found routes.
- Original 13 product records are byte-equivalent after serialization to the audit snapshot. Three client-sourced additions; all images and responsive derivatives exist.
- Magnifier at every corner and centre, plus continuous diagonal sweeps: 4 real image shapes at 1440, 1280 and 1024px. Exact lens-to-preview coordinates, image-boundary clamping, original-resolution cap, exit, thumbnail switching, route navigation and resize.
- Touch gallery expansion, explicit zoom, native touch panning, image navigation, close and no desktop lens.
- Seven widths: 1440, 1280, 1024, 768, 430, 390, 375px. No horizontal overflow in primary shopping surfaces.
- Search by style code, combined type/size/colour filters, empty results and reset.
- Real size selection, all three new products via quick add, bag quantities/removal/persistence, modal focus cycling/Escape, and WhatsApp enquiry contents. No message was sent.
- Reduced-motion behaviour. No unexpected browser console errors or uncaught exceptions.
- Screenshots reviewed for homepage, listing, PDP, zoom corners, mobile gallery, mobile search and bag. Local evidence and machine-readable results are in ignored `work/qa/`.

The store still confirms prices, availability and delivery personally on WhatsApp; there is no invented checkout payment or live stock system. The floating help control links directly to the real WhatsApp contact. The site ships no AI assistant and calls no third-party model API.

Image derivatives are committed. To regenerate after adding genuine photos, install/use Sharp and run `node scripts/image-previews.mjs` (`SHARP_MODULE` may point to an existing installation).

Changes are local; production deployment is a separate step. Touch testing uses browser emulation rather than a physical iPhone/Android device.
