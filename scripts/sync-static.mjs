import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

const root = process.cwd();
const publicDirectory = resolve(root, 'public');
const files = [
  'index.html', 'services.html', 'pricing.html', 'areas.html', 'story.html',
  'faq.html', 'contact.html', 'privacy.html', 'terms.html', 'thank-you.html',
  '404.html', 'styles.css', 'app.js', 'robots.txt', 'sitemap.xml',
  'site.webmanifest', 'favicon.ico', 'favicon-16.png', 'favicon-32.png',
  'apple-touch-icon.png', 'brand-icon-96.png', 'brand-icon-192.png',
  'brand-icon-512.png', 'icon.svg', 'og-image.jpg', 'og-image-v2.jpg',
  'og-image-v3.jpg'
];

await rm(publicDirectory, { recursive: true, force: true });
await mkdir(publicDirectory, { recursive: true });
for (const file of files) await run('cp', [resolve(root, file), resolve(publicDirectory, file)]);
await run('cp', ['-R', resolve(root, 'areas'), resolve(publicDirectory, 'areas')]);
await run('cp', ['-R', resolve(root, 'img'), resolve(publicDirectory, 'img')]);
