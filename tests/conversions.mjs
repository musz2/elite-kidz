// Google Ads conversion tracking, checked against the real Google tag in a browser.
//   npm run build && npm start   (in another terminal)
//   node tests/conversions.mjs   (needs internet; set PLAYWRIGHT_MODULE / CHROMIUM_EXECUTABLE if needed)
//   BLOCK_CONVERSIONS=1 TEST_ORIGIN=https://elitekidzs.com node tests/conversions.mjs
//     checks the live site without sending test conversions to Google Ads: the browser
//     cannot resolve Google's measurement hosts (the tag itself still loads), so requests
//     are counted as the page makes them but never arrive.
//
// Google sends each conversion event to several endpoints (googleadservices, doubleclick,
// google.com, google.co.in), so a conversion is counted twice over: the primary hit to
// googleadservices.com/pagead/conversion/ carrying the label, and the gtag conversion event
// in the page's dataLayer. Checks, on desktop and on a touch phone: page loads and navigation
// send none; every WhatsApp entry point sends exactly one Outbound click conversion and still
// opens WhatsApp at once with the right message; every phone link sends exactly one Click to
// call conversion and still dials.
import assert from "node:assert/strict";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "/opt/homebrew/lib/node_modules/playwright/index.mjs");
// Beacons cannot be intercepted by page.route, so blocking is done at name resolution.
const BLOCKED_HOSTS = ["www.googleadservices.com", "googleads.g.doubleclick.net", "www.google.com", "www.google.co.in"];
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}),
  ...(process.env.BLOCK_CONVERSIONS ? { args: [`--host-resolver-rules=${BLOCKED_HOSTS.map((host) => `MAP ${host} ~NOTFOUND`).join(", ")}`] } : {})
});
const origin = process.env.TEST_ORIGIN || "http://localhost:3000";
const LABELS = { whatsapp: "ZF84CJzg9pgdEJzS1vhE", call: "lFZgCNrW9ZgdEJzS1vhE" };
const WHATSAPP = "https://wa.me/917702426007";
const results = [];

async function open(context) {
  const page = await context.newPage();
  const hits = { whatsapp: 0, call: 0, tagLoads: 0, configHits: 0 };
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !(process.env.BLOCK_CONVERSIONS && /ERR_NAME_NOT_RESOLVED/.test(m.text()))) errors.push(m.text()); });
  if (process.env.BLOCK_CONVERSIONS) page.on("requestfinished", (request) => { if (BLOCKED_HOSTS.includes(new URL(request.url()).hostname)) errors.push(`reached Google: ${request.url().slice(0, 80)}`); });
  page.on("request", (request) => {
    const payload = request.url() + " " + (request.postData() || "");
    const primary = request.url().startsWith("https://www.googleadservices.com/pagead/conversion/18506688796/");
    if (primary && payload.includes(LABELS.whatsapp)) hits.whatsapp += 1;
    if (primary && payload.includes(LABELS.call)) hits.call += 1;
    if (request.url().startsWith("https://www.googletagmanager.com/gtag/js?id=AW-18506688796")) hits.tagLoads += 1;
    if (/18506688796/.test(payload) && !payload.includes(LABELS.whatsapp) && !payload.includes(LABELS.call) && !request.url().includes("gtag/js")) hits.configHits += 1;
  });
  // Stand-ins for leaving the page. WhatsApp buttons call window.open: record it. WhatsApp
  // and phone links: record each click as it reaches the document, and whether the site
  // blocked it, then stop the browser actually leaving.
  await page.addInitScript(() => {
    window.__opened = [];
    window.open = (url) => { window.__opened.push(url); return null; };
    window.__links = [];
    document.addEventListener("click", (event) => {
      const link = event.target.closest?.('a[href^="tel:"], a[href^="https://wa.me/"]');
      if (!link) return;
      window.__links.push({ href: link.getAttribute("href"), blocked: event.defaultPrevented });
      event.preventDefault();
    });
  });
  return { page, hits, errors };
}

const settle = (page) => page.waitForTimeout(1200);
const go = async (page, route) => { await page.goto(origin + "/#/" + route); await page.locator("main").waitFor(); };
// gtag conversion events in the page's dataLayer since the last full page load.
const events = (page) => page.evaluate(([wa, call]) => {
  const sent = (window.dataLayer || []).filter((a) => a[0] === "event" && a[1] === "conversion").map((a) => a[2].send_to);
  return { whatsapp: sent.filter((s) => s.endsWith(wa)).length, call: sent.filter((s) => s.endsWith(call)).length, total: sent.length };
}, [LABELS.whatsapp, LABELS.call]);

