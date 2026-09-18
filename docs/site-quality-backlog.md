# PurposeLab Studio site quality backlog

This document records validated website-quality work that is manual, deferred, or not appropriate
for the current site. It prevents generic checker recommendations from becoming unreviewed changes.

## Current platform decisions

- PurposeLab Studio is an online-only software studio serving people worldwide from India.
- Use `Organization` structured data. Do not publish a private address or phone number and do not
  add `LocalBusiness` markup.
- Keep the existing URLs, canonicals, app identifiers, and Folio-to-Zolio continuity.
- Keep GitHub Pages as the direct host until a dedicated infrastructure migration is approved.
- Keep the shared external stylesheet. It is small, cacheable, and easier to maintain than repeated
  inline CSS.
- Keep GoatCounter and the current privacy-scoped Clarity setup. Google Analytics is not a search
  ranking requirement.
- Do not add `ads.txt` while the site sells no programmatic advertising inventory.

## Manual domain email and DMARC work

Owner action is required in Cloudflare before the repository can publish the branded address.

1. Create and verify a route from `hello@purposelabstudio.com` to the current support inbox.
2. Create and verify a route from `dmarc@purposelabstudio.com` to that inbox or to a dedicated DMARC
   report processor.
3. Confirm that no service currently sends mail with a visible `From:` address at
   `@purposelabstudio.com`.
4. Publish this TXT value at `_dmarc.purposelabstudio.com`:

   `v=DMARC1; p=none; rua=mailto:dmarc@purposelabstudio.com; adkim=s; aspf=s; pct=100`

5. Monitor aggregate reports for at least one week and identify every legitimate sender.
6. If alignment is clean, progress to `p=quarantine; pct=10`, then quarantine at 100%.
7. The final target is:

   `v=DMARC1; p=reject; sp=reject; rua=mailto:dmarc@purposelabstudio.com; adkim=s; aspf=s; pct=100`

Existing SPF and Cloudflare DKIM records must not be replaced without sender evidence. After the
`hello@` route is confirmed, replace the public Gmail address in HTML, JavaScript fallbacks,
structured data, tests, and `llms.txt`.

## Deferred Cloudflare proxy project

Direct GitHub Pages does not expose repository-level control over HSTS, custom security headers, or
long-lived asset caching. A future Cloudflare proxy migration should be handled as a separate
production-infrastructure change with:

- GitHub Pages custom-domain and certificate compatibility verification;
- a reversible DNS and proxy rollout;
- HSTS introduced with a conservative `max-age` before considering subdomains or preload;
- Content-Security-Policy, Referrer-Policy, Permissions-Policy, and related headers tested against
  GoatCounter, Clarity, app-store links, tools, and the Zolio browser trial;
- versioned cache rules for static assets while HTML remains safely revalidatable;
- deployment and purge behavior documented;
- live HTTPS, redirect, certificate, analytics, and rollback checks.

Do not enable HSTS preload or `includeSubDomains` until every present and future subdomain is known
to support HTTPS.

## Authority and backlink work

- The compact press and media surface is published at `/press/` with verified studio facts, founder
  identity, product summaries, stable logos, screenshots, canonical product links, and Support as
  the contact path. Add the branded address after its Cloudflare route is verified.
- Make the calculators, printable blood-pressure log, journaling hub, and sourced guides easy to
  cite with stable titles, visible methodology, sources, and limitations.
- Reclaim relevant unlinked mentions and ensure verified app-store and professional profiles link
  to the canonical website.
- Prioritize editorial outreach to journaling, privacy, indie-app, caregiver, hydration, and
  home-monitoring publishers where an existing resource genuinely helps their audience.
- Track the referring domain, target URL, relevance, link type, outreach status, and resulting
  search or conversion change.
- Do not use bulk directories, paid links, private blog networks, automated guest posts, or
  reciprocal-link schemes.

## Performance experiments

- Re-measure the homepage and one article on mobile and desktop before each experiment.
- Test removing the preload for Fraunces 600 while keeping Fraunces 700. Accept only if LCP or
  bandwidth improves without a visible font swap or layout shift.
- Test starting Clarity after `load` or browser idle. Accept only if user-facing metrics improve
  without materially reducing conversion and support diagnostics.
- Do not inline the shared stylesheet or introduce a third-party asset CDN solely to satisfy a
  generic checker.

## Checker recommendations intentionally rejected

- Fixed 500-word or 800-word minimums for every page.
- Padding titles to 50-60 characters or descriptions to 150-220 characters.
- Repeating every H1 phrase verbatim in body copy.
- Adding address, phone, or `LocalBusiness` data for a non-local online studio.
- Replacing accessible email links with images or fragile obfuscation.
- Adding Google Analytics as a ranking tactic.
- Adding `ads.txt` without advertising sellers.
- Treating normal repeated navigation or CTA labels as duplicate-anchor defects.
- Treating GitHub Pages edge delivery as "no CDN."

These decisions should be revisited only when the business model, hosting platform, mail-sending
behavior, or measured user experience changes.
