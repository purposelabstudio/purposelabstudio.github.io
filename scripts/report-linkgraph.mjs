// Advisory (never fails the build): inbound/outbound link counts, weakest pages,
// question-heading ratio. Input to the human link-approval pass.
import { readFileSync, readdirSync } from 'node:fs';

// Skips top-level build/vendor dirs and ANY dot-directory (.git, .github,
// .superpowers scratch) so local artifacts can never diverge results from CI.
const SKIP = /(^|\/)\.|^(go|docs|node_modules)\//;
const pages = readdirSync('.', { recursive: true })
  .filter((f) => typeof f === 'string' && f.endsWith('.html'))
  .filter((f) => SKIP.test(f) === false && f !== '404.html')
  .map((f) => {
    const html = readFileSync(f, 'utf8');
    const links = [...new Set([...html.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1]))]
      .filter((u) => u.startsWith('/go/') === false);
    const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
    const h2 = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim());
    return {
      url: '/' + f.replace(/index\.html$/, ''),
      links,
      words: text.split(/\s+/).filter(Boolean).length,
      h2: h2.length,
      qh2: h2.filter((t) => t.includes('?')).length,
    };
  });

const inbound = new Map();
for (const p of pages) for (const l of p.links) {
  const k = l.endsWith('/') ? l : l + '/';
  if (k !== p.url) inbound.set(k, (inbound.get(k) ?? 0) + 1);
}
const blogOut = (p) => p.links.filter((l) => l.startsWith('/blog/') && l !== '/blog/').length;

console.log('url,inbound,blog_outbound,words,h2,question_h2');
for (const p of pages.sort((a, b) => (inbound.get(a.url) ?? 0) - (inbound.get(b.url) ?? 0))) {
  console.log([p.url, inbound.get(p.url) ?? 0, blogOut(p), p.words, p.h2, p.qh2].join(','));
}
console.error(`\ntotals: ${pages.length} pages · ${pages.reduce((n, p) => n + blogOut(p), 0)} blog→blog links · ${pages.reduce((n, p) => n + p.qh2, 0)}/${pages.reduce((n, p) => n + p.h2, 0)} question-shaped H2s`);
