import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pages = [
  join(root, 'index.html'),
  join(root, '404.html'),
  ...readdirSync(join(root, 'pages')).filter(name => name.endsWith('.html')).map(name => join(root, 'pages', name))
];
const failures = [];

function fail(file, message) {
  failures.push(`${file.replace(`${root}/`, '')}: ${message}`);
}

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const is404 = file.endsWith('/404.html');

  if (!/<title>[^<]+<\/title>/.test(html)) fail(file, 'missing title');
  if (!is404 && !/<meta name="description" content="[^"]+">/.test(html)) fail(file, 'missing meta description');
  if (!is404 && !/<link rel="canonical" href="https:\/\/africaretold\.co\.ke\/[^"]*">/.test(html)) fail(file, 'missing canonical URL');
  if (!is404 && (html.match(/<h1\b/g) || []).length !== 1) fail(file, 'must contain exactly one h1');
  if (!is404 && !/class="skip-link"/.test(html)) fail(file, 'missing skip link');
  if (/href="#"/.test(html)) fail(file, 'contains placeholder link');

  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = match[0];
    if (!/\balt="[^"]*"/.test(tag)) fail(file, `image missing alt: ${tag.slice(0, 100)}`);
    if (!/\bwidth="\d+"/.test(tag) || !/\bheight="\d+"/.test(tag)) fail(file, `image missing dimensions: ${tag.slice(0, 100)}`);
    if (!/\bloading="(?:lazy|eager)"/.test(tag)) fail(file, `image missing loading policy: ${tag.slice(0, 100)}`);
  }

  for (const match of html.matchAll(/<button\b[^>]*>/g)) {
    if (!/\btype="button"|\btype="submit"/.test(match[0])) fail(file, `button missing type: ${match[0]}`);
  }

  for (const match of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:|#)/.test(reference)) continue;
    const path = reference.split(/[?#]/)[0];
    if (path && !existsSync(resolve(dirname(file), path))) fail(file, `missing local resource: ${reference}`);
  }
}

for (const required of ['robots.txt', 'sitemap.xml', 'site.webmanifest', 'vercel.json', 'events.json']) {
  if (!existsSync(join(root, required))) failures.push(`missing required site file: ${required}`);
}

for (const jsonFile of ['events.json', 'site.webmanifest', 'vercel.json']) {
  try {
    JSON.parse(readFileSync(join(root, jsonFile), 'utf8'));
  } catch (error) {
    failures.push(`${jsonFile}: invalid JSON (${error.message})`);
  }
}

if (failures.length) {
  console.error(`Site health check failed with ${failures.length} issue(s):\n${failures.join('\n')}`);
  process.exit(1);
}

console.log(`Site health check passed for ${pages.length} HTML pages.`);
