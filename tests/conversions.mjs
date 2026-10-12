// Google Ads conversion tracking, checked against the real Google tag in a browser.
//   npm run build && npm start   (in another terminal)
//   node tests/conversions.mjs   (needs internet; set PLAYWRIGHT_MODULE / CHROMIUM_EXECUTABLE if needed)
//
// Google sends each conversion event to several endpoints (googleadservices, doubleclick,
// google.com, google.co.in), so a conversion is counted twice over: the primary hit to
// googleadservices.com/pagead/conversion/ carrying the label, and the gtag conversion event
// in the page's dataLayer. Checks: page loads and navigation send none; each interaction
// sends exactly one, of its own kind; the WhatsApp enquiry and the phone link still go through.
import assert from "node:assert/strict";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "/opt/homebrew/lib/node_modules/playwright/index.mjs");
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}) });
const origin = process.env.TEST_ORIGIN || "http://localhost:3000";
const LABELS = { askPrice: "ZF84CJzg9pgdEJzS1vhE", call: "lFZgCNrW9ZgdEJzS1vhE" };
const results = [];

async function open(context) {
  const page = await context.newPage();
  const hits = { askPrice: 0, call: 0, tagLoads: 0, configHits: 0 };
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("request", (request) => {
    const payload = request.url() + " " + (request.postData() || "");
    const primary = request.url().startsWith("https://www.googleadservices.com/pagead/conversion/18506688796/");
    if (primary && payload.includes(LABELS.askPrice)) hits.askPrice += 1;
    if (primary && payload.includes(LABELS.call)) hits.call += 1;
    if (request.url().startsWith("https://www.googletagmanager.com/gtag/js?id=AW-18506688796")) hits.tagLoads += 1;
    if (/18506688796/.test(payload) && !payload.includes(LABELS.askPrice) && !payload.includes(LABELS.call) && !request.url().includes("gtag/js")) hits.configHits += 1;
  });
  // Stand-ins for leaving the page: record WhatsApp windows; let tel: clicks reach the
  // document un-prevented (proving the site does not block the call), then stop the dialler.
  await page.addInitScript(() => {
    window.__opened = [];
    window.open = (url) => { window.__opened.push(url); return null; };
    window.__telClicks = [];
    document.addEventListener("click", (event) => {
      const link = event.target.closest?.('a[href^="tel:"]');
      if (!link) return;
      window.__telClicks.push({ href: link.getAttribute("href"), blocked: event.defaultPrevented });
      event.preventDefault();
    });
  });
  return { page, hits, errors };
}

const settle = (page) => page.waitForTimeout(1500);
// gtag conversion events in the page's dataLayer, by label: the page-side count.
const events = (page) => page.evaluate(([ask, call]) => {
  const sent = (window.dataLayer || []).filter((a) => a[0] === "event" && a[1] === "conversion").map((a) => a[2].send_to);
  return [sent.filter((s) => s.endsWith(ask)).length, sent.filter((s) => s.endsWith(call)).length, sent.length];
}, [LABELS.askPrice, LABELS.call]);
const go = async (page, route) => { await page.goto(origin + route); await page.locator("main").waitFor(); };

