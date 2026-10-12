// Google Ads conversions for account AW-18506688796 (the Google tag is in index.html).
//
// Google supplies one `gtag_report_conversion(url)` snippet per conversion action, and both
// use that same function name, so each action has its own function here instead. The
// snippets' `url`/event_callback redirect is not used:
// - WhatsApp opens in a new tab, which browsers only allow during the click itself, so it
//   cannot wait for Google's callback.
// - A tel: link opens the dialler without leaving the page.
// The hit is sent with the beacon transport, so it is delivered even when the browser
// switches to WhatsApp or the phone app straight away.
const WHATSAPP = "AW-18506688796/ZF84CJzg9pgdEJzS1vhE"; // "Outbound click" action
const CLICK_TO_CALL = "AW-18506688796/lFZgCNrW9ZgdEJzS1vhE"; // "Click to call" action

function reportConversion(sendTo) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", { send_to: sendTo, value: 1.0, currency: "INR", transport_type: "beacon" });
}

/** Any WhatsApp button or link was clicked: Ask Price, a product card, the bag, or a contact link. */
export const reportWhatsApp = () => reportConversion(WHATSAPP);

/** A telephone link was clicked. */
export const reportCall = () => reportConversion(CLICK_TO_CALL);
