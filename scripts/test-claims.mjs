// Marketing copy must not outrun the product.
//
// Every rule below exists because a false claim was actually live on this site.
// The failure mode is always the same: a page states an absolute ("no in-app
// purchases", "data never leaves your device") that was true when written and
// quietly became false, or was never true for one app in the portfolio. Schema
// and link tests cannot catch this, because the markup is perfectly valid — the
// sentence is just untrue.
//
// GROUND TRUTH (verified 2026-08-01 against each app's source; re-verify before
// relaxing any rule, and update the date):
//
//   Folio      free core. Folio Plus = monthly subscription OR one-time lifetime
//              (folio_plus_monthly / folio_plus_lifetime[_v2]). Optional Google
//              Drive/iCloud backup chosen by the user. Notebook content goes
//              only to that personal account, never a Folio/PurposeLab server.
//              Play + App Store.
//   Hushly     free, no subscription, optional ONE-TIME premium_unlock and
//              supporter_unlock (BillingClient ProductType.INAPP).
//   WaterWise  genuinely free. No billing dependency, no purchase code at all.
//   BP Log     no monetization code TODAY, but docs/monetization.md plans a
//              one-time Pro (Rs 149) in Phase 2. So "free forever" is a promise
//              the roadmap already intends to break.
//   Crumbs     NOT on-device. Cloudflare Worker + D1, keyed on the user's
//              WhatsApp number. Sends message content to Google Gemini, images
//              to Cloudflare AI, messaging via Meta. Paid Pro/Max via Razorpay
//              (30-day, non-renewing). Free tier capped at 50 crumbs/month.
//   All four native apps ship Firebase Analytics + Crashlytics, so "no data
//   collection" is false everywhere, even where entries stay on the device.
//
// Rules are matched per SENTENCE of visible text, so a nearby qualifying clause
// in the same sentence can legitimately exempt a claim via `unless`.
import { readFileSync, readdirSync } from 'node:fs';

const SKIP = /(^|\/)\.|^(go|docs|node_modules)\//;

// /go/* is deliberately excluded above: those are redirect stubs backing links
// that are already circulating publicly, and must not be edited for copy.

const files = readdirSync('.', { recursive: true })
  .filter((f) => typeof f === 'string' && (f.endsWith('.html') || f === 'llms.txt'))
  .filter((f) => SKIP.test(f) === false);

// Pages that speak for the whole studio rather than one app. A blanket claim
// here has to hold for every product, including Crumbs.
const STUDIO_WIDE = /^(index\.html|llms\.txt|about\/|support\/|apps\/)/;

// A sentence that names one app, or one app's data, is making a scoped claim and
// is judged against that app, not the portfolio. "Your readings never leave your
// phone" on the BP Log card is true and must not trip the studio-wide rules.
const APP_SCOPED = /\b(folio|crumbs|waterwise|water ?wise|bp ?log|blood pressure|hushly|readings?|journal|entries|health data|hydration|sleep sounds)\b/i;

const RULES = [
  {
    id: 'blanket-on-device',
    scope: STUDIO_WIDE,
    // Only fires on a portfolio-level subject ("our apps", "every app", "all data").
    pattern: /\b(our|all|every|each)\s+(the\s+)?apps?\b[^.]{0,70}\b(never leaves?|stays? on|keeps? .{0,20}on|lives? on|remains? on)\b|\b(all your data|your data)\s+(stays? on|never leaves?)\b/i,
    unless: new RegExp(`crumbs|except|${APP_SCOPED.source}`, 'i'),
    why: 'Crumbs stores content server-side, so a studio-wide on-device claim is false unless it names the exception.',
  },
  {
    id: 'no-data-collection',
    pattern: /\bno data collection\b|\bdo not collect,? (store,? )?(or sell )?any personal data\b/i,
    why: 'Folio, WaterWise, BP Log and Hushly all ship Firebase Analytics/Crashlytics.',
  },
  {
    id: 'no-iap-for-apps-that-have-it',
    // Scoped by SUBJECT, not filename: a false claim about Folio is just as bad
    // on support/ or index.html as it is on folio/.
    subject: /folio|hushly|crumbs/i,
    pattern: /\bno (in-app purchases?|iap)\b/i,
    why: 'Folio (Plus), Hushly (premium_unlock) and Crumbs (Razorpay Pro/Max) all have paid tiers.',
  },
  {
    id: 'blanket-never-subscription',
    scope: STUDIO_WIDE,
    // Portfolio-level promise only. "No subscription. Hushly is free…" is scoped
    // and true, as is "no subscription for core use".
    pattern: /\b(never|no)\b[^.]{0,30}\bsubscriptions?\b/i,
    unless: new RegExp(`core|mandatory|folio plus|monthly|recurring|${APP_SCOPED.source}`, 'i'),
    why: 'Folio Plus has a monthly subscription tier, so a studio-wide "never a subscription" is false.',
  },
  {
    id: 'bplog-free-forever',
    subject: /bp ?log|blood pressure/i,
    pattern: /\b(free forever|always remain free|always be free|forever free)\b/i,
    why: 'BP Log plans a one-time Pro in Phase 2 (docs/monetization.md); "forever" is already contradicted.',
  },
  {
    id: 'crumbs-overclaim',
    subject: /crumbs/i,
    pattern: /\bend-to-end encrypted\b|\bno third part(y|ies) trains?\b|\bnever leaves your (device|phone)\b/i,
    why: 'Crumbs content goes to Gemini and Cloudflare, and WhatsApp business chats are not E2E encrypted.',
  },
  {
    id: 'folio-absolute-no-cloud',
    // folio/diary is a paper notebook and folio/try is a local browser demo:
    // both genuinely have no cloud, so they are out of scope on purpose.
    scope: /^(folio\/index\.html|index\.html|support\/)/,
    pattern: /\bno cloud\b(?![^.]{0,60}\b(unless|optional|switch on|choose)\b)/i,
    // The other four products genuinely have no cloud, and support/ mixes all
    // of their FAQs into one page, so a sentence naming one of them is fine.
    unless: /bp ?log|hushly|water ?wise|paper|diary/i,
    why: 'Folio ships optional Google Drive backup (google_sign_in + googleapis), so "no cloud" needs qualifying.',
  },
  {
    id: 'folio-absolute-on-device',
    scope: /^(folio\/index\.html|best-free-journal-app\/|index\.html|support\/)/,
    pattern: /\b(folio|entries|journal|pages|words|what you (write|record))\b[^.]{0,100}\b(never uploaded|never leaves?|stays? on (your|this|the) (device|phone)|everything stays on (your|this|the) (device|phone))\b/i,
    unless: /\b(by default|unless|optional|backup|export|share|choose|switch on)\b/i,
    why: 'Folio keeps notebook content local by default, but explicit backup can copy it to the user’s personal Google Drive or iCloud account.',
  },
];