// Every WhatsApp entry point on the site: where it is, how to reach it, and what it must send.
const WHATSAPP_ENTRIES = [
  { name: "Ask Price button (product page)", route: "product/red-ruffle-dress-x5672", prepare: (p) => p.getByRole("button", { name: "Size 3Y, for a height of 100cm", exact: true }).click(), target: (p) => p.getByRole("button", { name: "Ask Price", exact: true }), message: /Red Ruffle Collar Dress[\s\S]*Style: X5672[\s\S]*Size: 3Y · 100cm[\s\S]*Qty: 1[\s\S]*Price: ₹899/ },
  // The site's phone layout hides this icon below 600px (premium.css), so phones skip it.
  { name: "Product card WhatsApp icon", route: "shop", minWidth: 601, target: (p) => p.getByRole("button", { name: "Ask about Pink Floral Collar Top on WhatsApp", exact: true }), message: /Pink Floral Collar Top[\s\S]*Style: X5010[\s\S]*Size: To confirm on WhatsApp/ },
  { name: "Shopping bag “Enquire on WhatsApp”", route: "product/sage-babydoll-blouse-lx0063", prepare: async (p) => { await p.getByRole("button", { name: "Size 2Y, for a height of 90cm", exact: true }).click(); await p.getByRole("button", { name: "Add to bag", exact: true }).click(); }, target: (p) => p.getByRole("button", { name: "Enquire on WhatsApp" }), message: /Sage Sleeveless Babydoll Blouse[\s\S]*Size: 2Y · 90cm[\s\S]*Price: ₹599/, after: async (p) => { await p.keyboard.press("Escape"); await p.evaluate(() => localStorage.removeItem("elite-kidz-cart")); } },
  { name: "Floating “Ask Elite Kidz” button", route: "", target: (p) => p.locator(".whatsapp-launcher") },
  // The ticker scrolls continuously and repeats its links: click whichever copy is on screen,
  // without waiting for it to stand still.
  { name: "Ticker “WhatsApp ordering”", route: "", moving: true, target: async (p) => {
    const links = p.locator('.ticker a[href^="https://wa.me/"]');
    const onScreen = await links.evaluateAll((all) => all.findIndex((a) => { const r = a.getBoundingClientRect(); return r.left > 20 && r.right < innerWidth - 20; }));
    return links.nth(onScreen);
  } },
  { name: "Home “Let’s chat”", route: "", target: (p) => p.locator(".personal-shopping").getByRole("link", { name: /Let’s chat/ }) },
  { name: "Footer “WhatsApp ordering”", route: "shop", target: (p) => p.locator('footer a[href^="https://wa.me/"]') },
  { name: "About “Talk to Elite Kidz”", route: "about", target: (p) => p.locator("main").getByRole("link", { name: /Talk to Elite Kidz/ }) },
  { name: "Contact WhatsApp card", route: "contact", target: (p) => p.locator('main a.contact-action[href^="https://wa.me/"]') },
  { name: "FAQ “Ask on WhatsApp”", route: "faq", target: (p) => p.locator("main").getByRole("link", { name: /Ask on WhatsApp/ }) },
  { name: "Size guide “Ask about sizing”", route: "size-guide", target: (p) => p.locator("main").getByRole("link", { name: /Ask about sizing/ }) },
  { name: "Shipping & returns “Chat with Elite Kidz”", route: "shipping-returns", target: (p) => p.locator("main").getByRole("link", { name: /Chat with Elite Kidz/ }) },
  { name: "Not-found page WhatsApp link", route: "missing-route", target: (p) => p.locator("main").getByRole("link", { name: /Ask Elite Kidz on WhatsApp/ }) }
];
const CALL_ENTRIES = [
  { name: "Contact page Call", route: "contact", target: (p) => p.locator('main a.contact-action[href^="tel:"]') },
  { name: "Footer phone number", route: "shop", target: (p) => p.locator('footer a[href^="tel:"]') }
];

