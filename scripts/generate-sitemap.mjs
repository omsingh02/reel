// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml
// and points public/robots.txt at it.
// Plain Node (no Bun/tsx needed): `node scripts/generate-sitemap.mjs`
//
// The site origin comes from VITE_SITE_URL (environment, or a line in .env), the same variable
// the app and index.html use, so a domain change is a one-line edit.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_SITE_URL = "https://wat.lovable.app";

/** Reads VITE_SITE_URL from the environment, falling back to .env files, then the default. */
function resolveSiteUrl() {
  let value = process.env.VITE_SITE_URL;
  for (const file of [".env.local", ".env"]) {
    if (value || !existsSync(file)) continue;
    const match = readFileSync(file, "utf8").match(/^\s*VITE_SITE_URL\s*=\s*"?([^"\r\n#]+?)"?\s*$/m);
    if (match) value = match[1];
  }
  return (value || DEFAULT_SITE_URL).trim().replace(/\/+$/, "");
}

const BASE_URL = resolveSiteUrl();

/**
 * @typedef {Object} SitemapEntry
 * @property {string} path
 * @property {"always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"} [changefreq]
 * @property {string} [priority]
 */

/** @type {SitemapEntry[]} */
const entries = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/movies", changefreq: "daily", priority: "0.9" },
  { path: "/shows", changefreq: "daily", priority: "0.9" },
];

/** @param {SitemapEntry[]} items */
function generateSitemap(items) {
  const urls = items.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);

// Keep robots.txt's Sitemap line in step with the same origin.
const robotsPath = resolve("public/robots.txt");
if (existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, "utf8");
  const next = robots.replace(/^Sitemap:.*$/m, `Sitemap: ${BASE_URL}/sitemap.xml`);
  if (next !== robots) writeFileSync(robotsPath, next);
}