const visibleText = (html, file) => {
  if (file.endsWith('.txt')) return html;
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ');
};

// JSON-LD is checked too: an answer that only exists in schema is still quoted
// by search and AI surfaces, so a false claim there is just as public.
const schemaText = (html) => {
  const out = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    out.push(m[1].replace(/\s+/g, ' '));
  }
  return out.join(' ');
};

let checked = 0;
const fails = [];

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const haystack = `${visibleText(html, file)} ${schemaText(html)}`;
  const sentences = haystack.split(/(?<=[.!?])\s+|\n+/);

  for (const rule of RULES) {
    if (rule.scope && rule.scope.test(file) === false) continue;
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      checked++;
      if (rule.pattern.test(sentence) === false) continue;
      // Scope is often set by the neighbouring sentence: an FAQ answer reads
      // "No subscription. Hushly is free to use...", and the heading above a
      // claim frequently names the app. Judge scope and exemption on that window.
      const context = sentences.slice(Math.max(0, i - 1), i + 2).join(' ');
      // A subject-scoped rule applies when the copy is talking about that app,
      // wherever it lives. Filename is only a fallback hint.
      if (rule.subject && !rule.subject.test(context) && !rule.subject.test(file)) continue;
      if (rule.unless && rule.unless.test(context)) continue;
      fails.push(`${file} :: [${rule.id}] ${sentence.trim().slice(0, 130)}\n        why: ${rule.why}`);
    }
  }
}

for (const f of fails) console.log(`FAIL  claim not supported by the product: ${f}`);

// SELF-TEST. A rule table that quietly stops matching is worse than no gate at
// all, because it reports success forever. Each string below is a claim that was
// genuinely live on this site and genuinely false; the matcher must still catch
// every one of them, and must not flag the true statements underneath.
const MUST_CATCH = [
  'All our apps keep your data on your device.',
  'BP Log is free forever.',
  'Folio is free with no in-app purchases.',
  'Crumbs is end-to-end encrypted.',
  'Hushly is 100% free with no ads, no subscriptions, and no in-app purchases.',
  'Your data stays on your device. We do not collect, store, or sell any personal data.',
  'Folio stores everything locally. There is no cloud.',
  'Folio works offline. Your entries stay on your phone and are never uploaded anywhere.',
];
const MUST_PASS = [
  'WaterWise is free with no in-app purchases at all.',
  'No subscription. Hushly is free to use, and the optional Premium unlock is one-time.',
  'Folio keeps entries on your device, with no cloud unless you switch on backup.',
  'By default, Folio keeps entries on your device. Backup copies them only to the personal Google Drive or iCloud account you choose.',
  'BP Log has no ads and nothing to buy inside it today.',
];

const catches = (text) =>
  RULES.some((r) => {
    if (r.pattern.test(text) === false) return false;
    if (r.subject && !r.subject.test(text)) return false;
    if (r.unless && r.unless.test(text)) return false;
    return true;
  });

const missed = MUST_CATCH.filter((s) => !catches(s));
const overCaught = MUST_PASS.filter((s) => catches(s));
for (const s of missed) console.log(`FAIL  self-test: a known-false claim is no longer caught: "${s}"`);
for (const s of overCaught) console.log(`FAIL  self-test: a true statement is being flagged: "${s}"`);

console.log(`\nclaims: ${files.length} pages · ${checked} sentence checks · ${fails.length} FAIL · self-test ${MUST_CATCH.length - missed.length}/${MUST_CATCH.length} caught, ${MUST_PASS.length - overCaught.length}/${MUST_PASS.length} allowed`);

if (files.length === 0) {
  console.log('FAIL  no pages scanned — the gate verified nothing');
  process.exit(1);
}
if (fails.length || missed.length || overCaught.length) process.exit(1);