async function runDevice(label, context, press) {
  const { page, hits, errors } = await open(context);
  await go(page, "");
  await page.waitForFunction(() => window.google_tag_data, null, { timeout: 15000 });
  // Page loads and route changes: no conversions.
  for (const route of ["shop", "product/sage-tulip-dress-x5014", "contact", "about", "faq", "size-guide"]) await go(page, route);
  await page.reload(); await page.locator("main").waitFor(); await settle(page);
  assert.equal(await page.locator('script[src*="googletagmanager.com/gtag/js"]').count(), 1, `${label}: exactly one Google tag`);
  assert.ok(hits.tagLoads >= 1 && hits.configHits >= 1, `${label}: Google tag loads and configures AW-18506688796`);
  assert.deepEqual([hits.whatsapp, hits.call], [0, 0], `${label}: no conversion from page loads or navigation`);
  assert.deepEqual(await events(page), { whatsapp: 0, call: 0, total: 0 }, `${label}: no conversion events`);

  const expected = { whatsapp: 0, call: 0 };
  const width = page.viewportSize().width;
  const entries = WHATSAPP_ENTRIES.filter((entry) => !entry.minWidth || width >= entry.minWidth);
  for (const entry of entries) {
    await go(page, entry.route);
    await entry.prepare?.(page);
    const before = await page.evaluate(() => ({ opened: window.__opened.length, links: window.__links.length }));
    await press(await entry.target(page), entry.moving ? { force: true } : {});
    // WhatsApp must open during the click itself: checked before waiting for anything.
    const now = await page.evaluate(() => ({ opened: window.__opened.slice(-1)[0], openedCount: window.__opened.length, link: window.__links.slice(-1)[0], linkCount: window.__links.length }));
    const isButton = now.openedCount === before.opened + 1;
    assert.ok(isButton || now.linkCount === before.links + 1, `${label} · ${entry.name}: WhatsApp opens immediately`);
    if (isButton) assert.ok(decodeURIComponent(now.opened).startsWith(`${WHATSAPP}?text=Hi Elite Kidz`), `${label} · ${entry.name}: prefilled enquiry to Elite Kidz`);
    else assert.deepEqual(now.link, { href: WHATSAPP, blocked: false }, `${label} · ${entry.name}: link to Elite Kidz on WhatsApp, not blocked`);
    if (entry.message) assert.match(decodeURIComponent(now.opened), entry.message, `${label} · ${entry.name}: product, size, quantity and price in the message`);
    await settle(page);
    expected.whatsapp += 1;
    assert.deepEqual([hits.whatsapp, hits.call], [expected.whatsapp, expected.call], `${label} · ${entry.name}: exactly one Outbound click conversion, no call conversion`);
    await entry.after?.(page);
  }
  for (const entry of CALL_ENTRIES) {
    await go(page, entry.route);
    await press(await entry.target(page), {});
    assert.deepEqual(await page.evaluate(() => window.__links.slice(-1)[0]), { href: "tel:+917702426007", blocked: false }, `${label} · ${entry.name}: dials, not blocked`);
    await settle(page);
    expected.call += 1;
    assert.deepEqual([hits.whatsapp, hits.call], [expected.whatsapp, expected.call], `${label} · ${entry.name}: exactly one Click to call conversion, no WhatsApp conversion`);
  }
  // Hash routes are client-side navigation, so the dataLayer holds every event since the reload.
  assert.deepEqual(await events(page), { whatsapp: entries.length, call: CALL_ENTRIES.length, total: entries.length + CALL_ENTRIES.length }, `${label}: one event per click, nothing else`);
  assert.deepEqual(errors, [], `${label}: console errors`);
  results.push(`${label}: Google tag once; 7 loads/navigations → 0 conversions; ${entries.length} WhatsApp entry points → exactly 1 Outbound click each, opened immediately with the right destination and message; ${CALL_ENTRIES.length} phone links → exactly 1 Click to call each, dialling not blocked; no cross-counting; no console errors.`);
}

try {
  await runDevice("Desktop 1440px (mouse)", await browser.newContext({ viewport: { width: 1440, height: 1000 } }), (locator, options) => locator.click(options));
  await runDevice("Tablet 768px (touch)", await browser.newContext({ viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }), (locator, options) => locator.tap(options));
  await runDevice("Mobile 390px (touch)", await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }), (locator, options) => locator.tap(options));
  console.log(results.join("\n"));
} finally {
  await browser.close();
}
