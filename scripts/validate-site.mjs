import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const site = resolve('site');
const html = readFileSync(resolve(site, 'index.html'), 'utf8');
const robots = readFileSync(resolve(site, 'robots.txt'), 'utf8');
const sitemap = readFileSync(resolve(site, 'sitemap.xml'), 'utf8');
const canonical = 'https://nikatsam.github.io/ShelfSearch-Website/';
const storeUrl = 'https://apps.microsoft.com/detail/9MXCMHJT0BZD';
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);

assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique');
assert.equal((html.match(/<h1\b/g) ?? []).length, 1, 'Page must have one primary heading');
assert.match(html, /<html lang="en">/, 'Document language must be declared');
assert(html.includes(`<link rel="canonical" href="${canonical}">`), 'Canonical link must match the configured Pages URL');
assert.match(html, /<meta name="description" content="[^"]{50,160}">/);
assert.match(html, /<meta name="robots" content="index,follow/);

const schemaTag = '<script type="application/ld+json">';
const schemaStart = html.indexOf(schemaTag) + schemaTag.length;
const schemaEnd = html.indexOf('</script>', schemaStart);
const schema = JSON.parse(html.slice(schemaStart, schemaEnd));
assert.equal(schema['@context'], 'https://schema.org');
assert(schema['@graph'].some((item) => item['@type'] === 'SoftwareApplication'));
const software = schema['@graph'].find((item) => item['@type'] === 'SoftwareApplication');
assert.equal(software.installUrl, storeUrl, 'Software schema must link to the live Store listing');
assert(!schema['@graph'].some((item) => item['@type'] === 'BreadcrumbList'), 'Do not add ineligible one-page breadcrumbs');
assert((html.match(new RegExp(`href="${storeUrl}"`, 'g')) ?? []).length >= 5, 'Store download CTA must be available in the navigation, content, and sticky button');
assert.match(html, /class="store-sticky"[^>]*aria-label="Get ShelfSearch from the Microsoft Store"/);
assert(!/release information to come|availability has not been announced/i.test(html), 'Remove obsolete unreleased-product messaging');

const links = [...html.matchAll(/<(?:a|img|script|link)\b[^>]*\b(?:href|src)="([^"]+)"[^>]*>/g)];
for (const [, url] of links) {
  if (url.startsWith('#')) {
    assert(ids.includes(url.slice(1)), `Fragment target does not exist: ${url}`);
  } else if (!/^https?:\/\//i.test(url)) {
    assert(existsSync(resolve(site, url)), `Local asset does not exist: ${url}`);
  }
}
assert([...html.matchAll(/<img\b[^>]*>/g)].every(([tag]) => /\balt="[^"]*"/.test(tag)), 'Every image must have alt text');

assert.match(sitemap, new RegExp(`<loc>${canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>`));
assert.match(robots, /User-agent: \*/);
assert.match(robots, new RegExp(`Sitemap: ${canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}sitemap\\.xml`));

const keyFiles = readdirSync(site).filter((file) => /^[a-f0-9]{32}\.txt$/.test(file));
assert.equal(keyFiles.length, 1, 'Expected one IndexNow key file');
assert.equal(readFileSync(resolve(site, keyFiles[0]), 'utf8').trim(), basename(keyFiles[0], '.txt'));

console.log('Site audit passed: metadata, schema, anchors, local assets, sitemap, robots, and IndexNow key.');
