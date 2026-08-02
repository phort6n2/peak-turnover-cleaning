# High Alpine Cleaning

Marketing website for **High Alpine Cleaning** — Airbnb / vacation-rental
turnover cleaning for the Colorado Springs / greater Pikes Peak region.
Static multi-page site, deployed on Vercel.

## Structure

| File | Page |
|------|------|
| `index.html` | Home (`/`) |
| `services.html` | Services (`/services`) |
| `pricing.html` | Pricing (`/pricing`) |
| `areas.html` | Service Areas (`/areas`) |
| `story.html` | Our Story (`/story`) |
| `faq.html` | FAQ (`/faq`) |
| `contact.html` | Contact (`/contact`) |
| `styles.css` | Shared styles |
| `app.js` | Shared behavior (footer year, mailto quote form) |
| `img/` | Optimized original site photography |
| `vercel.json` | `cleanUrls` + no trailing slash |
| `robots.txt` / `sitemap.xml` | Search crawler discovery |
| `og-image.jpg` | Social sharing preview |
| `site.webmanifest` / `icon.svg` | Installable-site metadata and icon |
| `404.html` | Branded not-found page |

## Search and social metadata

Every public page has a canonical URL, Open Graph metadata, and a large social
share card. The homepage includes LocalBusiness structured data and the FAQ
page includes FAQPage structured data. If the production domain changes,
replace `https://highalpinecleaning.com` across the HTML files,
`robots.txt`, and `sitemap.xml` before launch.

## Production checklist

- **Phone:** `(719) 555-0100` → search `719) 555-0100` and `+17195550100`
- **Email:** confirm `hello@highalpinecleaning.com` receives mail (also the mailto target in `app.js`)
- **Pricing:** confirm the published starting rates on `/pricing`.

Do not launch paid traffic until the placeholder phone is replaced and the
email inbox and pricing are verified. Structured data intentionally omits the
phone and email until those contact details are confirmed.

The quote forms open the visitor's email app pre-filled to
`hello@highalpinecleaning.com` (no backend required). If no email application
opens, the completed request remains visible for one-click copy/paste. For a
future direct-submit flow, connect an email provider or lead store before
changing the form behavior.
