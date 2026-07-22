# Peak Turnover Cleaning

Marketing website for **Peak Turnover Cleaning** — Airbnb / vacation-rental
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
| `vercel.json` | `cleanUrls` + no trailing slash |

## Placeholders to replace before / at launch

- **Phone:** `(719) 555-0100` → search `719) 555-0100` and `+17195550100`
- **Email:** `hello@peakturnovercleaning.com` (also the mailto target in `app.js`)
- **Pricing:** rates on `/pricing` are marked *draft* — confirm real numbers.

The quote forms open the visitor's email app pre-filled to
`hello@peakturnovercleaning.com` (no backend required).

<!-- deploy nudge -->
