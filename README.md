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
| `areas.html` / `areas/*.html` | Service-area hub and local landing pages |
| `story.html` | Our Story (`/story`) |
| `faq.html` | FAQ (`/faq`) |
| `contact.html` | Contact (`/contact`) |
| `styles.css` | Shared styles |
| `app.js` | Shared behavior and direct quote-form submission |
| `api/quote.js` | Validated server-side handoff to a HighLevel workflow |
| `img/` | Optimized original site photography |
| `vercel.json` | `cleanUrls` + no trailing slash |
| `robots.txt` / `sitemap.xml` | Search crawler discovery |
| `og-image-v2.jpg` | Social sharing preview |
| `site.webmanifest` / `icon.svg` | Installable-site metadata and icon |
| `privacy.html` / `terms.html` | Public privacy, website, and SMS terms |
| `404.html` | Branded not-found page |

## Search and social metadata

Every public page has a canonical URL, Open Graph metadata, and a large social
share card. The homepage includes LocalBusiness structured data and the FAQ
page includes FAQPage structured data. If the production domain changes,
replace `https://highalpinecleaning.com` across the HTML files,
`robots.txt`, and `sitemap.xml` before launch.

## HighLevel lead workflow

Create a HighLevel workflow with an **Inbound Webhook** trigger, then add its URL
to Vercel as `HIGHLEVEL_WEBHOOK_URL` for Production, Preview, and Development.
Redeploy after adding the variable. See `.env.example` for the expected value.

Map the incoming fields to the contact and opportunity record. Important fields
include `first_name`, `email`, `phone`, `property_address_or_city`,
`bedrooms`, `turnovers_per_month`, `notes`, `page_url`, the UTM fields, and the
three `sms_consent*` fields.

The form always creates the lead, but an SMS workflow must branch on
`sms_consent = true` before sending any text. Preserve the consent text and
timestamp on the contact or opportunity record as proof of opt-in.

## Production checklist

- Confirm `hello@highalpinecleaning.com` receives mail.
- Confirm the published starting rates on `/pricing`.
- Set and test `HIGHLEVEL_WEBHOOK_URL` in Vercel.
- Confirm a form submission creates or updates the expected HighLevel contact.
- Confirm the SMS branch runs only when the optional checkbox is checked.
- Add the HighLevel number-pool tracking script when available. All fallback
  number links use `(719) 377-3123` and the `track-phone` class for replacement.
- Make sure the legal business name, address, website, use case, and sample
  messages in the A2P registration match the real business and deployed pages.

Do not launch paid traffic or SMS automation until the inbox, pricing, form
workflow, STOP/HELP handling, and consent branch have been verified end to end.