try {
  // ── Desktop ───────────────────────────────────────────────────────────────
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const { page, hits, errors } = await open(desktop);
  await go(page, "/#/");
  await page.waitForFunction(() => window.google_tag_data || (window.dataLayer || []).length > 2, null, { timeout: 15000 });
  for (const route of ["#/shop", "#/product/sage-tulip-dress-x5014", "#/contact", "#/about", "#/faq"]) {
    await page.evaluate((hash) => { window.location.hash = hash; }, route);
    await page.locator("main").waitFor();
    await page.waitForTimeout(300);
  }
  await page.reload(); await page.locator("main").waitFor(); await settle(page);
  assert.equal(await page.locator('script[src*="googletagmanager.com/gtag/js"]').count(), 1, "exactly one Google tag in the page");
  assert.ok(hits.tagLoads >= 1, "Google tag loaded");
  assert.ok(hits.configHits >= 1, "Google tag configured for AW-18506688796");
  assert.deepEqual([hits.askPrice, hits.call], [0, 0], "no conversion from page loads or navigation");
  assert.deepEqual(await events(page), [0, 0, 0], "no conversion events in the dataLayer");
  results.push(`Google tag: one per page, loads and configures AW-18506688796; 7 page loads/navigations sent 0 conversions.`);

  // Ask Price on a product page → one Outbound click conversion, WhatsApp still opens.
  await go(page, "/#/product/red-ruffle-dress-x5672");
  await page.getByRole("button", { name: "Size 3Y, for a height of 100cm", exact: true }).click();
  await page.getByRole("button", { name: "Ask about this piece", exact: true }).click();
  await settle(page);
  assert.deepEqual([hits.askPrice, hits.call], [1, 0], "Ask Price sends exactly one Outbound click conversion");
  assert.deepEqual(await events(page), [1, 0, 1], "one Outbound click conversion event");
  const opened = await page.evaluate(() => window.__opened);
  assert.equal(opened.length, 1); assert.match(decodeURIComponent(opened[0]), /^https:\/\/wa\.me\/917702426007\?text=[\s\S]*Red Ruffle Collar Dress[\s\S]*Size: 3Y · 100cm/);
  results.push("Ask Price (product page): exactly 1 Outbound click conversion; WhatsApp enquiry still opens with product and size.");

  // Other WhatsApp buttons are not the Ask Price button: no conversion.
  await go(page, "/#/shop");
  await page.locator(".product-card .mini-whatsapp").first().click();
  await page.locator(".whatsapp-launcher").evaluate((a) => a.addEventListener("click", (e) => e.preventDefault(), { once: true }));
  await page.locator(".whatsapp-launcher").click();
  await settle(page);
  assert.deepEqual([hits.askPrice, hits.call], [1, 0], "other WhatsApp buttons send no conversion");

  // Click to call, from the contact page and from the footer.
  await go(page, "/#/contact");
  await page.locator('main a.contact-action[href^="tel:"]').click();
  await settle(page);
  assert.deepEqual([hits.askPrice, hits.call], [1, 1], "contact-page Call sends exactly one Click to call conversion");
  await page.locator('footer a[href^="tel:"]').click();
  await settle(page);
  assert.deepEqual([hits.askPrice, hits.call], [1, 2], "footer phone link sends exactly one Click to call conversion");
  // Hash routes are client-side navigation, so the dataLayer has kept every event since the reload.
  assert.deepEqual(await events(page), [1, 2, 3], "1 Outbound click + 2 Click to call events, nothing else");
  const tel = await page.evaluate(() => window.__telClicks);
  assert.deepEqual(tel, [{ href: "tel:+917702426007", blocked: false }, { href: "tel:+917702426007", blocked: false }], "phone links are not blocked");
  results.push("Click to call (contact page + footer): exactly 1 Click to call conversion each; the tel: link is not blocked. Other WhatsApp buttons: 0 conversions.");
  assert.deepEqual(errors, [], "desktop console errors");

  // ── Mobile, touch ─────────────────────────────────────────────────────────
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const m = await open(phone);
  await go(m.page, "/#/product/ivory-tulip-dress-x5014"); await settle(m.page);
  assert.deepEqual([m.hits.askPrice, m.hits.call], [0, 0], "mobile: no conversion on load");
  await m.page.getByRole("button", { name: "Ask about this piece", exact: true }).tap();
  await settle(m.page);
  await m.page.getByRole("button", { name: "Open menu", exact: true }).tap();
  await m.page.locator(".main-nav").getByRole("link", { name: "Contact", exact: true }).tap();
  await m.page.locator(".contact-grid").waitFor();
  await m.page.locator('main a.contact-action[href^="tel:"]').tap();
  await settle(m.page);
  assert.deepEqual([m.hits.askPrice, m.hits.call], [1, 1], "mobile: one of each after tapping Ask Price and Call");
  assert.equal((await m.page.evaluate(() => window.__opened)).length, 1);
  assert.deepEqual(m.errors, [], "mobile console errors");
  results.push("Mobile (touch, client-side navigation via the menu): no conversion on load; Ask Price and Call each send exactly 1.");

  console.log(results.join("\n"));
} finally {
  await browser.close();
}
