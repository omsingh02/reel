/**
 * The public origin used for canonical URLs, structured data and share cards.
 * Set `VITE_SITE_URL` at build time when the site moves to a new domain; every page,
 * index.html, the sitemap and robots.txt follow it, so there is one place to change.
 */
export const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) || 'https://reel.omsingh.me').replace(/\/+$/, '');
